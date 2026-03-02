import mongoose, { Schema } from 'mongoose';
import { IBusSchedule } from '../types';

const busScheduleSchema = new Schema(
  {
    busId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bus',
      required: true,
    },
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    estimatedArrivalTimes: [
      {
        pickupPointId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'PickupPoint',
          required: true,
        },
        estimatedTime: {
          type: Date,
          required: true,
        },
        actualTime: {
          type: Date,
        },
      },
    ],
    status: {
      type: String,
      enum: ['scheduled', 'in-transit', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    // Direction for this specific schedule
    direction: {
      type: String,
      enum: ['outbound', 'inbound'],
      default: 'outbound', // Default to outbound (origin to destination)
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBusSchedule>('BusSchedule', busScheduleSchema);