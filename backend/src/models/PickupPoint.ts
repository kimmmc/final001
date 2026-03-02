import mongoose, { Schema } from 'mongoose';
import { IPickupPoint } from '../types';


const pickupPointSchema = new Schema<IPickupPoint>(
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
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    routeId: {
      type: String,
      ref: 'Route',
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPickupPoint>('PickupPoint', pickupPointSchema);