import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, signMfaTempToken, verify } from '../utils/jwt';

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => { 
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ message: 'Email and password required' });
            return;
        }
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const match = await user.comparePassword(password);
        if (!match) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        if (user.mfaEnabled) {
            const tempToken = signMfaTempToken(payload);
            res.json({ requiresMfa: true, tempToken, user: payload });
            return;
        }
        const token = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        res.json({ token, refreshToken, user: payload });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ message: 'Refresh token required' });
            return;
        }
        const payload = verify(token);
        const { id, email, role } = payload;
        const cleanPayload = { id, email, role };
        const accessToken = signAccessToken(cleanPayload);
        const refreshToken = signRefreshToken(cleanPayload);
        res.json({ token: accessToken, refreshToken, user: cleanPayload });
    } catch (err) {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};
