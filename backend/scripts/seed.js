import mongoose from 'mongoose';
import { ENV } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Vehicle from '../src/models/Vehicle.js';
import Telemetry from '../src/models/Telemetry.js';
import Alert from '../src/models/Alert.js';
import { INITIAL_VEHICLES } from '../src/utils/generateVehicles.js';

async function seed() {
  console.log('--- [FleetPulse] Starting Database Seeding ---');
  try {
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      Telemetry.deleteMany({}),
      Alert.deleteMany({}),
    ]);

    console.log('[Seed] Creating demo users...');
    const demoAdmin = await User.create({
      name: 'Fleet Administrator',
      email: 'admin@fleetpulse.com',
      password: 'Admin@123',
      role: 'admin',
    });

    const dispatcher = await User.create({
      name: 'Operations Dispatcher',
      email: 'dispatcher@fleetpulse.com',
      password: 'Dispatcher@123',
      role: 'dispatcher',
    });

    console.log(`[Seed] Created demo users:
  1. ${demoAdmin.email} (Password: Admin@123) [admin]
  2. ${dispatcher.email} (Password: Dispatcher@123) [dispatcher]`);

    console.log(`[Seed] Inserting ${INITIAL_VEHICLES.length} fleet vehicles...`);
    const insertedVehicles = await Vehicle.insertMany(INITIAL_VEHICLES);

    console.log('[Seed] Generating initial telemetry records & alerts...');
    const telemetryBatch = [];
    const alertBatch = [];

    const now = Date.now();
    for (const v of insertedVehicles) {
      // Generate 20 historical points (over past 2 hours) for each vehicle
      for (let i = 20; i >= 0; i--) {
        const pointTime = new Date(now - i * 6 * 60 * 1000);
        telemetryBatch.push({
          vehicleId: v.vehicleId,
          speed: Math.max(20, Math.min(110, v.currentSpeed + (Math.random() - 0.5) * 15)),
          fuelLevel: Math.max(10, Math.min(100, v.fuelLevel + (i * 0.4))),
          engineTemperature: Math.max(70, Math.min(105, v.engineTemperature + (Math.random() - 0.5) * 6)),
          batteryLevel: Math.max(15, Math.min(100, v.batteryLevel)),
          status: v.status,
          eventType: 'UPDATE',
          timestamp: pointTime,
        });
      }

      // If vehicle has warning/critical status, add an initial alert
      if (v.status === 'WARN') {
        alertBatch.push({
          vehicleId: v.vehicleId,
          type: v.fuelLevel <= 25 ? 'FUEL' : 'TEMPERATURE',
          severity: 'WARNING',
          message: v.fuelLevel <= 25 ? `Low fuel level (${v.fuelLevel}%)` : `Engine temp high (${v.engineTemperature}°C)`,
          value: v.fuelLevel <= 25 ? v.fuelLevel : v.engineTemperature,
          threshold: v.fuelLevel <= 25 ? 25 : 90,
          status: 'ACTIVE',
          timestamp: new Date(now - 15 * 60 * 1000),
        });
      } else if (v.status === 'CRITICAL') {
        alertBatch.push({
          vehicleId: v.vehicleId,
          type: v.engineTemperature >= 100 ? 'TEMPERATURE' : 'FUEL',
          severity: 'CRITICAL',
          message: v.engineTemperature >= 100 ? `Engine overheating (${v.engineTemperature}°C)` : `Critical low fuel (${v.fuelLevel}%)`,
          value: v.engineTemperature >= 100 ? v.engineTemperature : v.fuelLevel,
          threshold: v.engineTemperature >= 100 ? 100 : 10,
          status: 'ACTIVE',
          timestamp: new Date(now - 25 * 60 * 1000),
        });
      }
    }

    await Telemetry.insertMany(telemetryBatch);
    if (alertBatch.length > 0) {
      await Alert.insertMany(alertBatch);
    }

    console.log(`[Seed] Seeded ${telemetryBatch.length} telemetry points and ${alertBatch.length} alerts.`);
    console.log('✅ Seeding completed successfully!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
