import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import vehicleRoutes from './vehicle.routes.js';
import alertRoutes from './alert.routes.js';

const router = Router();

// Health Check Endpoint (Requirement 25)
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'FleetPulse API is running',
    timestamp: new Date().toISOString(),
    service: 'fleetpulse-backend',
    uptime: process.uptime(),
  });
});

// Feature Routers
router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/alerts', alertRoutes);

export default router;
