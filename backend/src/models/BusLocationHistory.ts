import mongoose, { Schema } from 'mongoose';
import { IBusLocationHistory } from '../types';

const busLocationHistorySchema = new Schema<IBusLocationHistory>(
  {
    busId: {
      type: String,
      ref: 'Bus',
      required: true,
    },
    location: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    speed: {
      type: Number,
      default: 0,
    },
    heading: {
      type: Number,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
busLocationHistorySchema.index({ busId: 1, timestamp: -1 });
busLocationHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 }); // Auto-delete after 24 hours

export default mongoose.model<IBusLocationHistory>('BusLocationHistory', busLocationHistorySchema);