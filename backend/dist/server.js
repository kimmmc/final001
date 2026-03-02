"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
const http_1 = require("http");
const database_1 = __importDefault(require("./config/database"));
const swagger_1 = require("./config/swagger");
const createAdmin_1 = require("./utils/createAdmin");
const seedData_1 = require("./utils/seedData");
const migrateDirectionData_1 = require("./utils/migrateDirectionData");
const updateBusLocations_1 = require("./utils/updateBusLocations");
const locationScheduler_1 = require("./utils/locationScheduler");
const socketService_1 = __importDefault(require("./services/socketService"));
const auth_1 = __importDefault(require("./routes/auth"));
const buses_1 = __importDefault(require("./routes/buses"));
const routes_1 = __importDefault(require("./routes/routes"));
const pickupPoints_1 = __importDefault(require("./routes/pickupPoints"));
const busSchedules_1 = __importDefault(require("./routes/busSchedules"));
const userInterests_1 = __importDefault(require("./routes/userInterests"));
const users_1 = __importDefault(require("./routes/users"));
const busLocations_1 = __importDefault(require("./routes/busLocations"));
const predictions_1 = __importDefault(require("./routes/predictions"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const PORT = process.env.PORT || 3001;
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later.',
});
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin)
            return callback(null, true);
        const allowedOrigins = [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:8081",
            "http://localhost:19006",
            "http://localhost:19000",
            "exp://localhost:19000",
            "exp://192.168.1.100:19000",
            "capacitor://localhost",
            "http://localhost",
            "https://localhost",
        ];
        if (process.env.CORS_ORIGIN) {
            allowedOrigins.push(...process.env.CORS_ORIGIN.split(','));
        }
        const isAllowed = allowedOrigins.includes(origin) ||
            (origin && origin.includes('localhost')) ||
            (origin && origin.includes('192.168.')) ||
            (origin && origin.includes('10.0.')) ||
            (origin && origin.includes('172.16.'));
        if (isAllowed) {
            callback(null, true);
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
}));
app.use((0, cors_1.default)(corsOptions));
app.use(limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
        next();
    });
}
app.use('/api-docs', swagger_1.swaggerUi.serve, swagger_1.swaggerUi.setup(swagger_1.specs));
app.use('/api/auth', auth_1.default);
app.use('/api/buses', buses_1.default);
app.use('/api/routes', routes_1.default);
app.use('/api/pickup-points', pickupPoints_1.default);
app.use('/api/bus-schedules', busSchedules_1.default);
app.use('/api/user-interests', userInterests_1.default);
app.use('/api/users', users_1.default);
app.use('/api/bus-locations', busLocations_1.default);
app.use('/api', predictions_1.default);
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'UBMS Backend API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        port: PORT
    });
});
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to UBMS Bus Tracking API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health'
    });
});
app.get('/api/stats', async (req, res) => {
    try {
        const Bus = (await Promise.resolve().then(() => __importStar(require('./models/Bus')))).default;
        const Route = (await Promise.resolve().then(() => __importStar(require('./models/Route')))).default;
        const User = (await Promise.resolve().then(() => __importStar(require('./models/User')))).default;
        const BusSchedule = (await Promise.resolve().then(() => __importStar(require('./models/BusSchedule')))).default;
        const PickupPoint = (await Promise.resolve().then(() => __importStar(require('./models/PickupPoint')))).default;
        const UserInterest = (await Promise.resolve().then(() => __importStar(require('./models/UserInterest')))).default;
        const stats = {
            buses: await Bus.countDocuments(),
            routes: await Route.countDocuments(),
            users: await User.countDocuments(),
            schedules: await BusSchedule.countDocuments(),
            pickupPoints: await PickupPoint.countDocuments(),
            userInterests: await UserInterest.countDocuments(),
        };
        res.json({ stats });
    }
    catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
app.post('/api/update-bus-locations', async (req, res) => {
    try {
        await (0, updateBusLocations_1.updateBusLocations)();
        res.json({ message: 'Bus locations updated successfully' });
    }
    catch (error) {
        console.error('Update bus locations error:', error);
        res.status(500).json({ error: 'Failed to update bus locations' });
    }
});
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route not found',
        message: `The route ${req.method} ${req.originalUrl} does not exist`,
    });
});
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(error.status || 500).json({
        error: error.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
});
const startServer = async () => {
    try {
        await (0, database_1.default)();
        await (0, createAdmin_1.createAdminUser)();
        await (0, seedData_1.seedDatabase)();
        await (0, migrateDirectionData_1.migrateDirectionData)();
        await (0, updateBusLocations_1.updateBusLocations)();
        const Bus = (await Promise.resolve().then(() => __importStar(require('./models/Bus')))).default;
        const Route = (await Promise.resolve().then(() => __importStar(require('./models/Route')))).default;
        const User = (await Promise.resolve().then(() => __importStar(require('./models/User')))).default;
        const UserInterest = (await Promise.resolve().then(() => __importStar(require('./models/UserInterest')))).default;
        const busCount = await Bus.countDocuments();
        const routeCount = await Route.countDocuments();
        const userCount = await User.countDocuments();
        const interestCount = await UserInterest.countDocuments();
        console.log(`📊 Database Status:`);
        console.log(`   - Buses: ${busCount}`);
        console.log(`   - Routes: ${routeCount}`);
        console.log(`   - Users: ${userCount}`);
        console.log(`   - User Interests: ${interestCount}`);
        socketService_1.default.initialize(server);
        (0, locationScheduler_1.startLocationScheduler)();
        (0, locationScheduler_1.startLocationHistoryCleanup)();
        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
            console.log(`📊 Stats endpoint: http://localhost:${PORT}/api/stats`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
            console.log(`📱 CORS enabled for mobile development`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
