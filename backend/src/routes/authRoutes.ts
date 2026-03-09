import { Router, Request, Response } from 'express';
import { login } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/login — no auth required
router.post('/login', login);

// GET /api/auth/me - protected; returns req.user
router.get('/me', authMiddleware, (req: Request, res: Response) => {
    const user = (req as Request & { user: { id: string; email: string; role: string } }).user;
    res.json({ user });
})

export default router;
