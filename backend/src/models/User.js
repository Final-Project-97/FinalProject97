import BaseModel from './BaseModel.js';

/**
 * Collection: users
 *
 * Fields (ERD v1.4):
 * - email: unique, lowercase
 * - passwordHash: bcrypt — kosong jika Google-only
 * - googleId: unique sparse — kosong jika email/password-only
 * - role: buyer
 * - aiTokensRemaining: default 5
 *
 * Constraint: minimal passwordHash ATAU googleId terisi
 */
class User extends BaseModel {
  // auto collection: "users"
  static $schema = {
    email: String,
    passwordHash: String,
    googleId: String,
    name: String,
    avatarUrl: String,
    role: { type: String, default: 'buyer' },
    aiTokensRemaining: { type: Number, default: 5 },
    location: {
      lat: Number,
      lng: Number,
      address: String,
    },
  };
}

export default User;