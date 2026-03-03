import { Platform } from 'react-native';

// API Configuration for Driver App
export const API_CONFIG = {
  // Backend API URL - using production backend
  BASE_URL: Platform.select({
    ios: 'https://final001-1.onrender.com/api',
    android: 'https://final001-1.onrender.com/api',
    web: 'https://final001-1.onrender.com/api',
    default: 'https://final001-1.onrender.com/api',
  }),

  // Request timeout in milliseconds
  TIMEOUT: 10000,

  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Environment-specific configurations
export const getApiUrl = () => {
  return API_CONFIG.BASE_URL || 'https://final001-1.onrender.com/api';
};