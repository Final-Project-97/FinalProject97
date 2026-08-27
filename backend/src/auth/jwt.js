import jwt from 'jsonwebtoken';

const EXPIRES_IN = '24h';

export function signToken(user) {
  return jwt.sign(
    { userId: String(user._id), role: user.role || 'buyer' },
    process.env.JWT_SECRET,
    { expiresIn: EXPIRES_IN },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}