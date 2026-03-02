import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import 'express-async-errors';
import { createServer } from 'http';

import connectDB from './config/database';
import { specs, swaggerUi } from './config/swagger';
import { createAdminUser } from './utils/createAdmin';
import { seedDatabase } from './utils/seedData';
import { migrateDirectionData } from './utils/migrateDirectionData';
import { updateBusLocations } from './utils/updateBusLocations';
import { startLocationScheduler, startLocationHistoryCleanup } from './utils/locationScheduler';
import socketService from './services/socketService';

// Import routes
import authRoutes from './routes/auth';
import busRoutes from './routes/buses';
import routeRoutes from './routes/routes';
import pickupPointRoutes from './routes/pickupPoints';
import busScheduleRoutes from './routes/busSchedules';
import userInterestRoutes from './routes/userInterests';
import userRoutes from './routes/users';
import busLocationRoutes from './routes/busLocations';
import predictionRoutes from './routes/predictions';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Increased limit for development
  message: 'Too many requests from this IP, please try again later.',
});

// CORS configuration for mobile app
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      "http://localhost:3000",  // Admin frontend
      "http://localhost:3001",  // Backend
      "http://localhost:8081",  // React Native Metro bundler
      "http://localhost:19006", // Expo web
      "http://localhost:19000", // Expo DevTools
      "exp://localhost:19000",  // Expo app
      "exp://192.168.1.100:19000", // Expo app (network)
      "capacitor://localhost",  // Capacitor apps
      "http://localhost",       // Generic localhost
      "https://localhost",      // Generic localhost HTTPS
    ];

    // Add any additional origins from environment variable
    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(...process.env.CORS_ORIGIN.split(','));
    }

    // Check if origin is in allowed list or if it's a localhost variant
    const isAllowed = allowedOrigins.includes(origin) ||
      (origin && origin.includes('localhost')) ||
      (origin && origin.includes('192.168.')) ||
      (origin && origin.includes('10.0.')) ||
      (origin && origin.includes('172.16.'));

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Disable for development
}));
app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/pickup-points', pickupPointRoutes);
app.use('/api/bus-schedules', busScheduleRoutes);
app.use('/api/user-interests', userInterestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bus-locations', busLocationRoutes);
app.use('/api', predictionRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'UBMS Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    port: PORT
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to UBMS Bus Tracking API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health'
  });
});

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const Bus = (await import('./models/Bus')).default;
    const Route = (await import('./models/Route')).default;
    const User = (await import('./models/User')).default;
    const BusSchedule = (await import('./models/BusSchedule')).default;
    const PickupPoint = (await import('./models/PickupPoint')).default;
    const UserInterest = (await import('./models/UserInterest')).default;

    const stats = {
      buses: await Bus.countDocuments(),
      routes: await Route.countDocuments(),
      users: await User.countDocuments(),
      schedules: await BusSchedule.countDocuments(),
      pickupPoints: await PickupPoint.countDocuments(),
      userInterests: await UserInterest.countDocuments(),
    };

    res.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Update bus locations endpoint (for testing)
app.post('/api/update-bus-locations', async (req, res) => {
  try {
    await updateBusLocations();
    res.json({ message: 'Bus locations updated successfully' });
  } catch (error) {
    console.error('Update bus locations error:', error);
    res.status(500).json({ error: 'Failed to update bus locations' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);

  res.status(error.status || 500).json({
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create admin user if not exists
    await createAdminUser();

    // Enable database seeding to ensure we have test data
    await seedDatabase();

    // Migrate existing data to include direction information
    await migrateDirectionData();

    // Update bus locations to be recent and in Rwanda
    await updateBusLocations();

    // Check existing data in database
    const Bus = (await import('./models/Bus')).default;
    const Route = (await import('./models/Route')).default;
    const User = (await import('./models/User')).default;
    const UserInterest = (await import('./models/UserInterest')).default;

    const busCount = await Bus.countDocuments();
    const routeCount = await Route.countDocuments();
    const userCount = await User.countDocuments();
    const interestCount = await UserInterest.countDocuments();

    console.log(`📊 Database Status:`);
    console.log(`   - Buses: ${busCount}`);
    console.log(`   - Routes: ${routeCount}`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - User Interests: ${interestCount}`);

    // Initialize WebSocket service
    socketService.initialize(server);

    // Start background schedulers
    startLocationScheduler();
    startLocationHistoryCleanup();

    server.listen(PORT as number, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
      console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/stats`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📱 CORS enabled for mobile development`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;