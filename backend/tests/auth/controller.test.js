import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';
import { chainMock } from '../helpers/chainMock.js';

const mockHash = jest.fn();
const mockCompare = jest.fn();
const mockVerifyIdToken = jest.fn();
const mockUserWhere = jest.fn();
const mockUserCreate = jest.fn();
const mockSubWhere = jest.fn();

jest.unstable_mockModule('bcrypt', () => ({
  default: { hash: mockHash, compare: mockCompare },
}));

jest.unstable_mockModule('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({
    verifyIdToken: mockVerifyIdToken,
  })),
}));

jest.unstable_mockModule('../../src/models/index.js', () => ({
  User: { where: mockUserWhere, create: mockUserCreate },
  Subscription: { where: mockSubWhere },
}));

const { register, login, google, logout, me } = await import('../../src/auth/controller.js');

describe('auth controller', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('201 on success', async () => {
      mockUserWhere.mockReturnValue(chainMock(null));
      mockHash.mockResolvedValue('hashed');
      mockUserCreate.mockResolvedValue({
        _id: '1', name: 'A', email: 'a@b.com', role: 'buyer', aiTokensRemaining: 5,
      });
      const req = mockReq({ body: { name: 'A', email: 'A@B.COM', password: 'password123' } });
      const res = mockRes();
      await register(req, res);
      expect(getStatus(res)).toBe(201);
      expect(getJson(res).token).toBeDefined();
    });

    it('400 on invalid body', async () => {
      const res = mockRes();
      await register(mockReq({ body: {} }), res);
      expect(getStatus(res)).toBe(400);
    });

    it('409 when email taken', async () => {
      mockUserWhere.mockReturnValue(chainMock({ _id: 'x' }));
      const res = mockRes();
      await register(mockReq({ body: { name: 'A', email: 'a@b.com', password: 'password123' } }), res);
      expect(getStatus(res)).toBe(409);
      expect(getJson(res).code).toBe('EMAIL_TAKEN');
    });

    it('409 on duplicate key error', async () => {
      mockUserWhere.mockReturnValue(chainMock(null));
      mockHash.mockResolvedValue('hash');
      mockUserCreate.mockRejectedValue({ code: 11000 });
      const res = mockRes();
      await register(mockReq({ body: { name: 'A', email: 'a@b.com', password: 'password123' } }), res);
      expect(getStatus(res)).toBe(409);
    });

    it('register 500 generic error', async () => {
      mockUserWhere.mockReturnValue(chainMock(null));
      mockHash.mockRejectedValue(new Error('hash fail'));
      const res = mockRes();
      await register(mockReq({ body: { name: 'A', email: 'a@b.com', password: 'password123' } }), res);
      expect(getStatus(res)).toBe(500);
    });
  });

  describe('login', () => {
    it('200 on valid credentials', async () => {
      mockUserWhere.mockReturnValue(chainMock({
        _id: '1', email: 'a@b.com', passwordHash: 'hash', role: 'buyer',
      }));
      mockCompare.mockResolvedValue(true);
      const res = mockRes();
      await login(mockReq({ body: { email: 'a@b.com', password: 'password123' } }), res);
      expect(getStatus(res)).toBe(200);
    });

    it('400 for google-only account', async () => {
      mockUserWhere.mockReturnValue(chainMock({ googleId: 'g1', email: 'a@b.com' }));
      const res = mockRes();
      await login(mockReq({ body: { email: 'a@b.com', password: 'x' } }), res);
      expect(getStatus(res)).toBe(400);
    });

    it('401 on wrong password', async () => {
      mockUserWhere.mockReturnValue(chainMock({ passwordHash: 'hash' }));
      mockCompare.mockResolvedValue(false);
      const res = mockRes();
      await login(mockReq({ body: { email: 'a@b.com', password: 'wrong' } }), res);
      expect(getStatus(res)).toBe(401);
    });

    it('login 400 invalid body', async () => {
      const res = mockRes();
      await login(mockReq({ body: {} }), res);
      expect(getStatus(res)).toBe(400);
    });
    it('login 401 user not found', async () => {
      mockUserWhere.mockReturnValue(chainMock(null));
      const res = mockRes();
      await login(mockReq({ body: { email: 'x@y.com', password: 'password123' } }), res);
      expect(getStatus(res)).toBe(401);
    });
    it('login 500 on db error', async () => {
      mockUserWhere.mockImplementation(() => { throw new Error('db'); });
      const res = mockRes();
      await login(mockReq({ body: { email: 'a@b.com', password: 'password123' } }), res);
      expect(getStatus(res)).toBe(500);
    });
  });

  describe('google', () => {
    it('200 creates new user', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({
          email: 'g@gmail.com', sub: 'google-sub', name: 'G', picture: 'http://pic',
        }),
      });
      mockUserWhere
        .mockReturnValueOnce(chainMock(null))
        .mockReturnValueOnce(chainMock(null));
      mockUserCreate.mockResolvedValue({
        _id: '2', email: 'g@gmail.com', googleId: 'google-sub', role: 'buyer', aiTokensRemaining: 5,
      });
      const res = mockRes();
      await google(mockReq({ body: { idToken: 'valid-token' } }), res);
      expect(getStatus(res)).toBe(200);
    });

    it('200 links googleId to existing email user', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ email: 'exist@gmail.com', sub: 'gid-new' }),
      });
      const existing = { _id: '99', email: 'exist@gmail.com' };
      mockUserWhere
        .mockReturnValueOnce(chainMock(null))
        .mockReturnValueOnce(chainMock(existing))
        .mockReturnValueOnce({ update: jest.fn().mockResolvedValue(true) })
        .mockReturnValueOnce(chainMock({ ...existing, googleId: 'gid-new', role: 'buyer' }));
      const res = mockRes();
      await google(mockReq({ body: { idToken: 'tok' } }), res);
      expect(getStatus(res)).toBe(200);
    });

    it('401 when payload missing email', async () => {
      mockVerifyIdToken.mockResolvedValue({
        getPayload: () => ({ sub: 'only-sub' }),
      });
      const res = mockRes();
      await google(mockReq({ body: { idToken: 'tok' } }), res);
      expect(getStatus(res)).toBe(401);
    });

    it('400 on empty body', async () => {
      const res = mockRes();
      await google(mockReq({ body: {} }), res);
      expect(getStatus(res)).toBe(400);
    });

    it('401 on invalid token', async () => {
      mockVerifyIdToken.mockRejectedValue(new Error('bad'));
      const res = mockRes();
      await google(mockReq({ body: { idToken: 'bad' } }), res);
      expect(getStatus(res)).toBe(401);
    });
  });

  describe('logout', () => {
    it('200', async () => {
      const res = mockRes();
      await logout(mockReq(), res);
      expect(getStatus(res)).toBe(200);
    });
  });

  describe('me', () => {
    it('200 with subscription info', async () => {
      const future = new Date(Date.now() + 86400000 * 10);
      mockSubWhere.mockReturnValue(chainMock({
        expiresAt: future, paymentStatus: 'success',
      }));
      const req = mockReq({
        user: { _id: '1', email: 'a@b.com', aiTokensRemaining: 3 },
      });
      const res = mockRes();
      await me(req, res);
      expect(getStatus(res)).toBe(200);
      expect(getJson(res).aiTokensRemaining).toBe(3);
    });

    it('500 on db error', async () => {
      mockSubWhere.mockImplementation(() => { throw new Error('db'); });
      const res = mockRes();
      await me(mockReq({ user: { _id: '1', aiTokensRemaining: 1 } }), res);
      expect(getStatus(res)).toBe(500);
    });
  });
});