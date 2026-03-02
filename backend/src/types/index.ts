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
  currentDirection?: 'outbound' | 'inbound'; // Direction the bus is currently traveling
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
  estimatedDuration: number; // in minutes
  fare: number; // Added fare field for route-based pricing
  isActive: boolean;
  // Direction fields for bidirectional routes
  origin: string; // Starting point (e.g., "Kimironko")
  destination: string; // End point (e.g., "Kabuga")
  isBidirectional: boolean; // Whether this route operates in both directions
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
  direction: 'outbound' | 'inbound'; // Direction for this specific schedule
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
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
}