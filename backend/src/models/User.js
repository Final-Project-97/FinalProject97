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
}

export default User;