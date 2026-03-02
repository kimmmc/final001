import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

interface SocketUser {
  userId: string;
  userType: 'driver' | 'user' | 'admin';
  busId?: string;
}

interface BusLocationUpdate {
  busId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  isOnline: boolean;
}

interface UserInterestUpdate {
  busId: string;
  userId: string;
  userName: string;
  pickupPointId: string;
  pickupPointName: string;
  action: 'added' | 'removed';
}

interface InterestStatusUpdate {
  interestId: string;
  userId: string;
  status: 'confirmed' | 'cancelled';
  busId: string;
  busScheduleId: string;
  pickupPointId: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, SocketUser> = new Map();

  initialize(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error('JWT_SECRET is not defined');
        }

        const decoded = jwt.verify(token, secret) as any;
        const userType = decoded.role === 'driver' ? 'driver' : 
                        decoded.role === 'admin' ? 'admin' : 'user';
        
        socket.data.user = {
          userId: decoded.id,
          userType,
          busId: decoded.busId
        };
        
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      const user = socket.data.user as SocketUser;
      this.connectedUsers.set(socket.id, user);
      
      console.log(`User connected: ${user.userId} (${user.userType})`);

      // Join appropriate rooms
      if (user.userType === 'driver' && user.busId) {
        socket.join(`bus_${user.busId}`);
        socket.join('drivers');
      } else if (user.userType === 'user') {
        socket.join('users');
      } else if (user.userType === 'admin') {
        socket.join('admins');
      }

      socket.on('disconnect', () => {
        this.connectedUsers.delete(socket.id);
        console.log(`User disconnected: ${user.userId}`);
      });

      // Handle driver going online/offline
      socket.on('driver_status_change', (data: { busId: string; isOnline: boolean }) => {
        this.broadcastBusStatusUpdate(data.busId, data.isOnline);
      });

      // Handle bus location updates
      socket.on('bus_location_update', (data: BusLocationUpdate) => {
        this.broadcastBusLocationUpdate(data);
      });

      // Handle user interest updates
      socket.on('user_interest_update', (data: UserInterestUpdate) => {
        this.broadcastUserInterestUpdate(data);
      });
    });

    console.log('WebSocket service initialized');
  }

  // Broadcast bus status change to all users
  private broadcastBusStatusUpdate(busId: string, isOnline: boolean) {
    if (!this.io) return;
    
    this.io.to('users').emit('bus_status_changed', {
      busId,
      isOnline,
      timestamp: new Date()
    });

    console.log(`Broadcasted bus status: ${busId} is now ${isOnline ? 'online' : 'offline'}`);
  }

  // Broadcast bus location update to all users
  private broadcastBusLocationUpdate(data: BusLocationUpdate) {
    if (!this.io) return;
    
    this.io.to('users').emit('bus_location_updated', {
      ...data,
      timestamp: new Date()
    });

    console.log(`Broadcasted location update for bus: ${data.busId}`);
  }

  // Broadcast user interest update to specific driver
  private broadcastUserInterestUpdate(data: UserInterestUpdate) {
    if (!this.io) return;
    
    this.io.to(`bus_${data.busId}`).emit('user_interest_updated', {
      ...data,
      timestamp: new Date()
    });

    console.log(`Broadcasted interest update: ${data.action} for bus ${data.busId}`);
  }

  // Emit interest status update to specific user
  private emitInterestStatusUpdate(data: InterestStatusUpdate) {
    if (!this.io) return;
    
    this.emitToUser(data.userId, 'interest_status_updated', {
      ...data,
      timestamp: new Date()
    });

    console.log(`Emitted interest status update: ${data.status} for user ${data.userId}`);
  }

  // Public methods to be called from controllers
  public emitBusStatusChange(busId: string, isOnline: boolean) {
    this.broadcastBusStatusUpdate(busId, isOnline);
  }

  public emitBusLocationUpdate(data: BusLocationUpdate) {
    this.broadcastBusLocationUpdate(data);
  }

  public emitUserInterestUpdate(data: UserInterestUpdate) {
    this.broadcastUserInterestUpdate(data);
  }

  public emitInterestStatusUpdateToUser(data: InterestStatusUpdate) {
    this.emitInterestStatusUpdate(data);
  }

  public emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    
    // Find socket by userId
    for (const [socketId, user] of this.connectedUsers.entries()) {
      if (user.userId === userId) {
        this.io.to(socketId).emit(event, data);
        break;
      }
    }
  }

  public emitToBus(busId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`bus_${busId}`).emit(event, data);
  }

  public emitToAllUsers(event: string, data: any) {
    if (!this.io) return;
    this.io.to('users').emit(event, data);
  }

  public emitToAllDrivers(event: string, data: any) {
    if (!this.io) return;
    this.io.to('drivers').emit(event, data);
  }

  public getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  public getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }
}

export const socketService = new SocketService();
export default socketService; 