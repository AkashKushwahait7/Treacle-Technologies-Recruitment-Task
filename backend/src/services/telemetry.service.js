import Vehicle from '../models/Vehicle.js';
import Telemetry from '../models/Telemetry.js';
import { simulateNextTelemetry } from '../utils/generateTelemetry.js';
import { AlertService } from './alert.service.js';
import { ENV } from '../config/env.js';

export class TelemetryService {
  static intervalId = null;
  static isRunning = false;
  static ioInstance = null;

  /**
   * Initializes and starts the background telemetry generator
   */
  static startGenerator(io) {
    if (this.isRunning) {
      console.log('[Telemetry Service] Generator already running');
      return;
    }

    this.ioInstance = io;
    this.isRunning = true;
    const intervalMs = ENV.TELEMETRY_INTERVAL || 2000;

    console.log(`[Telemetry Service] Starting live telemetry engine (Interval: ${intervalMs}ms)...`);

    this.intervalId = setInterval(async () => {
      try {
        await this.generateCycle();
      } catch (err) {
        console.error(`[Telemetry Service] Generation cycle error: ${err.message}`);
      }
    }, intervalMs);
  }

  /**
   * Stops the background telemetry generator
   */
  static stopGenerator() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[Telemetry Service] Telemetry generator stopped cleanly.');
  }

  /**
   * Executes a single telemetry simulation cycle for all fleet vehicles
   */
  static async generateCycle() {
    const vehicles = await Vehicle.find();
    if (!vehicles || vehicles.length === 0) {
      return;
    }

    const intervalSec = (ENV.TELEMETRY_INTERVAL || 2000) / 1000;
    const telemetryBatch = [];
    const bulkVehicleOps = [];

    for (const vehicle of vehicles) {
      // 1. Calculate next state
      const nextTelemetry = simulateNextTelemetry(vehicle, intervalSec);

      // 2. Prepare telemetry record for database storage
      telemetryBatch.push({
        vehicleId: nextTelemetry.vehicleId,
        speed: nextTelemetry.speed,
        fuelLevel: nextTelemetry.fuelLevel,
        engineTemperature: nextTelemetry.engineTemperature,
        batteryLevel: nextTelemetry.batteryLevel,
        status: nextTelemetry.status,
        eventType: nextTelemetry.eventType,
        timestamp: nextTelemetry.timestamp,
      });

      // 3. Prepare vehicle document update
      bulkVehicleOps.push({
        updateOne: {
          filter: { vehicleId: vehicle.vehicleId },
          update: {
            $set: {
              currentSpeed: nextTelemetry.speed,
              fuelLevel: nextTelemetry.fuelLevel,
              engineTemperature: nextTelemetry.engineTemperature,
              batteryLevel: nextTelemetry.batteryLevel,
              status: nextTelemetry.status,
              totalDistance: nextTelemetry.totalDistance,
              location: nextTelemetry.location,
              lastTelemetryAt: nextTelemetry.timestamp,
            },
          },
        },
      });

      // 4. Process threshold alerts
      const { generatedAlerts, resolvedAlerts } = await AlertService.processVehicleAlerts(
        vehicle,
        nextTelemetry
      );

      // 5. Emit real-time Socket.IO events
      if (this.ioInstance) {
        // Main required event: telemetry:update
        this.ioInstance.emit('telemetry:update', {
          vehicleId: nextTelemetry.vehicleId,
          speed: nextTelemetry.speed,
          fuelLevel: nextTelemetry.fuelLevel,
          engineTemperature: nextTelemetry.engineTemperature,
          batteryLevel: nextTelemetry.batteryLevel,
          status: nextTelemetry.status,
          eventType: nextTelemetry.eventType,
          location: nextTelemetry.location,
          totalDistance: nextTelemetry.totalDistance,
          timestamp: nextTelemetry.timestamp.toISOString(),
        });

        // Broadcast newly generated alerts if any
        if (generatedAlerts.length > 0) {
          generatedAlerts.forEach((alert) => {
            this.ioInstance.emit('alert:new', alert);
          });
        }

        // Broadcast resolved alerts if any
        if (resolvedAlerts.length > 0) {
          resolvedAlerts.forEach((alert) => {
            this.ioInstance.emit('alert:resolved', alert);
          });
        }
      }
    }

    // 6. Execute bulk operations to MongoDB
    if (bulkVehicleOps.length > 0) {
      await Vehicle.bulkWrite(bulkVehicleOps);
    }

    // Limit stored telemetry size or batch insert
    if (telemetryBatch.length > 0) {
      await Telemetry.insertMany(telemetryBatch);
    }
  }
}

export default TelemetryService;
