import { Router } from 'express';
import { register, login, getMe, logout } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
