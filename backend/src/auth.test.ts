import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app';
import { User } from './models/User';
import { sign, signRefreshToken } from './utils/jwt';

vi.mock('./models/User', () => ({
  User: {
    findOne: vi.fn(),
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

  it('returns 200 with token and user when credentials are valid', async () => {
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
      .send({ email: 'staff@clinic.com', password: 'correct' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(typeof res.body.token).toBe('string');
    expect(typeof res.body.refreshToken).toBe('string');
    expect(res.body.user).toEqual({
      id: 'user-id-123',
      email: 'staff@clinic.com',
      role: 'staff',
    });
  });
});

describe('POST /api/auth/refresh', () => {
  it('returns 400 when refreshToken is missing', async () => {
    const app = createApp();
    const res = await request(app).post('/api/auth/refresh').send({});
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: 'Refresh token required' });
  });

  it('returns 401 when refresh token is invalid', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'invalid' });
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ message: 'Invalid or expired refresh token' });
  });

  it('returns 200 with new token and refreshToken when valid', async () => {
    const payload = { id: 'user-1', email: 'staff@clinic.com', role: 'staff' };
    const refreshToken = signRefreshToken(payload);
    const app = createApp();
    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Content-Type', 'application/json')
      .send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user).toMatchObject(payload);
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
