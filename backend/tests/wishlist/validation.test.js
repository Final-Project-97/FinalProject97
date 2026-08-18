import { describe, it, expect } from '@jest/globals';
import { createWishlistSchema, updateWishlistSchema } from '../../src/wishlist/validation.js';

describe('wishlist validation', () => {
  it('createWishlistSchema requires carId', () => {
    expect(createWishlistSchema.safeParse({}).success).toBe(false);
    expect(createWishlistSchema.safeParse({ carId: 'abc' }).success).toBe(true);
  });

  it('updateWishlistSchema requires at least one field', () => {
    expect(updateWishlistSchema.safeParse({}).success).toBe(false);
    expect(updateWishlistSchema.safeParse({ notes: 'hi' }).success).toBe(true);
  });
});