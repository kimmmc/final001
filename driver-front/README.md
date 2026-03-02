# UBMS Driver App

A comprehensive React Native driver application for the UBMS bus tracking system, built with Expo and TypeScript.

## Features

### Driver Dashboard
- **Real-time Status**: Online/offline toggle with location tracking
- **Bus Information**: View assigned bus details, capacity, and route
- **Performance Metrics**: Today's trips, passenger count, and earnings
- **Quick Actions**: Update location, start trips, and manage passengers

### Location Tracking
- **GPS Integration**: Real-time location sharing with passengers
- **Status Management**: Control when location is shared
- **Map Integration**: Visual representation of current location
- **Accuracy Monitoring**: Location accuracy and update timestamps

### Passenger Management
- **Interest Tracking**: View passengers interested in your bus
- **Contact Information**: Access passenger details for communication
- **Status Updates**: Track confirmed vs interested passengers
- **Pickup Points**: See where passengers want to board

### Bus Management
- **Vehicle Details**: Complete bus information and specifications
- **Route Information**: Assigned route and schedule details
- **Performance Analytics**: Trip completion and passenger metrics
- **Maintenance Status**: Bus condition and availability

### Driver Features
- **Schedule Management**: View upcoming trips and schedules
- **Real-time Updates**: Update arrival times and trip status
- **Passenger Communication**: Contact interested passengers
- **Earnings Tracking**: Monitor daily and trip-based earnings

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Maps**: React Native Maps with Google Maps
- **Location**: Expo Location
- **Storage**: AsyncStorage
- **Icons**: Lucide React Native

## Installation and Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd driver-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Update API endpoints in `config/api.ts`
   - Ensure backend is running on correct port

4. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Web version
   npm run build:web
   ```

## Project Structure

```
driver-front/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation
│   │   ├── index.tsx      # Dashboard
│   │   ├── location.tsx   # Location tracking
│   │   ├── passengers.tsx # Passenger management
│   │   ├── bus.tsx        # Bus information
│   │   └── settings.tsx   # Driver settings
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── contexts/              # React contexts
│   ├── AuthContext.tsx    # Driver authentication
│   ├── ThemeContext.tsx   # Theme management
│   └── LocationContext.tsx # Location services
├── hooks/                 # Custom hooks
│   └── useDriverData.ts   # Driver-specific data
├── services/              # API services
│   └── api.ts            # Backend communication
└── config/               # Configuration
    └── api.ts            # API endpoints
```

## Key Features

### Authentication
- **Driver-only Access**: Restricted to users with driver role
- **Secure Login**: JWT-based authentication
- **Session Management**: Persistent login with token validation

### Real-time Tracking
- **Location Updates**: Continuous GPS tracking when online
- **Passenger Visibility**: Share location with interested passengers
- **Route Monitoring**: Track progress along assigned routes

### Communication
- **Passenger Interests**: View who wants to board your bus
- **Contact Details**: Access passenger phone and email
- **Status Updates**: Confirm or manage passenger requests

### Performance Monitoring
- **Trip Analytics**: Track completed vs scheduled trips
- **Earnings Calculation**: Estimate daily and trip earnings
- **Passenger Metrics**: Monitor interest and confirmation rates

## API Integration

The driver app integrates with the same backend as the passenger app:

- **Authentication**: Driver login and profile management
- **Bus Management**: Assigned bus information and status
- **Location Services**: Real-time location updates
- **Schedule Management**: Trip schedules and timing
- **Passenger Data**: Interested passenger information

## Security Features

- **Role-based Access**: Only drivers can access the app
- **Secure Authentication**: JWT tokens with validation
- **Data Protection**: Encrypted communication with backend
- **Permission Management**: Location and notification permissions

## Development

### Adding New Features
1. Create new screens in `app/` directory
2. Add navigation routes in `_layout.tsx`
3. Implement API calls in `services/api.ts`
4. Create custom hooks for data management
5. Update contexts for shared state

### Testing
- Test on both iOS and Android devices
- Verify location accuracy and updates
- Test offline/online status changes
- Validate passenger data display

## Deployment

### Mobile Deployment
1. Build the app using Expo
2. Submit to App Store and Google Play
3. Configure production API endpoints
4. Set up push notifications

### Web Deployment
1. Build web version with `npm run build:web`
2. Deploy to web hosting service
3. Configure web-specific features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request
5. Ensure code quality and documentation

## License

This project is licensed under the MIT License.