import './config/database.js';
import express from 'express';
import cors from 'cors';
import { carRoutes } from './routes/car.routes.js';
import { aiRoutes } from './routes/ai.routes.js';
import { authRoutes } from './auth/routes.js';
import { showroomRoutes } from './showrooms/routes.js';
import { wishlistRoutes } from './wishlist/routes.js';
import { subscriptionRoutes } from './subscription/routes.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(express.json());
app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : true,
  credentials: true,
}));

app.use('/api/cars', carRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/showrooms', showroomRoutes);
app.use('/api/subscription', subscriptionRoutes);

app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'SUCCESS',
    message: 'Backend RAC AI aktif dan berjalan normal!',
    timestamp: new Date().toISOString(),
  });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route tidak ditemukan' });
});

export default app;