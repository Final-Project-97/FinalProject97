import { describe, it, expect } from '@jest/globals';
import { nearbyQuerySchema } from '../../src/showrooms/validation.js';

describe('nearbyQuerySchema', () => {
  it('coerces string lat/lng', () => {
    const r = nearbyQuerySchema.safeParse({ lat: '-6.2', lng: '106.8' });
    expect(r.success).toBe(true);
    expect(r.data.lat).toBe(-6.2);
  });

  it('rejects invalid lat', () => {
    expect(nearbyQuerySchema.safeParse({ lat: 999, lng: 0 }).success).toBe(false);
  });

  it('accepts optional brand', () => {
    const r = nearbyQuerySchema.safeParse({ lat: '-6.2', lng: '106.8', brand: 'Toyota' });
    expect(r.success).toBe(true);
    expect(r.data.brand).toBe('Toyota');
  });
});