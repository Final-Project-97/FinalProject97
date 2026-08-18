import { describe, it, expect } from '@jest/globals';
import { fetchSeedShowrooms } from '../../src/showrooms/seedService.js';

describe('fetchSeedShowrooms', () => {
  it('returns sorted array', () => {
    const data = fetchSeedShowrooms(-6.2, 106.8);
    expect(Array.isArray(data)).toBe(true);
    expect(data.every((d) => d.distanceKm !== undefined)).toBe(true);
  });
});