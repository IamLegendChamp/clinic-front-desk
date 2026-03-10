// Ensure JWT_SECRET is set before any module that uses it (e.g. jwt.ts) is loaded.
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-vitest';
