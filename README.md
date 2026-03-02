# UBMS - Bus Tracking System

A comprehensive real-time bus tracking system built with modern web technologies, featuring separate applications for passengers, drivers, and administrators.

## Project Description

UBMS is a full-stack bus tracking application that enables real-time monitoring of buses, route management, and passenger notifications. The system consists of four main components:

- **Backend API**: Node.js/Express server with MongoDB database
- **Frontend (Passenger App)**: React Native mobile application for passengers
- **Driver App**: React Native mobile application for bus drivers
- **Admin Panel**: React web application for system administration

### Key Features

-  **Real-time GPS tracking** of buses
-  **Interactive maps** with live bus locations
-  **Mobile-first design** for both passengers and drivers
-  **User management** with role-based access (passenger, driver, admin)
-  **Route and pickup point management**
-  **Schedule management** and notifications
-  **Analytics dashboard** for administrators
-  **JWT-based authentication** and authorization
-  **API documentation** with Swagger

##  Technology Stack

### Backend
- **Node.js** with TypeScript
- **Express.js** framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time updates
- **Swagger** for API documentation

### Frontend Applications
- **React Native** with Expo
- **TypeScript**
- **React Native Maps** for location services
- **AsyncStorage** for local data persistence
- **React Navigation** for routing

### Admin Panel
- **React** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation

##  Environment Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud)
- **Expo CLI** for React Native development
- **Git**

### Required Environment Variables

#### Backend (.env)
```env
# Database
MONGODB_URI=mongodb://localhost:27017/ubms
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ubms

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Admin User (Default)
ADMIN_EMAIL=admin@ubms.com
ADMIN_PASSWORD=admin123

# Server
PORT=3001
NODE_ENV=development

# CORS Origins (comma-separated)
CORS_ORIGIN=http://localhost:3000,http://localhost:8081,http://localhost:19006
```

#### Frontend Apps (.env - optional)
```env
# API URL for production builds
API_URL=https://your-backend-url.com/api
```

##  Project Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ubms-bus-tracking.git
cd ubms-bus-tracking
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
cp .env.example .env
# Edit .env with your database URL and other settings

# Start development server
npm run dev

# The backend will be available at http://localhost:3001
# API Documentation: http://localhost:3001/api-docs
```

### 3. Frontend (Passenger App) Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Expo development server
npm start

# Follow Expo instructions to run on iOS/Android simulator or physical device
```

### 4. Driver App Setup

```bash
# Navigate to driver-front directory
cd driver-front

# Install dependencies
npm install

# Start Expo development server
npm start

# Follow Expo instructions to run on iOS/Android simulator or physical device
```

### 5. Admin Panel Setup

```bash
# Navigate to admin directory
cd admin

# Install dependencies
npm install

# Start development server
npm run dev

# Admin panel will be available at http://localhost:3000
```

##  Development Workflow

### Running All Services

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Admin Panel**: `cd admin && npm run dev`
3. **Start Frontend App**: `cd frontend && npm start`
4. **Start Driver App**: `cd driver-front && npm start`

### Default Login Credentials

- **Admin**: `admin@ubms.com` / `admin123`
- **Test Users**: Create through the signup endpoints or admin panel

### API Endpoints

- **Base URL**: `http://localhost:3001/api`
- **Documentation**: `http://localhost:3001/api-docs`
- **Health Check**: `http://localhost:3001/health`

##  Deployment Plan

### Backend Deployment (Render)

1. **Prepare for Production**:
   ```bash
   cd backend
   npm run build
   ```

2. **Deploy to Render**:
   - Connect your GitHub repository to Render
   - Set build command: `npm install && npm run build`
   - Set start command: `npm start`
   - Add environment variables in Render dashboard

3. **Environment Variables for Production**:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ubms
   JWT_SECRET=your-production-jwt-secret
   NODE_ENV=production
   PORT=10000
   ADMIN_EMAIL=admin@ubms.com
   ADMIN_PASSWORD=your-secure-admin-password
   ```

### Frontend Apps Deployment

#### Mobile Apps (Expo)
1. **Build for Production**:
   ```bash
   # For Android
   expo build:android
   
   # For iOS
   expo build:ios
   ```

2. **App Store Deployment**:
   - **Android**: Upload APK to Google Play Store
   - **iOS**: Upload IPA to Apple App Store

#### Admin Panel (Netlify/Vercel)
1. **Build for Production**:
   ```bash
   cd admin
   npm run build
   ```

2. **Deploy to Netlify**:
   - Connect GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variable: `VITE_API_URL=https://your-backend-url.com/api`

### Database Deployment (MongoDB Atlas)

1. **Create MongoDB Atlas Cluster**
2. **Configure Network Access** (IP Whitelist)
3. **Create Database User**
4. **Update Connection String** in production environment

### Production Configuration

#### Update API URLs
Update the following files for production:
- `frontend/config/api.ts`
- `driver-front/config/api.ts`  
- `admin/src/services/api.ts`

Replace localhost URLs with your deployed backend URL.

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend App  │    │   Driver App    │    │   Admin Panel   │
│  (React Native) │    │  (React Native) │    │     (React)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                         ┌───────▼───────┐
                         │  Backend API  │
                         │ (Node.js/TS)  │
                         └───────┬───────┘
                                 │
                         ┌───────▼───────┐
                         │   MongoDB     │
                         │   Database    │
                         └───────────────┘
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
Use the Swagger documentation at `/api-docs` for interactive API testing.

## 📱 App Features

### Passenger App
- View real-time bus locations
- Search and filter routes
- Set pickup preferences
- Receive notifications
- Track bus arrival times

### Driver App
- Update bus location in real-time
- View assigned routes and schedules
- Manage online/offline status
- View passenger information

### Admin Panel
- Manage users (passengers, drivers, admins)
- Create and edit bus routes
- Monitor system statistics
- Configure pickup points
- Schedule management

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Support

For support, email support@ubms.com or create an issue in the GitHub repository.

##  Links

- **Backend API**: https://capstone1-60ax.onrender.com
- **API Documentation**: https://capstone1-60ax.onrender.com/api-docs
- **Admin Panel**: [Your deployed admin URL]
- **GitHub Repository**: [Your repository URL]

---
