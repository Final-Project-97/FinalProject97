import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';
import { chainMock } from '../helpers/chainMock.js';

const mockUserWhere = jest.fn();
const mockSubWhere = jest.fn();
const mockSubUpdateOrCreate = jest.fn();
const mockSubUpdate = jest.fn();
const mockCreateTransaction = jest.fn();
const mockNotification = jest.fn();

jest.unstable_mockModule('../../src/models/index.js', () => ({
  User: { where: mockUserWhere },
  Subscription: {
    where: mockSubWhere,
    updateOrCreate: mockSubUpdateOrCreate,
  },
}));

jest.unstable_mockModule('../../src/subscription/midtrans.js', () => ({
  snap: { createTransaction: mockCreateTransaction },
  coreApi: { transaction: { notification: mockNotification } },
  PREMIUM_PRICE: 99000,
  generateOrderId: jest.fn(() => 'order-test-1'),
  isPaymentSuccess: jest.fn((status) => status === 'settlement'),
}));

const { getStatus: getSubStatus, checkout, webhook } = await import('../../src/subscription/controller.js');

describe('subscription controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getStatus', () => {
    it('200 returns subscription data', async () => {
      mockUserWhere.mockReturnValue(chainMock({ aiTokensRemaining: 5 }));
      mockSubWhere.mockReturnValue(chainMock(null));
      const req = mockReq({ user: { _id: 'u1' } });
      const res = mockRes();
      await getSubStatus(req, res);
      expect(getStatus(res)).toBe(200);
      expect(getJson(res).data.premiumActive).toBe(false);
    });

    it('getStatus 500', async () => {
      mockUserWhere.mockImplementation(() => { throw new Error('db'); });
      const res = mockRes();
      await getSubStatus(mockReq({ user: { _id: 'u1' } }), res);
      expect(getStatus(res)).toBe(500);
    });
  });

  describe('checkout', () => {
    it('200 returns snapToken', async () => {
      mockUserWhere.mockReturnValue(chainMock({ name: 'A', email: 'a@b.com' }));
      mockCreateTransaction.mockResolvedValue({ token: 'snap-tok' });
      mockSubUpdateOrCreate.mockResolvedValue(true);
      const req = mockReq({ user: { _id: 'u1' }, body: {} });
      const res = mockRes();
      await checkout(req, res);
      expect(getStatus(res)).toBe(200);
      expect(getJson(res).snapToken).toBe('snap-tok');
    });

    it('checkout 500', async () => {
      mockUserWhere.mockReturnValue(chainMock({ name: 'A', email: 'a@b.com' }));
      mockCreateTransaction.mockRejectedValue(new Error('snap fail'));
      const res = mockRes();
      await checkout(mockReq({ user: { _id: 'u1' }, body: {} }), res);
      expect(getStatus(res)).toBe(500);
    });
  });

  describe('webhook', () => {
    it('400 invalid payload', async () => {
      const res = mockRes();
      await webhook(mockReq({ body: {} }), res);
      expect(getStatus(res)).toBe(400);
    });

    it('200 payment not successful', async () => {
      const updateMock = jest.fn().mockResolvedValue(true);
      mockSubWhere
        .mockReturnValueOnce(chainMock({ _id: 's1' }))
        .mockReturnValueOnce({ update: updateMock });
      mockNotification.mockResolvedValue({
        order_id: 'order-x',
        transaction_status: 'deny',
        fraud_status: 'accept',
      });
      const res = mockRes();
      await webhook(mockReq({ body: { order_id: 'order-x', transaction_status: 'deny' } }), res);
      expect(getStatus(res)).toBe(200);
      expect(getJson(res).message).toBe('Payment not successful');
    });

    it('500 on notification error', async () => {
      mockNotification.mockRejectedValue(new Error('midtrans down'));
      const res = mockRes();
      await webhook(mockReq({ body: { order_id: 'x', transaction_status: 'settlement' } }), res);
      expect(getStatus(res)).toBe(500);
    });

    it('404 when order not found', async () => {
      mockSubWhere.mockReturnValue(chainMock(null));
      mockNotification.mockResolvedValue({
        order_id: 'missing',
        transaction_status: 'settlement',
        gross_amount: '99000',
      });
      const res = mockRes();
      await webhook(mockReq({
        body: { order_id: 'missing', transaction_status: 'settlement' },
      }), res);
      expect(getStatus(res)).toBe(404);
    });

    it('200 processes successful payment', async () => {
      const sub = { _id: 's1', userId: 'u1', amount: 99000 };
      mockSubWhere.mockReturnValue(chainMock(sub));
      mockSubUpdate.mockReturnValue(chainMock(true));
      Subscription_where_update();
      mockNotification.mockResolvedValue({
        order_id: 'order-test-1',
        transaction_status: 'settlement',
        fraud_status: 'accept',
        gross_amount: '99000',
      });
      const res = mockRes();
      await webhook(mockReq({
        body: { order_id: 'order-test-1', transaction_status: 'settlement' },
      }), res);
      expect(getStatus(res)).toBe(200);
    });
  });
});

function Subscription_where_update() {
  mockSubWhere.mockReturnValue({
    ...chainMock({ _id: 's1' }),
    update: jest.fn().mockResolvedValue(true),
  });
}