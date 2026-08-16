import bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/index.js';
import { registerSchema, loginSchema, googleSchema } from './validation.js';
import { signToken } from './jwt.js';
import { toPublicUser } from './sanitize.js';
import { Subscription } from '../models/index.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function authPayload(user) {
  return {
    success: true,
    token: signToken(user),
    user: toPublicUser(user),
  };
}

export async function register(req, res) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Validasi gagal' });
    }

    const name = parsed.data.name.trim();
    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;

    const existing = await User.where('email', email).first();
    if (existing) {
      return res.status(409).json({ success: false, code: 'EMAIL_TAKEN', message: 'Email sudah terdaftar' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'buyer',
      aiTokensRemaining: 5,
    });

    return res.status(201).json(authPayload(user));
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ success: false, code: 'EMAIL_TAKEN', message: 'Email sudah terdaftar' });
    }
    console.error('[auth/register]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}

export async function login(req, res) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Validasi gagal' });
    }

    const email = parsed.data.email.toLowerCase();
    const user = await User.where('email', email).first();

    if (!user || !user.passwordHash) {
      if (user?.googleId && !user.passwordHash) {
        return res.status(400).json({
          success: false,
          message: 'Akun ini memakai Google. Masuk dengan Google.',
        });
      }
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, message: 'Email atau password salah' });
    }

    return res.status(200).json(authPayload(user));
  } catch (err) {
    console.error('[auth/login]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}

export async function google(req, res) {
  try {
    const parsed = googleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, message: 'Validasi gagal' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: parsed.data.idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email || !payload.sub) {
      return res.status(401).json({ success: false, message: 'Token Google tidak valid' });
    }

    const email = payload.email.toLowerCase();
    const googleId = payload.sub;

    let user = await User.where('googleId', googleId).first();
    if (!user) {
      user = await User.where('email', email).first();
      if (user) {
        await User.where('_id', user._id).update({ googleId });
        user = await User.where('_id', user._id).first();
      } else {
        user = await User.create({
          email,
          googleId,
          name: payload.name || email,
          avatarUrl: payload.picture || '',
          role: 'buyer',
          aiTokensRemaining: 5,
        });
      }
    }

    return res.status(200).json(authPayload(user));
  } catch (err) {
    console.error('[auth/google]', err);
    return res.status(401).json({ success: false, message: 'Token Google tidak valid' });
  }
}

export async function logout(_req, res) {
  return res.status(200).json({ success: true, message: 'Logout di client: hapus token' });
}

export async function me(req, res) {
  try {
    const sub = await Subscription.where('userId', String(req.user._id)).first();
    const now = Date.now();
    const expiresAt = sub?.expiresAt ? new Date(sub.expiresAt) : null;
    const premiumActive = expiresAt && expiresAt.getTime() > now;
    const daysRemaining = premiumActive
      ? Math.ceil((expiresAt.getTime() - now) / (1000 * 60 * 60 * 24))
      : 0;

    return res.status(200).json({
      success: true,
      user: req.user, // sudah tanpa passwordHash
      aiTokensRemaining: req.user.aiTokensRemaining,
      subscription: {
        expiresAt: expiresAt || null,
        daysRemaining,
        paymentStatus: sub?.paymentStatus || null,
      },
    });
  } catch (err) {
    console.error('[auth/me]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}