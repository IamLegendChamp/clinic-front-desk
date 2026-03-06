import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env');
}

export function sign(payload: { id: string, email: string, role: string }) {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: '7d' });
}

export function verify(token: string) {
    return jwt.verify(token, JWT_SECRET!) as unknown as { id: string; email: string; role: string };
}
