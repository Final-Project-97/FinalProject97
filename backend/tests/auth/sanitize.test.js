import { describe, it, expect } from '@jest/globals';
import { toPublicUser } from '../../src/auth/sanitize.js';

describe('toPublicUser', () => {
  it('removes passwordHash', () => {
    const user = { _id: '1', email: 'a@b.com', passwordHash: 'secret' };
    const safe = toPublicUser(user);
    expect(safe.passwordHash).toBeUndefined();
    expect(safe.email).toBe('a@b.com');
  });

  it('returns null for falsy input', () => {
    expect(toPublicUser(null)).toBeNull();
  });
});