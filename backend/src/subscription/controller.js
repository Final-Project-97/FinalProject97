import { User, Subscription } from '../models/index.js';
import { buildSubscriptionStatus } from './subscription.utils.js';
import {
  snap,
  coreApi,
  PREMIUM_PRICE,
  generateOrderId,
  isPaymentSuccess,
} from './midtrans.js';

export async function getStatus(req, res) {
  try {
    const userId = String(req.user._id);
    const user = await User.where('_id', userId).first();
    const sub = await Subscription.where('userId', userId).first();

    return res.status(200).json({
      success: true,
      data: buildSubscriptionStatus(user, sub),
    });
  } catch (err) {
    console.error('[subscription/status]', err);
    return res.status(500).json({ success: false, message: 'Kesalahan internal server' });
  }
}

export async function checkout(req, res) {
  try {
    const userId = String(req.user._id);
    const user = await User.where('_id', userId).first();
    const orderId = generateOrderId(userId);

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id: orderId,
        gross_amount: PREMIUM_PRICE,
      },
      customer_details: {
        first_name: user.name || 'Buyer',
        email: user.email,
      },
      item_details: [
        {
          id: 'premium_monthly',
          price: PREMIUM_PRICE,
          quantity: 1,
          name: 'RAC AI Premium Monthly (30 hari)',
        },
      ],
    });

    // Simpan pending — webhook yang finalisasi
    await Subscription.updateOrCreate(
      { userId },
      {
        userId,
        orderId,
        amount: PREMIUM_PRICE,
        paymentStatus: 'pending',
        paymentType: 'premium_monthly',
        startedAt: new Date(),
      },
    );

    return res.status(200).json({
      success: true,
      snapToken: transaction.token,
      orderId,
      amount: PREMIUM_PRICE,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });
  } catch (err) {
    console.error('[subscription/checkout]', err);
    return res.status(500).json({ success: false, message: 'Gagal membuat transaksi Midtrans' });
  }
}

export async function webhook(req, res) {
  try {
    const notification = await coreApi.transaction.notification(req.body);
    const {
      order_id: orderId,
      transaction_status: transactionStatus,
      fraud_status: fraudStatus,
      gross_amount: grossAmount,
    } = notification;

    const sub = await Subscription.where('orderId', orderId).first();
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Order tidak ditemukan' });
    }

    if (!isPaymentSuccess(transactionStatus, fraudStatus)) {
      await Subscription.where('_id', sub._id).update({
        paymentStatus: 'failed',
        midtransPayload: notification,
      });
      return res.status(200).json({ success: true, message: 'Payment not successful' });
    }

    const now = new Date();
    // SU-09: +30 hari dari tanggal pembayaran baru (bukan extend dari expiresAt lama)
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await Subscription.where('_id', sub._id).update({
      expiresAt,
      startedAt: now,
      paidAt: now,
      amount: Number(grossAmount) || sub.amount,
      paymentStatus: 'success',
      paymentType: 'premium_monthly',
      midtransPayload: notification,
    });

    return res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (err) {
    console.error('[subscription/webhook]', err);
    return res.status(500).json({ success: false, message: 'Webhook error' });
  }
}