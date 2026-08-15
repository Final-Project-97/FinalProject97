import dotenv from 'dotenv';

dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI;
export const MONGODB_DB_NAME =
  process.env.MONGODB_DB_NAME ||
  process.env.MONGOLOQUENT_DATABASE_NAME ||
  'rac-ai';

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is required');
}

// Mongoloquent v4 — map env PRD → env bawaan ORM
process.env.MONGOLOQUENT_DATABASE_URI =
  process.env.MONGOLOQUENT_DATABASE_URI || MONGODB_URI;
process.env.MONGOLOQUENT_DATABASE_NAME =
  process.env.MONGOLOQUENT_DATABASE_NAME || MONGODB_DB_NAME;
process.env.MONGOLOQUENT_TIMEZONE =
  process.env.MONGOLOQUENT_TIMEZONE || 'Asia/Jakarta';