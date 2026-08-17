import BaseModel from './BaseModel.js';

class Subscription extends BaseModel {
  // auto collection: "subscriptions"
  static $schema = {
    userId: String,
    expiresAt: Date,
    startedAt: Date,
    orderId: String,
    amount: Number,
    paymentStatus: String, // pending | success | failed | expired
    paymentType: { type: String, default: 'premium_monthly' },
    midtransPayload: Object,
    paidAt: Date,
  };
}

export default Subscription;