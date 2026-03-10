import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp, createTestApp } from './app';
import { User } from './models/User';
import { RefreshToken } from './models/RefreshToken';
import { sign, signRefreshToken, verifyRefresh } from './utils/jwt';

vi.mock('./models/User', () => ({
  User: {
    findOne: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('./models/RefreshToken', () => ({
  RefreshToken: {
    create: vi.fn().mockResolvedValue({}),
    findOneAndDelete: vi.fn(),
  },
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.mocked(User.findOne).mockReset();
  });

  it('returns 400 when email is missing', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'secret' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Email and password required' });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('returns 400 when password is missing', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@clinic.com' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Email and password required' });
    expect(User.findOne).not.toHaveBeenCalled();
  });

  it('returns 401 when user not found', async () => {
    vi.mocked(User.findOne).mockResolvedValue(null);
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@clinic.com', password: 'secret' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
    expect(User.findOne).toHaveBeenCalledWith({ email: 'nobody@clinic.com' });
  });

  it('returns 401 when password does not match', async () => {
    vi.mocked(User.findOne).mockResolvedValue({
      _id: { toString: () => 'user-id' },
      email: 'staff@clinic.com',
      role: 'staff',
      comparePassword: vi.fn().mockResolvedValue(false),
    } as never);
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'staff@clinic.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid credentials' });
  });

  it('returns 200 with user and sets httpOnly cookies when credentials are valid', async () => {
    const mockUser = {
      _id: { toString: () => 'user-id-123' },
      email: 'staff@clinic.com',
      role: 'staff' as const,
      comparePassword: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(User.findOne).mockResolvedValue(mockUser as never);
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send({ email: 'staff@clinic.com', password: 'correct' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: { id: 'user-id-123', email: 'staff@clinic.com', role: 'staff' } });
    expect(res.body).not.toHaveProperty('token');
    expect(res.body).not.toHaveProperty('refreshToken');
    expect(res.headers['set-cookie']).toBeDefined();
    expect(Array.isArray(res.headers['set-cookie'])).toBe(true);
    const setCookies = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : res.headers['set-cookie']
        ? [res.headers['set-cookie'] as string]
        : [];
    expect(setCookies.some((c) => c.includes('accessToken='))).toBe(true);
    expect(setCookies.some((c) => c.includes('refreshToken='))).toBe(true);
  });
});

describe('POST /api/auth/refresh', () => {
  it('round-trips refresh token with jti', () => {
    const payload = { id: 'u', email: 'e@e.com', role: 'staff' };
    const { token, jti } = signRefreshToken(payload);
    const decoded = verifyRefresh(token);
    expect(decoded).toMatchObject(payload);
    expect(decoded.jti).toBe(jti);
  });

  it('returns 401 when refresh cookie is missing', async () => {
    const app = createApp();
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Refresh token required' });
  });

  it('returns 401 when refresh token is invalid', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', ['refreshToken=invalid']);
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid or expired refresh token' });
  });

  it('returns 401 when refresh payload has invalid id (malformed)', async () => {
    const payload = { id: 'user-1', email: 'staff@clinic.com', role: 'staff' };
    const { token: refreshToken } = signRefreshToken(payload);
    const app = createTestApp();
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Content-Type', 'application/json')
      .send({ refreshToken });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid or expired refresh token' });
  });

  it('returns 200 with user and new cookies when valid refresh (rotation)', async () => {
    const payload = { id: '507f1f77bcf86cd799439011', email: 'staff@clinic.com', role: 'staff' };
    const { token: refreshToken, jti } = signRefreshToken(payload);
    vi.mocked(RefreshToken.findOneAndDelete).mockResolvedValue({ jti } as never);
    vi.mocked(RefreshToken.create).mockResolvedValue({} as never);
    const app = createTestApp();
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Content-Type', 'application/json')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject(payload);
    expect(res.body).not.toHaveProperty('token');
    expect(res.headers['set-cookie']).toBeDefined();
    const setCookiesRotate = Array.isArray(res.headers['set-cookie'])
      ? res.headers['set-cookie']
      : res.headers['set-cookie']
        ? [res.headers['set-cookie'] as string]
        : [];
    expect(setCookiesRotate.some((c) => c.includes('accessToken='))).toBe(true);
    expect(setCookiesRotate.some((c) => c.includes('refreshToken='))).toBe(true);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears cookies', async () => {
    const app = createApp();
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'Logged out' });
    expect(res.headers['set-cookie']).toBeDefined();
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const app = createApp();
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Unauthorized' });
  });

  it('returns 401 when token is invalid', async () => {
    const app = createApp();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Unauthorized' });
  });

  it('returns 200 with user when valid Bearer token is sent', async () => {
    const payload = { id: 'user-1', email: 'staff@clinic.com', role: 'staff' };
    const token = sign(payload);
    const app = createApp();
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject(payload);
    expect(res.body).toHaveProperty('user');
  });
});
