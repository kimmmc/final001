class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'https://final001-1.onrender.com/api';
    console.log('Admin API Service initialized with URL:', this.baseURL);
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem('admin_authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const url = `${this.baseURL}${endpoint}`;
    console.log(`Admin API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Admin API Error: ${response.status}`, errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Admin API Response: ${options.method || 'GET'} ${endpoint}`, data);
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

  // Users Management
  async getUsers(params?: { role?: string; isActive?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{
      users: Array<{
        _id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
        isActive: boolean;
        createdAt: string;
      }>;
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/users${query}`);
  }

  async getUserById(id: string) {
    return this.request<{
      user: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
        isActive: boolean;
        createdAt: string;
      };
    }>(`/users/${id}`);
  }

  async updateUserStatus(id: string, isActive: boolean) {
    return this.request<{
      message: string;
      user: any;
    }>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  }

  async updateUserRole(id: string, role: string) {
    return this.request<{
      message: string;
      user: any;
    }>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(id: string) {
    return this.request<{
      message: string;
    }>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async getUserStats() {
    return this.request<{
      stats: {
        activeUsers: number;
        activeDrivers: number;
        activeAdmins: number;
        inactiveUsers: number;
        totalUsers: number;
      };
    }>('/users/stats');
  }

  async getWeeklyActivity() {
    return this.request<{
      weeklyData: Array<{
        name: string;
        users: number;
        schedules: number;
        interests: number;
        trips: number;
      }>;
    }>('/users/weekly-activity');
  }

  async getRecentActivity(limit: number = 10) {
    return this.request<{
      activities: Array<{
        type: string;
        action: string;
        text: string;
        time: string;
        icon: string;
      }>;
    }>(`/users/recent-activity?limit=${limit}`);
  }

  async getDrivers(params?: { isActive?: boolean; page?: number; limit?: number }) {
    const searchParams = new URLSearchParams();
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{
      drivers: Array<{
        _id: string;
        name: string;
        email: string;
        phone: string;
        role: string;
        isActive: boolean;
        createdAt: string;
      }>;
      pagination?: {
        currentPage: number;
        totalPages: number;
        totalDrivers: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    }>(`/users/drivers${query}`);
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
    }>('/buses/admin/all'); // Use admin endpoint to get all buses including offline
  }

  async createBus(data: {
    plateNumber: string;
    capacity: number;
    driverId: string;
    routeId: string;
  }) {
    return this.request<{
      message: string;
      bus: any;
    }>('/buses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBus(id: string, data: {
    plateNumber: string;
    capacity: number;
    driverId: string;
    routeId: string;
  }) {
    return this.request<{
      message: string;
      bus: any;
    }>(`/buses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBus(id: string) {
    return this.request<{
      message: string;
    }>(`/buses/${id}`, {
      method: 'DELETE',
    });
  }

  // Routes Management
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
        createdAt: string;
      }>;
    }>('/routes');
  }

  async createRoute(data: {
    name: string;
    description?: string;
    estimatedDuration: number;
    fare?: number;
  }) {
    return this.request<{
      message: string;
      route: any;
    }>('/routes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoute(id: string, data: {
    name?: string;
    description?: string;
    estimatedDuration?: number;
    fare?: number;
  }) {
    return this.request<{
      message: string;
      route: any;
    }>(`/routes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoute(id: string) {
    return this.request<{
      message: string;
    }>(`/routes/${id}`, {
      method: 'DELETE',
    });
  }

  // Pickup Points Management
  async getPickupPoints(routeId?: string) {
    const query = routeId ? `?routeId=${routeId}` : '';
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
        createdAt: string;
      }>;
    }>(`/pickup-points${query}`);
  }

  async createPickupPoint(data: {
    name: string;
    description?: string;
    latitude: number;
    longitude: number;
    routeId: string;
    order: number;
  }) {
    return this.request<{
      message: string;
      pickupPoint: any;
    }>('/pickup-points', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePickupPoint(id: string, data: {
    name?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    order?: number;
  }) {
    return this.request<{
      message: string;
      pickupPoint: any;
    }>(`/pickup-points/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePickupPoint(id: string) {
    return this.request<{
      message: string;
    }>(`/pickup-points/${id}`, {
      method: 'DELETE',
    });
  }

  // Bus Schedules Management
  async getBusSchedules(params?: { status?: string; routeId?: string; date?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.routeId) searchParams.append('routeId', params.routeId);
    if (params?.date) searchParams.append('date', params.date);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return this.request<{
      schedules: Array<{
        _id: string;
        busId: any;
        routeId: any;
        departureTime: string;
        estimatedArrivalTimes: Array<{
          pickupPointId: any;
          estimatedTime: string;
          actualTime?: string;
        }>;
        status: string;
        createdAt: string;
      }>;
    }>(`/bus-schedules${query}`);
  }

  async createBusSchedule(data: {
    busId: string;
    routeId: string;
    departureTime: string;
    estimatedArrivalTimes: Array<{
      pickupPointId: string;
      estimatedTime: string;
    }>;
  }) {
    return this.request<{
      message: string;
      schedule: any;
    }>('/bus-schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBusSchedule(id: string, data: {
    departureTime?: string;
    estimatedArrivalTimes?: Array<{
      pickupPointId: string;
      estimatedTime: string;
    }>;
    status?: string;
  }) {
    return this.request<{
      message: string;
      schedule: any;
    }>(`/bus-schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBusSchedule(id: string) {
    return this.request<{
      message: string;
    }>(`/bus-schedules/${id}`, {
      method: 'DELETE',
    });
  }

  // Bus Locations
  async getAllBusLocations(params?: { routeId?: string; isOnline?: boolean }) {
    const searchParams = new URLSearchParams();
    if (params?.routeId) searchParams.append('routeId', params.routeId);
    if (params?.isOnline !== undefined) searchParams.append('isOnline', params.isOnline.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
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

  // User Interests
  async getUserInterests() {
    return this.request<{
      interests: Array<{
        _id: string;
        userId: any;
        busScheduleId: any;
        pickupPointId: any;
        status: string;
        createdAt: string;
      }>;
    }>('/user-interests');
  }

  // Analytics/Stats
  async getStats() {
    return this.request<{
      stats: {
        buses: number;
        routes: number;
        users: number;
        schedules: number;
        pickupPoints: number;
        userInterests: number;
      };
    }>('/stats');
  }

  async createUser(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string;
  }) {
    return this.request<{
      message: string;
      user: any;
    }>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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