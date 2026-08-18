import { describe, it, expect } from '@jest/globals';
import { formatCarLine, formatCarSummaryLine, parseJsonFromLlm } from '../../src/ai/catalog.helper.js';

describe('catalog helper', () => {
  const car = {
    _id: '1', name: 'Avanza', brand: 'Toyota', type: 'MPV',
    basePrice: 250000000, specs: { seats: 7, engine: '1.5L', transmission: 'AT' },
  };

  it('formatCarLine includes id and price', () => {
    expect(formatCarLine(car)).toContain('Avanza');
    expect(formatCarLine(car)).toContain('1');
  });

  it('formatCarSummaryLine includes specs', () => {
    expect(formatCarSummaryLine(car)).toContain('7 kursi');
  });

  it('parseJsonFromLlm strips markdown fences', () => {
    const raw = '```json\n[{"carId":"1"}]\n```';
    expect(parseJsonFromLlm(raw)).toEqual([{ carId: '1' }]);
  });
});