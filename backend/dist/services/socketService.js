"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class SocketService {
    constructor() {
        this.io = null;
        this.connectedUsers = new Map();
    }
    initialize(server) {
        this.io = new socket_io_1.Server(server, {
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
                const decoded = jsonwebtoken_1.default.verify(token, secret);
                const userType = decoded.role === 'driver' ? 'driver' :
                    decoded.role === 'admin' ? 'admin' : 'user';
                socket.data.user = {
                    userId: decoded.id,
                    userType,
                    busId: decoded.busId
                };
                next();
            }
            catch (error) {
                next(new Error('Authentication error'));
            }
        });
        this.io.on('connection', (socket) => {
            const user = socket.data.user;
            this.connectedUsers.set(socket.id, user);
            console.log(`User connected: ${user.userId} (${user.userType})`);
            if (user.userType === 'driver' && user.busId) {
                socket.join(`bus_${user.busId}`);
                socket.join('drivers');
            }
            else if (user.userType === 'user') {
                socket.join('users');
            }
            else if (user.userType === 'admin') {
                socket.join('admins');
            }
            socket.on('disconnect', () => {
                this.connectedUsers.delete(socket.id);
                console.log(`User disconnected: ${user.userId}`);
            });
            socket.on('driver_status_change', (data) => {
                this.broadcastBusStatusUpdate(data.busId, data.isOnline);
            });
            socket.on('bus_location_update', (data) => {
                this.broadcastBusLocationUpdate(data);
            });
            socket.on('user_interest_update', (data) => {
                this.broadcastUserInterestUpdate(data);
            });
        });
        console.log('WebSocket service initialized');
    }
    broadcastBusStatusUpdate(busId, isOnline) {
        if (!this.io)
            return;
        this.io.to('users').emit('bus_status_changed', {
            busId,
            isOnline,
            timestamp: new Date()
        });
        console.log(`Broadcasted bus status: ${busId} is now ${isOnline ? 'online' : 'offline'}`);
    }
    broadcastBusLocationUpdate(data) {
        if (!this.io)
            return;
        this.io.to('users').emit('bus_location_updated', {
            ...data,
            timestamp: new Date()
        });
        console.log(`Broadcasted location update for bus: ${data.busId}`);
    }
    broadcastUserInterestUpdate(data) {
        if (!this.io)
            return;
        this.io.to(`bus_${data.busId}`).emit('user_interest_updated', {
            ...data,
            timestamp: new Date()
        });
        console.log(`Broadcasted interest update: ${data.action} for bus ${data.busId}`);
    }
    emitInterestStatusUpdate(data) {
        if (!this.io)
            return;
        this.emitToUser(data.userId, 'interest_status_updated', {
            ...data,
            timestamp: new Date()
        });
        console.log(`Emitted interest status update: ${data.status} for user ${data.userId}`);
    }
    emitBusStatusChange(busId, isOnline) {
        this.broadcastBusStatusUpdate(busId, isOnline);
    }
    emitBusLocationUpdate(data) {
        this.broadcastBusLocationUpdate(data);
    }
    emitUserInterestUpdate(data) {
        this.broadcastUserInterestUpdate(data);
    }
    emitInterestStatusUpdateToUser(data) {
        this.emitInterestStatusUpdate(data);
    }
    emitToUser(userId, event, data) {
        if (!this.io)
            return;
        for (const [socketId, user] of this.connectedUsers.entries()) {
            if (user.userId === userId) {
                this.io.to(socketId).emit(event, data);
                break;
            }
        }
    }
    emitToBus(busId, event, data) {
        if (!this.io)
            return;
        this.io.to(`bus_${busId}`).emit(event, data);
    }
    emitToAllUsers(event, data) {
        if (!this.io)
            return;
        this.io.to('users').emit(event, data);
    }
    emitToAllDrivers(event, data) {
        if (!this.io)
            return;
        this.io.to('drivers').emit(event, data);
    }
    getConnectedUsersCount() {
        return this.connectedUsers.size;
    }
    getConnectedUsers() {
        return Array.from(this.connectedUsers.values());
    }
}
exports.socketService = new SocketService();
exports.default = exports.socketService;
