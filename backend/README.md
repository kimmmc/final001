# UBMS Bus Tracking Backend

A comprehensive Node.js backend API for the UBMS bus tracking mobile application built with TypeScript, Express.js, and MongoDB.

## Features

### User Management

- **Authentication**: JWT-based authentication with role-based access control
- **User Roles**: Support for three user types - `user`, `driver`, and `admin`
- **Signup/Login**: Secure user registration and login endpoints

### Bus Management

- **Bus CRUD**: Full CRUD operations for bus management
- **Driver Assignment**: Assign drivers to buses
- **Route Assignment**: Assign buses to specific routes

### Route Management

- **Route Planning**: Create and manage bus routes
- **Pickup Points**: Define pickup points along routes with GPS coordinates
- **Estimated Duration**: Set estimated journey times for routes

### Schedule Management

- **Bus Schedules**: Create and manage bus departure schedules
- **Real-time Updates**: Drivers can update actual arrival times
- **Status Tracking**: Track bus status (scheduled, in-transit, completed, cancelled)

### User Interest System

- **Show Interest**: Users can express interest in specific bus schedules
- **Pickup Point Selection**: Users can specify their preferred pickup points
- **Interest Management**: Users can manage their interests (confirm, cancel)

### Admin Dashboard Capabilities

- **User Management**: Control all users and drivers
- **Bus Fleet Management**: Manage entire bus fleet
- **Route Planning**: Create and modify routes and pickup points
- **Schedule Oversight**: Monitor all bus schedules
- **Interest Analytics**: View user interests and pickup patterns

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Buses

- `GET /api/buses` - Get all buses
- `POST /api/buses` - Create new bus (Admin only)
- `GET /api/buses/:id` - Get bus by ID
- `PUT /api/buses/:id` - Update bus (Admin only)
- `DELETE /api/buses/:id` - Delete bus (Admin only)

### Routes

- `GET /api/routes` - Get all routes
- `POST /api/routes` - Create new route (Admin only)
- `GET /api/routes/:id` - Get route by ID
- `PUT /api/routes/:id` - Update route (Admin only)
- `DELETE /api/routes/:id` - Delete route (Admin only)

### Pickup Points

- `GET /api/pickup-points` - Get all pickup points
- `POST /api/pickup-points` - Create pickup point (Admin only)
- `GET /api/pickup-points/:id` - Get pickup point by ID
- `PUT /api/pickup-points/:id` - Update pickup point (Admin only)
- `DELETE /api/pickup-points/:id` - Delete pickup point (Admin only)

### Bus Schedules

- `GET /api/bus-schedules` - Get all schedules
- `POST /api/bus-schedules` - Create schedule (Admin/Driver)
- `GET /api/bus-schedules/:id` - Get schedule by ID
- `PUT /api/bus-schedules/:id` - Update schedule (Admin/Driver)
- `PATCH /api/bus-schedules/:id/arrival` - Update arrival time (Driver only)
- `GET /api/bus-schedules/:id/interested-users` - Get interested users (Driver/Admin)
- `DELETE /api/bus-schedules/:id` - Cancel schedule (Admin only)

### User Interests

- `GET /api/user-interests` - Get user's interests
- `POST /api/user-interests` - Show interest in bus
- `PUT /api/user-interests/:id` - Update interest status
- `DELETE /api/user-interests/:id` - Cancel interest

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi for request validation
- **Documentation**: Swagger/OpenAPI 3.0
- **Security**: Helmet, CORS, Rate limiting
- **Password Hashing**: bcryptjs

## Installation and Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ubms-backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or update the connection string in `.env`

5. **Run the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm run build
   npm start
   ```

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- **Swagger UI**: `http://localhost:3000/api-docs`

## Default Admin Credentials

On first run, an admin user is automatically created:

- **Email**: `admin@ubms.com`
- **Password**: `admin123`

_Make sure to change these credentials in production!_

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── server.ts       # Main application file
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for users, drivers, and admins
- **Password Hashing**: bcryptjs for secure password storage
- **Rate Limiting**: Protection against API abuse
- **Input Validation**: Joi validation for all API endpoints
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers for Express apps

## Error Handling

The API includes comprehensive error handling with:

- Proper HTTP status codes
- Descriptive error messages
- Validation error details
- Development vs production error responses

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
