import { Router } from 'express';
import { register, login, google, logout } from './controller.js';
import { requireAuth } from './middleware.js';
import { me } from './controller.js';

const router = Router();

router.get('/me', requireAuth, me);

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.post('/logout', logout);

export const authRoutes = router;