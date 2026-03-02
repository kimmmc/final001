import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, getApiUrl } from '@/config/api';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiUrl();
    console.log('Driver API Service initialized with URL:', this.baseURL);
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('driver_authToken');
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
      ...options,
    };

    const url = `${this.baseURL}${endpoint}`;
    console.log(`Driver API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Driver API Error: ${response.status}`, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Driver API Response: ${options.method || 'GET'} ${endpoint}`, data);
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

  async logout() {
    try {
      // Call backend logout endpoint if it exists
      await this.request<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // If logout endpoint doesn't exist or fails, that's okay
      // The main logout happens client-side
      console.log('Backend logout endpoint not available or failed:', error);
    }
  }

  // Driver-specific endpoints
  async getDriverBus() {
    return this.request<{
      bus: {
        _id: string;
        plateNumber: string;
        capacity: number;
        fare: number;
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
    }>('/buses/driver/my-bus');
  }

  async checkDriverBusAssignment() {
    return this.request<{
      bus?: any;
      message?: string;
      error?: string;
      driverId?: string;
      availableBuses?: any[];
    }>('/buses/driver/check-assignment');
  }

  async updateBusLocation(busId: string, latitude: number, longitude: number, speed: number = 0, heading: number = 0, accuracy: number = 0) {
    return this.request<{
      message: string;
      bus: any;
    }>('/bus-locations/update', {
      method: 'POST',
      body: JSON.stringify({ busId, latitude, longitude, speed, heading, accuracy }),
    });
  }

  async setDriverOnlineStatus(busId: string, isOnline: boolean) {
    return this.request<{
      message: string;
    }>('/bus-locations/driver/status', {
      method: 'POST',
      body: JSON.stringify({ busId, isOnline }),
    });
  }

  async getDriverSchedules() {
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
    }>('/bus-schedules/driver/my-schedules');
  }

  async getInterestedPassengers(scheduleId: string) {
    return this.request<{
      interests: Array<{
        _id: string;
        userId: any;
        busScheduleId: any;
        pickupPointId: any;
        status: string;
        createdAt: Date;
      }>;
    }>(`/bus-schedules/${scheduleId}/interested-users`);
  }

  async updateUserInterestStatus(interestId: string, status: 'confirmed' | 'cancelled') {
    return this.request<{
      message: string;
      interest: any;
    }>(`/bus-schedules/interests/${interestId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  async startTrip(scheduleId: string, direction?: 'outbound' | 'inbound') {
    return this.request<{
      message: string;
      schedule: any;
      cleanedInterests: number;
    }>('/bus-schedules/start-trip', {
      method: 'POST',
      body: JSON.stringify({ scheduleId, direction }),
    });
  }

  async endTrip(scheduleId: string) {
    return this.request<{
      message: string;
      deletedInterests: number;
      scheduleDeleted: boolean;
    }>('/bus-schedules/end-trip', {
      method: 'POST',
      body: JSON.stringify({ scheduleId }),
    });
  }


  async updateArrivalTime(scheduleId: string, pickupPointId: string, actualTime: Date) {
    return this.request<{
      message: string;
      schedule: any;
    }>(`/bus-schedules/${scheduleId}/arrival`, {
      method: 'PATCH',
      body: JSON.stringify({ pickupPointId, actualTime }),
    });
  }

  // General endpoints that drivers might need
  async getBuses() {
    return this.request<{
      buses: Array<{
        _id: string;
        plateNumber: string;
        capacity: number;
        fare: number;
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

  async getRoutes() {
    return this.request<{
      routes: Array<{
        _id: string;
        name: string;
        description: string;
        pickupPoints: any[];
        estimatedDuration: number;
        fare: number;
        isActive: boolean;
      }>;
    }>('/routes');
  }

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


}

export const apiService = new ApiService();