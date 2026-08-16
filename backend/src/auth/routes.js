import { Router } from 'express';
import { register, login, google, logout } from './controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', google);
router.post('/logout', logout);

export const authRoutes = router;