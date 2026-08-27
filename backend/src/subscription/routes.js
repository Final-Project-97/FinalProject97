import { Router } from 'express';
import { requireAuth } from '../auth/middleware.js';
import { getStatus, checkout, webhook } from './controller.js';

const router = Router();

router.post('/webhook', webhook); // public — Midtrans call

router.use(requireAuth);
router.get('/status', getStatus);
router.post('/checkout', checkout);

export const subscriptionRoutes = router;