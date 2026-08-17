import cron from 'node-cron';
import { Subscription, User } from '../models/index.js';

export async function runExpiryJob() {
  const now = new Date();

  // Subscription premium yang sudah lewat
  const expiredSubs = await Subscription.where('expiresAt', '<=', now)
    .where('paymentStatus', 'success')
    .get();

  let updated = 0;

  for (const sub of expiredSubs) {
    const user = await User.where('_id', sub.userId).first();
    if (!user) continue;

    // Skip kalau token sudah 0
    if (user.aiTokensRemaining === 0) continue;

    await User.where('_id', user._id).update({ aiTokensRemaining: 0 });
    updated += 1;
    console.log(`[cron/expiry] user ${sub.userId} → aiTokensRemaining=0`);
  }

  console.log(`[cron/expiry] selesai. updated=${updated}`);
  return updated;
}

export function startExpiryCron() {
  // Setiap jam menit 0 — MVP cukup
  cron.schedule('0 * * * *', () => {
    runExpiryJob().catch((err) => console.error('[cron/expiry]', err));
  });

  console.log('[cron/expiry] scheduled: 0 * * * *');
}