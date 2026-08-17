import { Model } from "mongoloquent";

export class Subscription extends Model {
  static get collection() {
    return "subscriptions";
  }

  static get schema() {
    return {
      userId: { type: String, required: true },
      paymentStatus: { type: String, required: true },
      expiresAt: { type: Date, required: true },
      createdAt: Date,
      updatedAt: Date,
    };
  }
}
