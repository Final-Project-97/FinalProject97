import { AiUsageLog } from '../models/index.js';

export async function logAiUsage({ userId, feature, metadata = {} }) {
  try {
    await AiUsageLog.create({
      userId: String(userId),
      feature,
      tokensUsed: 1,
      metadata,
      createdAt: new Date(),
    });
  } catch (err) {
    console.warn('[AI] Gagal simpan usage log:', err.message);
  }
}