import { describe, it, expect } from '@jest/globals';
import { registerSchema, loginSchema, googleSchema } from '../../src/auth/validation.js';

describe('auth validation', () => {
  describe('registerSchema', () => {
    it('accepts valid payload', () => {
      const r = registerSchema.safeParse({
        name: 'Test',
        email: 'a@b.com',
        password: 'password1',
      });
      expect(r.success).toBe(true);
    });

    it('rejects short password', () => {
      const r = registerSchema.safeParse({ name: 'T', email: 'a@b.com', password: 'short' });
      expect(r.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const r = registerSchema.safeParse({ name: 'T', email: 'bad', password: 'password1' });
      expect(r.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('accepts valid login', () => {
      const r = loginSchema.safeParse({ email: 'a@b.com', password: 'x' });
      expect(r.success).toBe(true);
    });

    it('rejects empty password', () => {
      const r = loginSchema.safeParse({ email: 'a@b.com', password: '' });
      expect(r.success).toBe(false);
    });
  });

  describe('googleSchema', () => {
    it('requires idToken', () => {
      expect(googleSchema.safeParse({}).success).toBe(false);
      expect(googleSchema.safeParse({ idToken: 'tok' }).success).toBe(true);
    });
  });
});