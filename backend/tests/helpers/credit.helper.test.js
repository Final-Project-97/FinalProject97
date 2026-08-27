import { describe, it, expect } from '@jest/globals';
import { calculateCreditSimulation } from '../../src/helpers/credit.helper.js';

describe('calculateCreditSimulation', () => {
  it('calculates flat interest correctly', () => {
    const r = calculateCreditSimulation(300_000_000, 60_000_000, 36, 7.5);
    expect(r.loanAmount).toBe(240_000_000);
    expect(r.monthlyInstallment).toBeGreaterThan(0);
    expect(r.totalPayment).toBe(r.loanAmount + r.totalInterest);
  });

  it('throws when DP >= car price', () => {
    expect(() => calculateCreditSimulation(100, 100, 12, 7.5)).toThrow(
      'Uang muka (DP) tidak boleh lebih besar atau sama dengan harga OTR mobil.',
    );
  });
});