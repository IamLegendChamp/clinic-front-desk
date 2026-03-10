import { Request, Response, NextFunction } from 'express';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken, verify } from '../utils/jwt';

const APP_NAME = process.env.MFA_APP_NAME ?? 'Clinic Front Desk';

/** GET /api/auth/mfa/setup — auth required; returns secret and QR data URL. */
export const setup = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqUser = (req as Request & { user: { id: string; email: string; role: string } }).user;
        const user = await User.findById(reqUser.id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const secret = speakeasy.generateSecret({
            name: `${APP_NAME} (${user.email})`,
            length: 20,
        });
        const dataUrl = await QRCode.toDataURL(secret.otpauth_url!);
        user.mfaSecret = secret.base32;
        await user.save();
        res.json({ secret: secret.base32, qrDataUrl: dataUrl });
    } catch (err) {
        next(err);
    }
};

/** POST /api/auth/mfa/enable — auth required; body: { code }. Verifies code and sets mfaEnabled. */
export const enable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { code } = req.body;
        if (!code || typeof code !== 'string') {
            res.status(400).json({ message: 'Code required' });
            return;
        }
        const reqUser = (req as Request & { user: { id: string; email: string; role: string } }).user;
        const user = await User.findById(reqUser.id);
        if (!user || !user.mfaSecret) {
            res.status(400).json({ message: 'Run MFA setup first' });
            return;
        }
        const valid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: code.trim(),
            window: 1,
        });
        if (!valid) {
            res.status(400).json({ message: 'Invalid code' });
            return;
        }
        user.mfaEnabled = true;
        await user.save();
        res.json({ message: 'MFA enabled' });
    } catch (err) {
        next(err);
    }
};

/** POST /api/auth/mfa/verify — no auth; body: { tempToken, code }. Exchanges tempToken + TOTP code for real tokens. */
export const verifyMfa = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tempToken, code } = req.body;
        if (!tempToken || !code) {
            res.status(400).json({ message: 'tempToken and code required' });
            return;
        }
        let payload: { id: string; email: string; role: string };
        try {
            payload = verify(tempToken);
        } catch {
            res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
            return;
        }
        const user = await User.findById(payload.id);
        if (!user || !user.mfaEnabled || !user.mfaSecret) {
            res.status(401).json({ message: 'MFA not enabled for this account' });
            return;
        }
        const valid = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: String(code).trim(),
            window: 1,
        });
        if (!valid) {
            res.status(401).json({ message: 'Invalid code' });
            return;
        }
        const token = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);
        res.json({ token, refreshToken, user: payload });
    } catch (err) {
        next(err);
    }
};

/** POST /api/auth/mfa/disable — auth required; disables MFA for the user. */
export const disable = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const reqUser = (req as Request & { user: { id: string; email: string; role: string } }).user;
        await User.updateOne(
            { _id: reqUser.id },
            { $set: { mfaEnabled: false }, $unset: { mfaSecret: 1 } }
        );
        res.json({ message: 'MFA disabled' });
    } catch (err) {
        next(err);
    }
};
