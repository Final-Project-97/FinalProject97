export function buildSubscriptionStatus(user, sub) {
  const now = Date.now();
  const expiresAt = sub?.expiresAt ? new Date(sub.expiresAt) : null;
  const premiumActive = !!(expiresAt && expiresAt.getTime() > now);
  const daysRemaining = premiumActive
    ? Math.ceil((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    premiumActive,
    expiresAt: expiresAt || null,
    daysRemaining,
    paymentStatus: sub?.paymentStatus || null,
    paymentType: sub?.paymentType || 'premium_monthly',
    aiTokensRemaining: user.aiTokensRemaining ?? 0,
  };
}