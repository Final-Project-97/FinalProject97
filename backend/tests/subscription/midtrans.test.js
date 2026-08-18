import { describe, it, expect } from '@jest/globals';
import { generateOrderId, isPaymentSuccess } from '../../src/subscription/midtrans.js';

describe('midtrans utils', () => {
  it('generateOrderId contains userId', () => {
    const id = generateOrderId('user123');
    expect(id).toMatch(/^rac-premium-user123-/);
  });

  it('isPaymentSuccess for settlement', () => {
    expect(isPaymentSuccess('settlement', 'accept')).toBe(true);
  });

  it('isPaymentSuccess false for deny', () => {
    expect(isPaymentSuccess('deny', 'accept')).toBe(false);
  });

  it('isPaymentSuccess for capture', () => {
    expect(isPaymentSuccess('capture', null)).toBe(true);
  });
  
  it('isPaymentSuccess pending + accept', () => {
    expect(isPaymentSuccess('pending', 'accept')).toBe(true);
  });
});