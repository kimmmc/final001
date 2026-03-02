import { Document } from 'mongoose';
import { Request } from 'express';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'user' | 'driver' | 'admin';
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
export interface IBus extends Document {
    plateNumber: string;
    capacity: number;
    driverId: string;
    routeId: string;
    currentLocation: {
        latitude: number | null;
        longitude: number | null;
        lastUpdated: Date | null;
        speed: number;
        heading: number;
    };
    isActive: boolean;
    isOnline: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBusLocationHistory extends Document {
    busId: string;
    location: {
        latitude: number;
        longitude: number;
    };
    speed: number;
    heading: number;
    timestamp: Date;
    accuracy: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface IRoute extends Document {
    name: string;
    description: string;
    pickupPoints: string[];
    estimatedDuration: number;
    fare: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IPickupPoint extends Document {
    name: string;
    description: string;
    latitude: number;
    longitude: number;
    routeId: string;
    order: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBusSchedule extends Document {
    busId: string;
    routeId: string;
    departureTime: Date;
    estimatedArrivalTimes: {
        pickupPointId: string;
        estimatedTime: Date;
        actualTime?: Date;
    }[];
    status: 'scheduled' | 'in-transit' | 'completed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export interface IUserInterest extends Document {
    userId: string;
    busScheduleId: string;
    pickupPointId: string;
    status: 'interested' | 'confirmed' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
    };
}
//# sourceMappingURL=index.d.ts.map