import midtransClient from 'midtrans-client';

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';

export const snap = new midtransClient.Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const coreApi = new midtransClient.CoreApi({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export const PREMIUM_PRICE = Number(process.env.PREMIUM_MONTHLY_PRICE || 99000);

export function generateOrderId(userId) {
  return `rac-premium-${userId}-${Date.now()}`;
}

export function isPaymentSuccess(transactionStatus, fraudStatus) {
  return (
    transactionStatus === 'capture' ||
    transactionStatus === 'settlement' ||
    (transactionStatus === 'pending' && fraudStatus === 'accept')
  );
}