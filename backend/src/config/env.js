import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env relative to project root
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fleetpulse',
  JWT_SECRET: process.env.JWT_SECRET || 'fleetpulse_super_secret_production_key_9837498234',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  TELEMETRY_INTERVAL: parseInt(process.env.TELEMETRY_INTERVAL || '2000', 10),
  
  // Alert Thresholds
  THRESHOLDS: {
    TEMPERATURE: {
      WARNING: parseFloat(process.env.TEMPERATURE_WARNING || '90'),
      CRITICAL: parseFloat(process.env.TEMPERATURE_CRITICAL || '100'),
    },
    FUEL: {
      WARNING: parseFloat(process.env.FUEL_WARNING || '25'),
      CRITICAL: parseFloat(process.env.FUEL_CRITICAL || '10'),
    },
    BATTERY: {
      WARNING: parseFloat(process.env.BATTERY_WARNING || '30'),
      CRITICAL: parseFloat(process.env.BATTERY_CRITICAL || '15'),
    },
    SPEED: {
      WARNING: parseFloat(process.env.SPEED_WARNING || '100'),
      CRITICAL: parseFloat(process.env.SPEED_CRITICAL || '120'),
    },
  },
};
