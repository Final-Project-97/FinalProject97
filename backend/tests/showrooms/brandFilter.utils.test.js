import { describe, it, expect } from '@jest/globals';
import {
  filterShowroomsByBrand,
  matchesBrand,
  inferBrandFromName,
  getBrandKeywords,
  normalizeBrand,
} from '../../src/showrooms/brandFilter.utils.js';

describe('brandFilter', () => {
  it('normalizeBrand trims input', () => {
    expect(normalizeBrand('  Toyota  ')).toBe('Toyota');
    expect(normalizeBrand(null)).toBe('');
  });

  it('getBrandKeywords returns mapped keywords for Toyota', () => {
    expect(getBrandKeywords('Toyota')).toContain('auto2000');
  });

  it('getBrandKeywords returns empty for blank brand', () => {
    expect(getBrandKeywords('')).toEqual([]);
  });

  it('getBrandKeywords falls back to lowercase brand name', () => {
    expect(getBrandKeywords('BYD')).toEqual(['byd']);
  });

  it('inferBrandFromName detects Honda', () => {
    expect(inferBrandFromName('Honda Istana Kemang')).toBe('Honda');
  });

  it('inferBrandFromName returns null when unknown', () => {
    expect(inferBrandFromName('Random Dealer')).toBeNull();
  });

  it('matches Toyota via Auto2000 name', () => {
    expect(matchesBrand({ name: 'Auto2000 Tebet' }, 'Toyota')).toBe(true);
  });

  it('matches brand via explicit brand field', () => {
    expect(matchesBrand({ name: 'Dealer X', brand: 'Honda' }, 'Honda')).toBe(true);
  });

  it('matches brand via address keyword', () => {
    expect(
      matchesBrand({ name: 'Dealer X', address: 'Official Toyota partner' }, 'Toyota'),
    ).toBe(true);
  });

  it('returns true for any item when brand filter empty', () => {
    expect(matchesBrand({ name: 'Anything' }, '')).toBe(true);
  });

  it('filters Honda only', () => {
    const items = [
      { name: 'Toyota Astra', brand: 'Toyota' },
      { name: 'Honda Kemang', brand: 'Honda' },
    ];
    expect(filterShowroomsByBrand(items, 'Honda')).toHaveLength(1);
  });

  it('returns all items when brand is empty', () => {
    const items = [
      { name: 'Toyota Astra', brand: 'Toyota' },
      { name: 'Honda Kemang', brand: 'Honda' },
    ];
    expect(filterShowroomsByBrand(items, '')).toHaveLength(2);
  });

  it('handles null items array safely', () => {
    expect(filterShowroomsByBrand(null, 'Toyota')).toEqual([]);
  });
});