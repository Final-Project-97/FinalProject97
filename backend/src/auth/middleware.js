import { User } from '../models/index.js';
import { verifyToken } from './jwt.js';
import { toPublicUser } from './sanitize.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const decoded = verifyToken(token);
    const user = await User.where('_id', decoded.userId).first();
    if (!user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    req.user = toPublicUser(user);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
}