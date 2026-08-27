import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';
import { chainMock } from '../helpers/chainMock.js';
import { signToken } from '../../src/auth/jwt.js';

const mockUserWhere = jest.fn();

jest.unstable_mockModule('../../src/models/index.js', () => ({
  User: { where: mockUserWhere },
}));

const { requireAuth } = await import('../../src/auth/middleware.js');

describe('requireAuth', () => {
  beforeEach(() => jest.clearAllMocks());

  it('401 without bearer token', async () => {
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(getStatus(res)).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('401 when user not found', async () => {
    mockUserWhere.mockReturnValue(chainMock(null));
    const token = signToken({ _id: '507f1f77bcf86cd799439011' });
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(getStatus(res)).toBe(401);
  });

  it('sets req.user and calls next', async () => {
    const dbUser = { _id: '507f1f77bcf86cd799439011', email: 'a@b.com', passwordHash: 'x' };
    mockUserWhere.mockReturnValue(chainMock(dbUser));
    const token = signToken(dbUser);
    const req = mockReq({ headers: { authorization: `Bearer ${token}` } });
    const res = mockRes();
    const next = jest.fn();
    await requireAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.user.passwordHash).toBeUndefined();
  });
});