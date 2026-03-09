import { Request, Response, NextFunction } from 'express';
import { verify } from "../utils/jwt";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
    }
    const token = authHeader.slice(7);
    try {
        const payload = verify(token);
        (req as Request & { user: { id: string; email: string; role: string; } }).user = payload;
        next();
    } catch {
        res.status(401).json({ message: 'Unauthorized' });
    }
};
