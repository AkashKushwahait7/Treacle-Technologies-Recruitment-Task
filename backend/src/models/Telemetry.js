import mongoose from 'mongoose';

const telemetrySchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: true,
      index: true,
      uppercase: true,
    },
    speed: {
      type: Number,
      required: true,
    },
    fuelLevel: {
      type: Number,
      required: true,
    },
    engineTemperature: {
      type: Number,
      required: true,
    },
    batteryLevel: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['OK', 'WARN', 'CRITICAL'],
      required: true,
    },
    eventType: {
      type: String,
      enum: ['UPDATE', 'ALERT', 'RECOVERY'],
      default: 'UPDATE',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for querying time-series data for a vehicle
telemetrySchema.index({ vehicleId: 1, timestamp: -1 });

// TTL index to automatically prune records older than 7 days (604800 seconds)
telemetrySchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });

export const Telemetry = mongoose.model('Telemetry', telemetrySchema);
export default Telemetry;
