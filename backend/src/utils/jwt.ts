import jwt, { type SignOptions } from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d';

function getSecret(): string {
    const s = process.env.JWT_SECRET;
    if (!s) throw new Error('JWT_SECRET is not defined in .env');
    return s;
}

export type JwtPayload = { id: string; email: string; role: string };

/** Refresh token payload includes jti for rotation/revocation. */
export type RefreshPayload = JwtPayload & { jti: string };

export const signAccessToken = (payload: JwtPayload) => {
    return jwt.sign(payload, getSecret(), { expiresIn: ACCESS_EXPIRY } as SignOptions);
};

/** Returns the token and its jti (store jti in DB for rotation/revocation). */
export const signRefreshToken = (payload: JwtPayload): { token: string; jti: string } => {
    const jti = randomUUID();
    const token = jwt.sign(payload, getSecret(), { expiresIn: REFRESH_EXPIRY, jwtid: jti } as SignOptions);
    return { token, jti };
};

/** Short-lived token for MFA step (e.g. 2 min). */
export const signMfaTempToken = (payload: JwtPayload) => {
    return jwt.sign(payload, getSecret(), { expiresIn: '2m' } as SignOptions);
};

/** @deprecated Use signAccessToken for new code. */
export const sign = (payload: JwtPayload) => signAccessToken(payload);

export const verify = (token: string) => {
    return jwt.verify(token, getSecret()) as unknown as JwtPayload;
};

/** Verify refresh token and return payload including jti. */
export const verifyRefresh = (token: string) => {
    return jwt.verify(token, getSecret()) as unknown as RefreshPayload;
};
