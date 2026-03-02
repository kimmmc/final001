import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  // Backend API URL - adjust based on your environment
  BASE_URL: Platform.select({
    ios: 'http://192.168.1.91:5001/api',
    android: 'http://10.0.2.2:5001/api',
    web: 'http://localhost:5001/api',
    default: 'http://localhost:5001/api',
  }),

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Environment-specific configurations
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL || 'http://localhost:5001/api';
};