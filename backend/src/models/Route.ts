import mongoose, { Schema } from 'mongoose';
import { IRoute } from '../types';

const routeSchema = new Schema<IRoute>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    pickupPoints: [
      {
        type: String,
        ref: 'PickupPoint',
      },
    ],
    estimatedDuration: {
      type: Number,
      required: true,
      min: 1,
    },
    fare: {
      type: Number,
      required: true,
      min: 0,
      default: 400, // Default fare in RWF
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Direction fields for bidirectional routes
    origin: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    isBidirectional: {
      type: Boolean,
      default: true, // Most routes are bidirectional
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IRoute>('Route', routeSchema);