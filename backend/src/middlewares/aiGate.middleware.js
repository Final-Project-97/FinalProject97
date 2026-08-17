import { User, Subscription } from '../models/index.js'

/**
 * Middleware untuk memvalidasi hak akses dan kuota token AI pengguna via Mongoloquent.
 * Menerapkan aturan: Premium aktif (unlimited) ATAU Free Tier (potong token jika > 0).
 */
export const aiGateMiddleware = async (req, res, next) => {
  try {
    // 1. Pastikan objek pengguna tersedia dari middleware autentikasi sebelumnya (JWT)
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Akses ditolak. Autentikasi pengguna diperlukan.",
      });
    }

    // 2. Ambil data profil pengguna via Mongoloquent
    let user = null;
    try {
      user = await User.find(userId);
    } catch {
      user = await User.where("_id", String(userId)).first();
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profil pengguna tidak ditemukan di database.",
      });
    }

    // 3. Periksa status langganan aktif di koleksi subscriptions (expiresAt > now & paymentStatus = success)
    let activeSubscription = null;
    try {
      activeSubscription = await Subscription.where("userId", String(userId))
        .where("paymentStatus", "success")
        .where("expiresAt", ">", new Date())
        .first();
    } catch (subErr) {
      console.warn("[AI Gate Middleware] Gagal memeriksa data berlangganan:", subErr.message);
    }

    // 4. Skenario A: Pengguna adalah PREMIUM (Aktif) -> Akses Unlimited tanpa potong token
    if (activeSubscription) {
      req.aiAccessType = "premium";
      return next(); // Lolos ke controller AI
    }

    // 5. Skenario B: Pengguna adalah FREE TIER -> Periksa sisa token
    const currentTokens = user.aiTokensRemaining ?? 0;

    if (currentTokens > 0) {
      const updatedTokens = currentTokens - 1;

      // Kurangi 1 token di database via Mongoloquent
      await User.where("_id", user._id || userId).update({
        aiTokensRemaining: updatedTokens,
        updatedAt: new Date(),
      });

      req.aiAccessType = "free";
      req.remainingTokens = updatedTokens;
      return next(); // Lolos ke controller AI
    }

    // 6. Skenario C: Token Habis & Tidak Langganan -> Blokir akses
    return res.status(403).json({
      success: false,
      code: "TOKEN_EXHAUSTED",
      error: "TOKEN_EXHAUSTED",
      message:
        "Kuota token AI gratis Anda sudah habis. Silakan lakukan upgrade ke akun Premium untuk akses tanpa batas.",
    });
  } catch (error) {
    console.error("[AI Gate Middleware] Terjadi kesalahan sistem:", error);
    return res.status(500).json({
      success: false,
      message: "Kesalahan internal server pada verifikasi kuota AI.",
    });
  }
};
