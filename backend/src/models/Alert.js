import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: [true, 'Vehicle ID is required for alert'],
      index: true,
      uppercase: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['TEMPERATURE', 'FUEL', 'BATTERY', 'SPEED'],
    },
    severity: {
      type: String,
      required: true,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'WARNING',
    },
    message: {
      type: String,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    threshold: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'RESOLVED'],
      default: 'ACTIVE',
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

alertSchema.index({ status: 1, severity: 1, timestamp: -1 });
alertSchema.index({ vehicleId: 1, status: 1 });

export const Alert = mongoose.model('Alert', alertSchema);
export default Alert;
