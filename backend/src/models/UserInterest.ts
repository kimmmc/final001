import mongoose, { Schema } from 'mongoose';
import { IUserInterest } from '../types';

const userInterestSchema = new Schema<IUserInterest>(
  {
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    busScheduleId: {
      type: String,
      ref: 'BusSchedule',
      required: true,
    },
    pickupPointId: {
      type: String,
      ref: 'PickupPoint',
      required: true,
    },
    status: {
      type: String,
      enum: ['interested', 'confirmed', 'cancelled'],
      default: 'interested',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserInterest>('UserInterest', userInterestSchema);