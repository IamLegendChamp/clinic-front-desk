import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { RefreshToken } from '../models/RefreshToken';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../utils/jwt';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies';

const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7d

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
        const accessToken = signAccessToken(payload);
        const { token: refreshToken, jti } = signRefreshToken(payload);
        await RefreshToken.create({
            jti,
            userId: user._id,
            expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
        });
        setAuthCookies(res, accessToken, refreshToken);
        res.json({ user: payload });
    } catch (err) {
        next(err);
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.refreshToken ?? req.body?.refreshToken;
        if (!token) {
            res.status(401).json({ message: 'Refresh token required' });
            return;
        }
        const payload = verifyRefresh(token);
        const { id, email, role, jti } = payload;
        if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }
        const deleted = await RefreshToken.findOneAndDelete({ jti });
        if (!deleted) {
            res.status(401).json({ message: 'Invalid or expired refresh token' });
            return;
        }
        const cleanPayload = { id, email, role };
        const accessToken = signAccessToken(cleanPayload);
        const { token: newRefreshToken, jti: newJti } = signRefreshToken(cleanPayload);
        await RefreshToken.create({
            jti: newJti,
            userId: new mongoose.Types.ObjectId(id),
            expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
        });
        setAuthCookies(res, accessToken, newRefreshToken);
        res.json({ user: cleanPayload });
    } catch {
        res.status(401).json({ message: 'Invalid or expired refresh token' });
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.refreshToken;
        if (token) {
            try {
                const payload = verifyRefresh(token);
                await RefreshToken.findOneAndDelete({ jti: payload.jti });
            } catch {
                // token invalid or expired, nothing to revoke
            }
        }
        clearAuthCookies(res);
        res.json({ message: 'Logged out' });
    } catch (err) {
        next(err);
    }
};
