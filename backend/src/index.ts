import 'dotenv/config';
import express from "express";
import { connectDB } from "./config/db";

const PORT = process.env.PORT ?? 5000;

async function start() {
    await connectDB();
    const app = express();
    app.get('/health', (req, res) => {
        res.json({ ok: true, message: 'Backend is up' })
    })
    app.listen(PORT, () => console.log(`Server on Port ${PORT}`))
}
start();
