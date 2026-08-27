import { describe, it, expect } from '@jest/globals';
import { buildSubscriptionStatus } from '../../src/subscription/subscription.utils.js';

describe('buildSubscriptionStatus', () => {
  const user = { aiTokensRemaining: 5 };

  it('premium inactive without subscription', () => {
    const s = buildSubscriptionStatus(user, null);
    expect(s.premiumActive).toBe(false);
    expect(s.daysRemaining).toBe(0);
  });

  it('premium active when expiresAt in future', () => {
    const future = new Date(Date.now() + 5 * 86400000);
    const s = buildSubscriptionStatus(user, { expiresAt: future, paymentStatus: 'success' });
    expect(s.premiumActive).toBe(true);
    expect(s.daysRemaining).toBeGreaterThan(0);
  });

  it('premium inactive when expired', () => {
    const past = new Date(Date.now() - 86400000);
    const s = buildSubscriptionStatus(user, { expiresAt: past, paymentStatus: 'success' });
    expect(s.premiumActive).toBe(false);
  });
});