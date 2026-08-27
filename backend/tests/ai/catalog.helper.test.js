import { describe, it, expect } from '@jest/globals';
import {
  formatCarLine,
  formatCarSummaryLine,
  formatCarChatCatalogLine,
  parseJsonFromLlm,
} from '../../src/ai/catalog.helper.js';

describe('catalog helper', () => {
  const car = {
    _id: '1',
    name: 'Avanza',
    brand: 'Toyota',
    type: 'MPV',
    slug: 'avanza',
    basePrice: 250000000,
    specs: { seats: 7, engine: '1.5L', transmission: 'AT' },
  };

  it('formatCarLine includes id and price', () => {
    expect(formatCarLine(car)).toContain('Avanza');
    expect(formatCarLine(car)).toContain('1');
  });

  it('formatCarLine uses default seats when specs missing', () => {
    const noSpecs = { ...car, specs: undefined };
    expect(formatCarLine(noSpecs)).toContain('5 kursi');
  });

  it('formatCarSummaryLine includes specs', () => {
    expect(formatCarSummaryLine(car)).toContain('7 kursi');
  });

  it('formatCarSummaryLine uses defaults when specs missing', () => {
    const noSpecs = { ...car, specs: undefined };
    expect(formatCarSummaryLine(noSpecs)).toContain('N/A');
    expect(formatCarSummaryLine(noSpecs)).toContain('5 kursi');
  });

  it('formatCarChatCatalogLine includes slug and seats', () => {
    expect(formatCarChatCatalogLine(car)).toContain('avanza');
    expect(formatCarChatCatalogLine(car)).toContain('Seats: 7');
  });

  it('formatCarChatCatalogLine uses defaults when specs missing', () => {
    const noSpecs = { ...car, specs: undefined };
    expect(formatCarChatCatalogLine(noSpecs)).toContain('Seats: 5');
    expect(formatCarChatCatalogLine(noSpecs)).toContain('Transmission: N/A');
  });

  it('parseJsonFromLlm strips markdown fences', () => {
    const raw = '```json\n[{"carId":"1"}]\n```';
    expect(parseJsonFromLlm(raw)).toEqual([{ carId: '1' }]);
  });
});