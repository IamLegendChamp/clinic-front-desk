import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware';
import { jsonBody } from './middleware/jsonBody';
import authRoutes from './routes/authRoutes';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/** Same as createApp but uses express.json() for body parsing (for tests that need reliable body). */
export const createTestApp = () => {
  const app = express();
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
  app.use(cookieParser());
  app.use(express.json());
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

export const createApp = () => {
  const app = express();
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
  app.use(cookieParser());
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
