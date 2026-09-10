import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: String,
      required: [true, 'Vehicle ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      trim: true,
      uppercase: true,
    },
    driverName: {
      type: String,
      required: [true, 'Driver name is required'],
      trim: true,
    },
    vehicleType: {
      type: String,
      required: [true, 'Vehicle type is required'],
      enum: ['Heavy Truck', 'Delivery Van', 'Cargo EV', 'Express Bus', 'Semi-Trailer'],
      default: 'Heavy Truck',
    },
    location: {
      city: { type: String, default: 'Delhi' },
      state: { type: String, default: 'Delhi' },
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 },
      heading: { type: Number, default: 0 },
      address: { type: String, default: 'National Highway, Logistics Corridor' },
    },
    status: {
      type: String,
      enum: ['OK', 'WARN', 'CRITICAL'],
      default: 'OK',
      index: true,
    },
    currentSpeed: {
      type: Number,
      default: 0,
      min: 0,
      max: 200,
    },
    fuelLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    engineTemperature: {
      type: Number,
      default: 80,
      min: 0,
      max: 150,
    },
    batteryLevel: {
      type: Number,
      default: 100,
      min: 0,
      max: 100,
    },
    totalDistance: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastTelemetryAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

// Indexes for fast dashboard aggregations
vehicleSchema.index({ status: 1, lastTelemetryAt: -1 });

export const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;
