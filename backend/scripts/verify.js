import http from 'http';
import { io as ioClient } from 'socket.io-client';
import app from '../src/app.js';
import { ENV } from '../src/config/env.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { initSocket } from '../src/socket/socket.js';
import TelemetryService from '../src/services/telemetry.service.js';
import User from '../src/models/User.js';
import Vehicle from '../src/models/Vehicle.js';
import { INITIAL_VEHICLES } from '../src/utils/generateVehicles.js';

let server;
let socketClient;
const TEST_PORT = 5099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Helper for fetch requests
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  return { status: response.status, data, headers: response.headers };
}

async function runVerification() {
  console.log('===============================================================');
  console.log('🧪 Starting FleetPulse Backend Automated Verification Suite');
  console.log('===============================================================');

  try {
    // 1. Connect DB and seed
    await connectDB();
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    
    // Seed demo admin and vehicles
    await User.create({
      name: 'Fleet Administrator',
      email: 'admin@fleetpulse.com',
      password: 'Admin@123',
      role: 'admin',
    });
    await Vehicle.insertMany(INITIAL_VEHICLES);
    console.log('✅ Database connected and initial seed applied');

    // 2. Start HTTP & Socket server
    const httpServer = http.createServer(app);
    const ioServer = initSocket(httpServer);
    TelemetryService.startGenerator(ioServer);

    await new Promise((resolve) => {
      server = httpServer.listen(TEST_PORT, () => {
        console.log(`✅ Test server running on port ${TEST_PORT}`);
        resolve();
      });
    });

    // 3. Test Health Check
    console.log('\n--- 1. Testing Health Check API ---');
    const healthRes = await apiRequest('/api/health');
    console.log(`Status: ${healthRes.status}, Payload:`, healthRes.data);
    if (healthRes.status !== 200 || !healthRes.data.success) {
      throw new Error('Health check failed!');
    }
    console.log('✅ Health check passed');

    // 4. Test User Registration
    console.log('\n--- 2. Testing Auth: User Registration ---');
    const registerRes = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Engineer',
        email: 'test.engineer@fleetpulse.com',
        password: 'Password@123',
        role: 'dispatcher',
      }),
    });
    console.log(`Status: ${registerRes.status}, Registered:`, registerRes.data.data?.user?.email);
    if (registerRes.status !== 201 || !registerRes.data.data?.token) {
      throw new Error('Registration failed!');
    }
    console.log('✅ Registration passed');

    // 5. Test Demo User Login (admin@fleetpulse.com / Admin@123)
    console.log('\n--- 3. Testing Auth: Demo Admin Login ---');
    const loginRes = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@fleetpulse.com',
        password: 'Admin@123',
      }),
    });
    console.log(`Status: ${loginRes.status}, Logged In:`, loginRes.data.data?.user);
    if (loginRes.status !== 200 || !loginRes.data.data?.token) {
      throw new Error('Login failed!');
    }
    const adminToken = loginRes.data.data.token;
    console.log('✅ Demo Login passed');

    // 6. Test /api/auth/me Session Validation
    console.log('\n--- 4. Testing Auth: /api/auth/me Session Validation ---');
    const meRes = await apiRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Status: ${meRes.status}, Current User:`, meRes.data.data?.user?.email);
    if (meRes.status !== 200 || meRes.data.data?.user?.email !== 'admin@fleetpulse.com') {
      throw new Error('/api/auth/me verification failed!');
    }
    console.log('✅ /api/auth/me passed');

    // 7. Test Invalid & Expired Token (Expect 401)
    console.log('\n--- 5. Testing Auth: Invalid/Missing Token Handling ---');
    const noTokenRes = await apiRequest('/api/auth/me');
    if (noTokenRes.status !== 401) throw new Error('Unauthenticated request did not return 401');
    
    const invalidTokenRes = await apiRequest('/api/auth/me', {
      headers: { Authorization: 'Bearer invalid_bogus_jwt_token_123' },
    });
    if (invalidTokenRes.status !== 401) throw new Error('Invalid token did not return 401');
    console.log('✅ 401 Unauthorized handling verified');

    // 8. Test Auth Logout
    console.log('\n--- 6. Testing Auth: /api/auth/logout ---');
    const logoutRes = await apiRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (logoutRes.status !== 200) throw new Error('Logout failed!');
    console.log('✅ Logout passed');

    // 9. Test Dashboard Summary API
    console.log('\n--- 7. Testing Dashboard: /api/dashboard/summary ---');
    const summaryRes = await apiRequest('/api/dashboard/summary', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('Dashboard Summary Response:', JSON.stringify(summaryRes.data, null, 2));
    if (
      summaryRes.status !== 200 ||
      summaryRes.data.data?.totalVehicles !== INITIAL_VEHICLES.length ||
      typeof summaryRes.data.data?.fleetHealth !== 'number'
    ) {
      throw new Error('Dashboard summary endpoint validation failed!');
    }
    console.log('✅ Dashboard summary passed');

    // 10. Test Dashboard Alerts API
    console.log('\n--- 8. Testing Dashboard: /api/dashboard/alerts ---');
    const alertsRes = await apiRequest('/api/dashboard/alerts', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Found ${alertsRes.data.data?.length || 0} alerts. Total: ${alertsRes.data.pagination?.total}`);
    if (alertsRes.status !== 200 || !Array.isArray(alertsRes.data.data)) {
      throw new Error('Dashboard alerts endpoint validation failed!');
    }
    console.log('✅ Dashboard alerts passed');

    // 11. Test Dashboard Trends API
    console.log('\n--- 9. Testing Dashboard: /api/dashboard/trends ---');
    const trendsRes = await apiRequest('/api/dashboard/trends?period=24h', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Trends period: ${trendsRes.data.data?.period}, points count: ${trendsRes.data.data?.points?.length}`);
    if (trendsRes.status !== 200 || !Array.isArray(trendsRes.data.data?.points)) {
      throw new Error('Dashboard trends endpoint validation failed!');
    }
    console.log('✅ Dashboard trends passed');

    // 12. Test Vehicle APIs
    console.log('\n--- 10. Testing Vehicle APIs ---');
    const vehiclesRes = await apiRequest('/api/vehicles?limit=10', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Vehicles count: ${vehiclesRes.data.data?.length}, Total: ${vehiclesRes.data.pagination?.total}`);
    if (vehiclesRes.status !== 200 || vehiclesRes.data.data?.length === 0) {
      throw new Error('GET /api/vehicles failed!');
    }

    const testVehicleId = 'TRUCK-001';
    const singleVehicleRes = await apiRequest(`/api/vehicles/${testVehicleId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log(`Vehicle ${testVehicleId} driver: ${singleVehicleRes.data.data?.driverName}, status: ${singleVehicleRes.data.data?.status}`);
    if (singleVehicleRes.status !== 200 || singleVehicleRes.data.data?.vehicleId !== testVehicleId) {
      throw new Error(`GET /api/vehicles/${testVehicleId} failed!`);
    }

    const vehicleTelemetryRes = await apiRequest(`/api/vehicles/${testVehicleId}/telemetry?limit=5`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (vehicleTelemetryRes.status !== 200) {
      throw new Error(`GET /api/vehicles/${testVehicleId}/telemetry failed!`);
    }
    console.log(`Vehicle ${testVehicleId} telemetry points retrieved: ${vehicleTelemetryRes.data.data?.length}`);

    const vehicleAlertsRes = await apiRequest(`/api/vehicles/${testVehicleId}/alerts`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (vehicleAlertsRes.status !== 200) {
      throw new Error(`GET /api/vehicles/${testVehicleId}/alerts failed!`);
    }
    console.log('✅ Vehicle APIs passed');

    // 13. Test Socket.IO Real-Time Communication
    console.log('\n--- 11. Testing Socket.IO Real-Time Stream ---');
    const socketPromise = new Promise((resolve, reject) => {
      socketClient = ioClient(BASE_URL, {
        transports: ['websocket'],
        reconnection: false,
      });

      const timeout = setTimeout(() => {
        reject(new Error('Socket.IO telemetry:update event timed out!'));
      }, 8000);

      socketClient.on('connect', () => {
        console.log(`⚡ Socket.IO client connected with id: ${socketClient.id}`);
      });

      socketClient.on('telemetry:update', (payload) => {
        console.log('⚡ Received live telemetry event over Socket.IO:', {
          vehicleId: payload.vehicleId,
          speed: payload.speed,
          fuelLevel: payload.fuelLevel,
          engineTemperature: payload.engineTemperature,
          batteryLevel: payload.batteryLevel,
          status: payload.status,
          eventType: payload.eventType,
        });

        if (payload.vehicleId && typeof payload.speed === 'number' && payload.status) {
          clearTimeout(timeout);
          resolve(payload);
        }
      });

      socketClient.on('connect_error', (err) => {
        clearTimeout(timeout);
        reject(new Error(`Socket connection error: ${err.message}`));
      });
    });

    await socketPromise;
    console.log('✅ Socket.IO real-time telemetry verification passed');

    // 14. Test 404 and Error Handling
    console.log('\n--- 12. Testing 404 & Centralized Error Middleware ---');
    const notFoundRes = await apiRequest('/api/non-existing-route');
    if (notFoundRes.status !== 404) throw new Error('404 route handling failed');
    console.log('✅ 404 handler verified');

    console.log('\n===============================================================');
    console.log('🎉 ALL BACKEND VERIFICATIONS PASSED SUCCESSFULLY (12/12) 🎉');
    console.log('===============================================================');

  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exitCode = 1;
  } finally {
    // Cleanup
    if (socketClient) {
      socketClient.disconnect();
    }
    TelemetryService.stopGenerator();
    if (server) {
      server.close();
    }
    await disconnectDB();
    process.exit(process.exitCode || 0);
  }
}

runVerification();
