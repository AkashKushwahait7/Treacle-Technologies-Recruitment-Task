import { Router } from 'express';
import {
  getVehicles,
  getVehicleById,
  getVehicleTelemetry,
  getVehicleAlerts,
} from '../controllers/vehicle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Protect vehicle routes
router.use(authenticate);

router.get('/', getVehicles);
router.get('/:vehicleId', getVehicleById);
router.get('/:vehicleId/telemetry', getVehicleTelemetry);
router.get('/:vehicleId/alerts', getVehicleAlerts);

export default router;
