import { describe, it, expect } from 'vitest';
import { generateMockJwt, decodeJwt, AuthUser } from '../utils/jwt';

describe('JWT Authentication System', () => {
  const sampleUser: AuthUser = {
    id: 'u_101',
    email: 'admin@gmail.com',
    name: 'Admin User',
    role: 'admin',
  };

  it('generates a valid 3-part base64 JWT token string', () => {
    const token = generateMockJwt(sampleUser);
    expect(token).toBeDefined();

    const parts = token.split('.');
    expect(parts.length).toBe(3); // Header.Payload.Signature
  });

  it('decodes JWT token payload correctly', () => {
    const token = generateMockJwt(sampleUser);
    const decoded = decodeJwt(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.email).toBe('admin@gmail.com');
    expect(decoded?.role).toBe('admin');
    expect(decoded?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects expired JWT tokens', () => {
    // Generate token expired 10 seconds ago (-10s)
    const expiredToken = generateMockJwt(sampleUser, -10);
    const decoded = decodeJwt(expiredToken);
    expect(decoded).toBeNull();
  });
});
