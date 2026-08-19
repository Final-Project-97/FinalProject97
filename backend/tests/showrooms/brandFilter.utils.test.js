import { describe, it, expect } from '@jest/globals';
import { filterShowroomsByBrand, matchesBrand } from '../../src/showrooms/brandFilter.utils.js';

describe('brandFilter', () => {
  it('matches Toyota via Auto2000 name', () => {
    expect(matchesBrand({ name: 'Auto2000 Tebet' }, 'Toyota')).toBe(true);
  });

  it('filters Honda only', () => {
    const items = [
      { name: 'Toyota Astra', brand: 'Toyota' },
      { name: 'Honda Kemang', brand: 'Honda' },
    ];
    expect(filterShowroomsByBrand(items, 'Honda')).toHaveLength(1);
  });
});