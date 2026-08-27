import { describe, it, expect } from '@jest/globals';
import { signToken, verifyToken } from '../../src/auth/jwt.js';

describe('jwt', () => {
  const user = { _id: '507f1f77bcf86cd799439011', role: 'buyer' };

  it('signs and verifies token', () => {
    const token = signToken(user);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(String(user._id));
    expect(decoded.role).toBe('buyer');
  });

  it('throws on invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});