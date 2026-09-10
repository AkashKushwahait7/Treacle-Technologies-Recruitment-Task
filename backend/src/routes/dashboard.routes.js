import { Router } from 'express';
import { getSummary, getDashboardAlerts, getTrends } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Dashboard routes can be accessed by authenticated users
router.use(authenticate);

router.get('/summary', getSummary);
router.get('/alerts', getDashboardAlerts);
router.get('/trends', getTrends);

export default router;
