import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sign } from '../utils/jwt';

export async function login(
    req: Request,
    res: Response,
    next: NextFunction
) { 
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
            res.status(401).json({ message: 'Incalid credentials' });
            return;
        }
        const payload = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
        };
        const token = sign(payload);
        res.json({ token, user: payload });
    } catch (err) {
        next(err);
    }
}
