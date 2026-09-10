import { Router } from 'express';
import { getAlerts, resolveAlert } from '../controllers/alert.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAlerts);
router.patch('/:id/resolve', resolveAlert);

export default router;
