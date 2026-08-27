import { z } from 'zod';

export const createWishlistSchema = z.object({
  carId: z.string().min(1),
  selectedColor: z.string().optional(),
  notes: z.string().max(500).optional(),
  source: z.enum(['manual', 'recommendation', 'detail']).optional(),
  matchScore: z.number().min(0).max(100).optional(),
  aiReason: z.string().max(1000).optional(),
});

export const updateWishlistSchema = z.object({
  selectedColor: z.string().optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.selectedColor !== undefined || data.notes !== undefined,
  { message: 'Minimal satu field untuk diupdate' },
);