import { describe, it, expect } from '@jest/globals';
import { haversineKm, sortByDistance } from '../../src/showrooms/distance.utils.js';

describe('distance utils', () => {
  it('haversineKm returns 0 for same point', () => {
    expect(haversineKm(-6.2, 106.8, -6.2, 106.8)).toBe(0);
  });

  it('sortByDistance orders nearest first', () => {
    const items = [
      { name: 'Far', lat: -7, lng: 107 },
      { name: 'Near', lat: -6.21, lng: 106.81 },
    ];
    const sorted = sortByDistance(items, -6.2, 106.8);
    expect(sorted[0].name).toBe('Near');
    expect(sorted[0].distanceKm).toBeDefined();
  });
});