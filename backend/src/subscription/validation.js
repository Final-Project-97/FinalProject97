import { z } from 'zod';

// POST /api/subscription/checkout — MVP body boleh kosong
export const checkoutSchema = z.object({
  paymentType: z.literal('premium_monthly').optional().default('premium_monthly'),
}).optional().default({});

// POST /api/subscription/webhook — cek minimal sebelum Midtrans SDK
export const webhookSchema = z.object({
  order_id: z.string().min(1),
  transaction_status: z.string().min(1),
  status_code: z.string().optional(),
  gross_amount: z.string().optional(),
  fraud_status: z.string().optional(),
  signature_key: z.string().optional(),
}).passthrough(); 