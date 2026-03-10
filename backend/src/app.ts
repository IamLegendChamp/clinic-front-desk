import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware';
import { jsonBody } from './middleware/jsonBody';
import authRoutes from './routes/authRoutes';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

export const createApp = () => {
  const app = express();
  app.use(cors({ origin: FRONTEND_URL }));
  app.use(jsonBody);
  app.get('/', (req, res) => {
    res.json({ message: 'Clinic API', health: '/health' });
  });
  app.get('/health', (req, res) => {
    res.json({ ok: true, message: 'Backend is up' });
  });
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  return app;
};
