import http from 'http';
import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { initSocket } from './socket/socket.js';
import TelemetryService from './services/telemetry.service.js';
import User from './models/User.js';
import Vehicle from './models/Vehicle.js';
import { INITIAL_VEHICLES } from './utils/generateVehicles.js';

const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = initSocket(httpServer);

/**
 * Seed initial Demo User and Vehicles if database is fresh
 */
async function initializeDemoData() {
  try {
    // 1. Demo User Initialization (Requirement 5)
    const demoEmail = 'admin@fleetpulse.com';
    const existingAdmin = await User.findOne({ email: demoEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Fleet Administrator',
        email: demoEmail,
        password: 'Admin@123',
        role: 'admin',
      });
      console.log(`[Seed] Demo admin created successfully (${demoEmail} / Admin@123)`);
    } else {
      console.log(`[Seed] Demo admin already exists (${demoEmail})`);
    }

    const dispatcherEmail = 'dispatcher@fleetpulse.com';
    const existingDispatcher = await User.findOne({ email: dispatcherEmail });
    if (!existingDispatcher) {
      await User.create({
        name: 'Operations Dispatcher',
        email: dispatcherEmail,
        password: 'Dispatcher@123',
        role: 'dispatcher',
      });
      console.log(`[Seed] Demo dispatcher created successfully (${dispatcherEmail} / Dispatcher@123)`);
    } else {
      console.log(`[Seed] Demo dispatcher already exists (${dispatcherEmail})`);
    }

    // 2. Vehicles Initialization (Requirement 24)
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      await Vehicle.insertMany(INITIAL_VEHICLES);
      console.log(`[Seed] Initialized ${INITIAL_VEHICLES.length} fleet vehicles`);
    } else {
      console.log(`[Seed] Fleet vehicles already populated (${vehicleCount} vehicles)`);
    }
  } catch (seedErr) {
    console.error(`[Seed] Initialization warning: ${seedErr.message}`);
  }
}

/**
 * Bootstrap Server
 */
async function startServer() {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Initialize Seed Data
    await initializeDemoData();

    // 3. Start Telemetry Generator (Requirement 6, 9)
    TelemetryService.startGenerator(io);

    // 4. Start HTTP Server
    const server = httpServer.listen(ENV.PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 FleetPulse Backend running on port ${ENV.PORT}`);
      console.log(`📡 Environment: ${ENV.NODE_ENV}`);
      console.log(`🔗 Health Check: http://localhost:${ENV.PORT}/api/health`);
      console.log(`⚡ Live Telemetry Interval: ${ENV.TELEMETRY_INTERVAL}ms`);
      console.log(`=======================================================`);
    });

    /**
     * Graceful Shutdown Handler (Requirement 26)
     */
    const gracefulShutdown = async (signal) => {
      console.log(`\n[Shutdown] Received ${signal}. Starting graceful shutdown...`);

      // Stop Telemetry generation loop
      TelemetryService.stopGenerator();

      // Close Socket.IO connections
      if (io) {
        io.close(() => {
          console.log('[Shutdown] Socket.IO closed.');
        });
      }

      // Close HTTP Server
      server.close(async () => {
        console.log('[Shutdown] HTTP Server stopped.');
        
        // Close Database connection
        await disconnectDB();
        console.log('[Shutdown] Graceful shutdown complete. Exiting.');
        process.exit(0);
      });

      // Force shutdown after 10s if hanging
      setTimeout(() => {
        console.error('[Shutdown] Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error(`[Fatal] Failed to bootstrap FleetPulse backend: ${error.message}`);
    process.exit(1);
  }
}

startServer();
