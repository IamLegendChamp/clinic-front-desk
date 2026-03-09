import 'dotenv/config';
import express from "express";
import cors from 'cors';

import { connectDB } from "./config/db";
import { errorHandler } from "./middleware";
import authRoutes from "./routes/authRoutes";

const PORT = process.env.PORT ?? 5000;

async function start() {
    await connectDB();
    const app = express();

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
    app.use(cors({ origin: FRONTEND_URL }));
    app.use(express.json());

    app.get('/', (req, res) => {
        res.json({ message: 'Clinic API', health: '/health' })
    })

    app.get('/health', (req, res) => {
        res.json({ ok: true, message: 'Backend is up' })
    })

    app.use('/api/auth', authRoutes);

    app.use(errorHandler);

    app.listen(PORT, () => console.log(`Server on Port ${PORT}`))
}
start();
