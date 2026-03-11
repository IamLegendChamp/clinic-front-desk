import { Router, Request, Response } from 'express';
import { login, refresh, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/auth/login — no auth required
router.post('/login', login);

// POST /api/auth/refresh — no auth; reads refreshToken from httpOnly cookie
router.post('/refresh', refresh);

// POST /api/auth/logout — no auth; clears cookies and revokes refresh token
router.post('/logout', logout);

// GET /api/auth/me - protected; returns req.user
router.get('/me', authMiddleware, (req: Request, res: Response) => {
    const user = (req as Request & { user: { id: string; email: string; role: string } }).user;
    res.json({ user });
});

export default router;
