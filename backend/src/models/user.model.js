import { Model } from "mongoloquent";

export class User extends Model {
  static get collection() {
    return "users";
  }

  static get schema() {
    return {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      aiTokensRemaining: { type: Number, default: 5 },
      createdAt: Date,
      updatedAt: Date,
    };
  }
}
