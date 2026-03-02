import mongoose, { Schema } from 'mongoose';
import { IBus } from '../types';

const busSchema = new Schema<IBus>(
  {
    plateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    driverId: {
      type: String,
      ref: 'User',
      required: true,
    },
    routeId: {
      type: String,
      ref: 'Route',
      required: true,
    },
    currentLocation: {
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
      lastUpdated: {
        type: Date,
        default: null,
      },
      speed: {
        type: Number,
        default: 0,
      },
      heading: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    currentDirection: {
      type: String,
      enum: ['outbound', 'inbound'],
      default: null,
    },

  },
  {
    timestamps: true,
  }
);

// Index for geospatial queries
busSchema.index({ 'currentLocation.latitude': 1, 'currentLocation.longitude': 1 });

export default mongoose.model<IBus>('Bus', busSchema);