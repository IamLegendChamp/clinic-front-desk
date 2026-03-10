import { Router, Request, Response } from 'express';
import { login, refresh, logout } from '../controllers/authController';
import { setup as mfaSetup, enable as mfaEnable, verifyMfa, disable as mfaDisable } from '../controllers/mfaController';
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

// MFA — setup returns QR; enable confirms with code; verify exchanges tempToken+code for tokens; disable turns off MFA
router.get('/mfa/setup', authMiddleware, mfaSetup);
router.post('/mfa/enable', authMiddleware, mfaEnable);
router.post('/mfa/verify', verifyMfa);
router.post('/mfa/disable', authMiddleware, mfaDisable);

export default router;
