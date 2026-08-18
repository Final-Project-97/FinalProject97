import { describe, it, expect } from '@jest/globals';
import { checkoutSchema, webhookSchema } from '../../src/subscription/validation.js';

describe('subscription validation', () => {
  it('checkoutSchema defaults paymentType', () => {
    const r = checkoutSchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data.paymentType).toBe('premium_monthly');
  });

  it('webhookSchema requires order_id and transaction_status', () => {
    expect(webhookSchema.safeParse({}).success).toBe(false);
    expect(webhookSchema.safeParse({
      order_id: 'o1',
      transaction_status: 'settlement',
    }).success).toBe(true);
  });
});