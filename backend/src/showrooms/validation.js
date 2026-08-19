import { z } from 'zod';

export const nearbyQuerySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  brand: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),
});