import { io, Socket } from 'socket.io-client';
import { getApiUrl } from '@/config/api';

interface BusStatusUpdate {
  busId: string;
  isOnline: boolean;
  timestamp: Date;
}

interface BusLocationUpdate {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  isOnline: boolean;
  timestamp: Date;
}

interface UserInterestUpdate {
  busId: string;
  userId: string;
  userName: string;
  pickupPointId: string;
  pickupPointName: string;
  action: 'added' | 'removed';
  timestamp: Date;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  private listeners: {
    busStatusChanged?: (data: BusStatusUpdate) => void;
    busLocationUpdated?: (data: BusLocationUpdate) => void;
    userInterestUpdated?: (data: UserInterestUpdate) => void;
    connected?: () => void;
    disconnected?: () => void;
    error?: (error: any) => void;
  } = {};

  connect(token: string, busId?: string) {
    if (this.socket && this.isConnected) {
      return;
    }

    const apiUrl = getApiUrl().replace('/api', '');
    
    this.socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
    });

    this.socket.on('connect', () => {
      console.log('Driver WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.listeners.connected?.();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Driver WebSocket disconnected:', reason);
      this.isConnected = false;
      this.listeners.disconnected?.();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Driver WebSocket connection error:', error);
      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, 10000); // Exponential backoff, max 10s
      this.listeners.error?.(error);
    });

    // Real-time event listeners
    this.socket.on('bus_status_changed', (data: BusStatusUpdate) => {
      console.log('Bus status changed:', data);
      this.listeners.busStatusChanged?.(data);
    });

    this.socket.on('bus_location_updated', (data: BusLocationUpdate) => {
      console.log('Bus location updated:', data);
      this.listeners.busLocationUpdated?.(data);
    });

    this.socket.on('user_interest_updated', (data: UserInterestUpdate) => {
      console.log('User interest updated:', data);
      this.listeners.userInterestUpdated?.(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event listeners
  onBusStatusChanged(callback: (data: BusStatusUpdate) => void) {
    this.listeners.busStatusChanged = callback;
  }

  onBusLocationUpdated(callback: (data: BusLocationUpdate) => void) {
    this.listeners.busLocationUpdated = callback;
  }

  onUserInterestUpdated(callback: (data: UserInterestUpdate) => void) {
    this.listeners.userInterestUpdated = callback;
  }

  onConnected(callback: () => void) {
    this.listeners.connected = callback;
  }

  onDisconnected(callback: () => void) {
    this.listeners.disconnected = callback;
  }

  onError(callback: (error: any) => void) {
    this.listeners.error = callback;
  }

  // Remove specific listener
  off(event: keyof typeof this.listeners) {
    delete this.listeners[event];
  }

  // Remove all listeners
  offAll() {
    this.listeners = {};
  }

  // Check connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Emit events for driver actions
  emitDriverStatusChange(busId: string, isOnline: boolean) {
    if (this.socket && this.isConnected) {
      this.socket.emit('driver_status_change', { busId, isOnline });
    }
  }

  emitBusLocationUpdate(data: {
    busId: string;
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    isOnline: boolean;
  }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('bus_location_update', data);
    }
  }

  emitUserInterestUpdate(data: {
    busId: string;
    userId: string;
    userName: string;
    pickupPointId: string;
    pickupPointName: string;
    action: 'added' | 'removed';
  }) {
    if (this.socket && this.isConnected) {
      this.socket.emit('user_interest_update', data);
    }
  }

  // Generic emit method
  emit(event: string, data: any) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    }
  }
}

export const socketService = new SocketService();
export default socketService; 