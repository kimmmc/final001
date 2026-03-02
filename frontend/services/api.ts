import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getApiUrl } from '@/config/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiUrl();
    console.log('API Service initialized with URL:', this.baseURL);
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      timeout: API_CONFIG.TIMEOUT,
      ...options,
    };

    const url = `${this.baseURL}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`API Error: ${response.status}`, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response: ${options.method || 'GET'} ${endpoint}`, data);
    return data;
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{
      message: string;
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
      };
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(name: string, email: string, phone: string, password: string) {
    return this.request<{
      message: string;
      token: string;
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
      };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });
  }

  async getProfile() {
    return this.request<{
      user: {
        id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
      };
    }>('/auth/profile');
  }

  // Buses - using your existing database data
  async getBuses() {
    return this.request<{
      buses: Array<{
        _id: string;
        plateNumber: string;
        capacity: number;
        driverId: any;
        routeId: any;
        currentLocation: {
          latitude: number | null;
          longitude: number | null;
          lastUpdated: Date | null;
          speed: number;
          heading: number;
        };
        isActive: boolean;
        isOnline: boolean;
      }>;
    }>('/buses');
  }

  async getBusById(id: string) {
    return this.request<{
      bus: {
        _id: string;
        plateNumber: string;
        capacity: number;
        driverId: any;
        routeId: any;
        currentLocation: {
          latitude: number | null;
          longitude: number | null;
          lastUpdated: Date | null;
          speed: number;
          heading: number;
        };
        isActive: boolean;
        isOnline: boolean;
      };
    }>(`/buses/${id}`);
  }

  // Bus Locations - using your existing database data
  async getAllBusLocations(routeId?: string, isOnline?: boolean) {
    const params = new URLSearchParams();
    if (routeId) params.append('routeId', routeId);
    if (isOnline !== undefined) params.append('isOnline', isOnline.toString());
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{
      buses: Array<{
        id: string;
        plateNumber: string;
        driver: any;
        route: any;
        currentLocation: {
          latitude: number | null;
          longitude: number | null;
          lastUpdated: Date | null;
          speed: number;
          heading: number;
        };
        isOnline: boolean;
        lastSeen: Date | null;
      }>;
    }>(`/bus-locations${query}`);
  }

  async getBusLocation(busId: string) {
    return this.request<{
      bus: {
        id: string;
        plateNumber: string;
        driver: any;
        route: any;
        currentLocation: {
          latitude: number | null;
          longitude: number | null;
          lastUpdated: Date | null;
          speed: number;
          heading: number;
        };
        isOnline: boolean;
        lastSeen: Date | null;
      };
    }>(`/bus-locations/${busId}`);
  }

  async getNearbyBuses(latitude: number, longitude: number, radius: number = 5) {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radius: radius.toString(),
    });
    
    return this.request<{
      buses: Array<{
        id: string;
        plateNumber: string;
        driver: any;
        route: any;
        currentLocation: {
          latitude: number | null;
          longitude: number | null;
          lastUpdated: Date | null;
          speed: number;
          heading: number;
        };
        distance: number;
        isOnline: boolean;
      }>;
    }>(`/bus-locations/nearby/search?${params.toString()}`);
  }

  // Routes - using your existing database data
  async getRoutes() {
    return this.request<{
      routes: Array<{
        _id: string;
        name: string;
        description: string;
        pickupPoints: any[];
        estimatedDuration: number;
        isActive: boolean;
      }>;
    }>('/routes');
  }

  async getRouteById(id: string) {
    return this.request<{
      route: {
        _id: string;
        name: string;
        description: string;
        pickupPoints: any[];
        estimatedDuration: number;
        isActive: boolean;
      };
    }>(`/routes/${id}`);
  }

  // Pickup Points - using your existing database data
  async getPickupPoints(routeId?: string) {
    const params = routeId ? `?routeId=${routeId}` : '';
    return this.request<{
      pickupPoints: Array<{
        _id: string;
        name: string;
        description: string;
        latitude: number;
        longitude: number;
        routeId: string;
        order: number;
        isActive: boolean;
      }>;
    }>(`/pickup-points${params}`);
  }

  // Bus Schedules - using your existing database data
  async getBusSchedules(status?: string, routeId?: string, date?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (routeId) params.append('routeId', routeId);
    if (date) params.append('date', date);
    
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.request<{
      schedules: Array<{
        _id: string;
        busId: any;
        routeId: any;
        departureTime: Date;
        estimatedArrivalTimes: Array<{
          pickupPointId: any;
          estimatedTime: Date;
          actualTime?: Date;
        }>;
        status: string;
      }>;
    }>(`/bus-schedules${query}`);
  }

  async getBusScheduleById(id: string) {
    return this.request<{
      schedule: {
        _id: string;
        busId: any;
        routeId: any;
        departureTime: Date;
        estimatedArrivalTimes: Array<{
          pickupPointId: any;
          estimatedTime: Date;
          actualTime?: Date;
        }>;
        status: string;
      };
    }>(`/bus-schedules/${id}`);
  }

  // User Interests - using your existing database data
  async getUserInterests() {
    return this.request<{
      interests: Array<{
        _id: string;
        userId: string;
        busScheduleId: any;
        pickupPointId: any;
        status: string;
        createdAt: Date;
      }>;
    }>('/user-interests');
  }

  async createUserInterest(busScheduleId: string, pickupPointId: string) {
    return this.request<{
      message: string;
      interest: {
        _id: string;
        userId: string;
        busScheduleId: any;
        pickupPointId: any;
        status: string;
      };
    }>('/user-interests', {
      method: 'POST',
      body: JSON.stringify({ busScheduleId, pickupPointId }),
    });
  }

  async updateUserInterest(id: string, status: string) {
    return this.request<{
      message: string;
      interest: {
        _id: string;
        userId: string;
        busScheduleId: any;
        pickupPointId: any;
        status: string;
      };
    }>(`/user-interests/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUserInterest(id: string) {
    return this.request<{
      message: string;
    }>(`/user-interests/${id}`, {
      method: 'DELETE',
    });
  }

  // Database stats (development only)
  async getStats() {
    return this.request<{
      stats: {
        buses: number;
        routes: number;
        users: number;
        schedules: number;
        pickupPoints: number;
      };
    }>('/stats');
  }

  // Traffic Prediction
  async predictTraffic(data: {
    Hour: number;
    Day_of_Week: string;
    Road_Name: string;
    Population_Density: string;
    Rainfall: string;
    Public_Holiday: string;
  }) {
    return this.request<{
      prediction: string;
      confidence: number;
      description: string;
      recommendations: string[];
      analysis: {
        time: string;
        road: string;
        conditions: string;
        timestamp: string;
      };
      probabilities?: Record<string, number>;
    }>('/predict-traffic', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();