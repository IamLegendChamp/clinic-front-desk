import type { Response } from 'express';

const ACCESS_MAX_AGE_SEC = 15 * 60; // 15m
const REFRESH_MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7d
const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_MAX_AGE_SEC * 1000 });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_MAX_AGE_SEC * 1000 });
}

export function clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
}
