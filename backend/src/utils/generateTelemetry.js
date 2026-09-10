import { ENV } from '../config/env.js';

/**
 * Derives vehicle health status based on centralized thresholds
 * 
 * Rules:
 * OK: temp < 90, fuel > 25, battery > 30
 * WARN: temp >= 90 OR fuel <= 25 OR battery <= 30
 * CRITICAL: temp >= 100 OR fuel <= 10 OR battery <= 15
 */
export const deriveVehicleStatus = (engineTemperature, fuelLevel, batteryLevel) => {
  const { TEMPERATURE, FUEL, BATTERY } = ENV.THRESHOLDS;

  // Critical condition check
  if (
    engineTemperature >= TEMPERATURE.CRITICAL ||
    fuelLevel <= FUEL.CRITICAL ||
    batteryLevel <= BATTERY.CRITICAL
  ) {
    return 'CRITICAL';
  }

  // Warning condition check
  if (
    engineTemperature >= TEMPERATURE.WARNING ||
    fuelLevel <= FUEL.WARNING ||
    batteryLevel <= BATTERY.WARNING
  ) {
    return 'WARN';
  }

  return 'OK';
};

/**
 * Determine event type based on state transitions
 */
export const deriveEventType = (previousStatus, newStatus) => {
  if ((previousStatus === 'OK' || !previousStatus) && (newStatus === 'WARN' || newStatus === 'CRITICAL')) {
    return 'ALERT';
  }
  if ((previousStatus === 'WARN' || previousStatus === 'CRITICAL') && newStatus === 'OK') {
    return 'RECOVERY';
  }
  return 'UPDATE';
};

/**
 * Compute next simulation state with realistic physics-based fluctuations
 */
export const simulateNextTelemetry = (vehicle, intervalSeconds = 2) => {
  // Current values
  let speed = vehicle.currentSpeed ?? 60;
  let fuel = vehicle.fuelLevel ?? 80;
  let temp = vehicle.engineTemperature ?? 80;
  let battery = vehicle.batteryLevel ?? 90;
  let distance = vehicle.totalDistance ?? 0;
  let lat = vehicle.location?.lat ?? 28.6139;
  let lng = vehicle.location?.lng ?? 77.2090;
  let heading = vehicle.location?.heading ?? 0;

  // 1. Realistic Speed Fluctuation (40 - 110 km/h with occasional traffic slow-down)
  // EV / Van / Truck variation
  const speedNoise = (Math.random() - 0.48) * 6; // slight drift
  speed = Math.max(0, Math.min(125, speed + speedNoise));
  
  // Maintain realistic cruising bands (40-105 km/h mostly)
  if (speed < 35 && Math.random() > 0.3) speed += 8;
  if (speed > 115) speed -= 6;
  speed = Math.round(speed * 10) / 10;

  // 2. Realistic Fuel Depletion / EV Battery Consumption
  // High speed burns more fuel
  const burnRate = 0.02 + (speed / 120) * 0.06;
  fuel = Math.max(2, fuel - burnRate);
  
  // If fuel is critically low (< 5%), simulate a refuel event to 98%
  if (fuel <= 5) {
    fuel = 95 + Math.random() * 4;
  }
  fuel = Math.round(fuel * 10) / 10;

  // 3. Engine Temperature Dynamics
  // Temp rises when speed is high (> 80), cools slightly when cruising or idling
  // Ambient equilibrium is around 75°C - 85°C
  const targetTemp = 72 + (speed / 110) * 26 + (Math.random() - 0.5) * 4;
  const thermalInertia = 0.08;
  temp = temp + (targetTemp - temp) * thermalInertia;
  
  // Occasional random stress condition for demonstration (e.g. climbing gradient)
  if (Math.random() < 0.03) {
    temp += 3.5;
  }
  temp = Math.max(65, Math.min(115, temp));
  temp = Math.round(temp * 10) / 10;

  // 4. Battery Level Dynamics
  // Slow drain or regeneration during deceleration
  if (vehicle.vehicleType === 'Cargo EV') {
    const evDrain = 0.05 + (speed / 100) * 0.08;
    battery = Math.max(5, battery - evDrain);
    if (battery <= 8) battery = 96; // Simulated rapid recharge
  } else {
    // Standard auxiliary battery fluctuates gently
    const batNoise = (Math.random() - 0.49) * 0.4;
    battery = Math.max(15, Math.min(100, battery + batNoise));
  }
  battery = Math.round(battery * 10) / 10;

  // 5. Total Distance & Location Accumulation
  const distanceCovered = (speed * (intervalSeconds / 3600));
  distance = Math.round((distance + distanceCovered) * 100) / 100;

  // Small geographic movement along heading
  const radians = (heading * Math.PI) / 180;
  const latDelta = (distanceCovered / 111) * Math.cos(radians);
  const lngDelta = (distanceCovered / (111 * Math.cos((lat * Math.PI) / 180))) * Math.sin(radians);
  
  lat = Number((lat + latDelta).toFixed(6));
  lng = Number((lng + lngDelta).toFixed(6));
  
  // Slight heading adjustment (simulating highway curves)
  heading = Math.round((heading + (Math.random() - 0.5) * 4 + 360) % 360);

  // 6. Status and Event Type
  const newStatus = deriveVehicleStatus(temp, fuel, battery);
  const previousStatus = vehicle.status || 'OK';
  const eventType = deriveEventType(previousStatus, newStatus);

  return {
    vehicleId: vehicle.vehicleId,
    speed,
    fuelLevel: fuel,
    engineTemperature: temp,
    batteryLevel: battery,
    status: newStatus,
    eventType,
    totalDistance: distance,
    location: {
      ...vehicle.location,
      lat,
      lng,
      heading,
    },
    timestamp: new Date(),
  };
};
