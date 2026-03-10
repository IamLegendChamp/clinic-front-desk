import { Request, Response, NextFunction } from 'express';
import { verify } from "../utils/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken ?? (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    try {
        const payload = verify(token);
        (req as Request & { user: { id: string; email: string; role: string; } }).user = payload;
        next();
    } catch {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
