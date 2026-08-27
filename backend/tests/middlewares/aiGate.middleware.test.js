import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';
import { chainMock } from '../helpers/chainMock.js';

const mockUserFind = jest.fn();
const mockUserWhere = jest.fn();
const mockSubWhere = jest.fn();

jest.unstable_mockModule('../../src/models/index.js', () => ({
  User: {
    find: mockUserFind,
    where: mockUserWhere,
  },
  Subscription: { where: mockSubWhere },
}));

const { aiGateMiddleware } = await import('../../src/middlewares/aiGate.middleware.js');

describe('aiGateMiddleware', () => {
  beforeEach(() => jest.clearAllMocks());

  it('401 without user', async () => {
    const res = mockRes();
    await aiGateMiddleware(mockReq(), res, jest.fn());
    expect(getStatus(res)).toBe(401);
  });

  it('premium user passes without deducting tokens', async () => {
    mockUserFind.mockResolvedValue({ _id: 'u1', aiTokensRemaining: 0 });
    mockSubWhere.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue({
        paymentStatus: 'success',
        expiresAt: new Date(Date.now() + 86400000),
      }),
    });
    const next = jest.fn();
    await aiGateMiddleware(mockReq({ user: { _id: 'u1' } }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('free user deducts token via User.find success path', async () => {
    mockUserFind.mockResolvedValue({ _id: 'u1', aiTokensRemaining: 3 });
    mockUserWhere.mockReturnValue({ update: jest.fn().mockResolvedValue(true) });
    mockSubWhere.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    });

    const req = mockReq({ user: { _id: 'u1' } });
    const next = jest.fn();
    await aiGateMiddleware(req, mockRes(), next);

    expect(next).toHaveBeenCalled();
    expect(req.aiAccessType).toBe('free');
    expect(req.remainingTokens).toBe(2);
  });

  it('free user deducts token via User.where fallback', async () => {
    mockUserFind.mockRejectedValue(new Error('no find'));
    mockUserWhere
      .mockReturnValueOnce(chainMock({ _id: 'u1', aiTokensRemaining: 3 }))
      .mockReturnValueOnce({ update: jest.fn().mockResolvedValue(true) });
    mockSubWhere.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    });

    const next = jest.fn();
    await aiGateMiddleware(mockReq({ user: { _id: 'u1' } }), mockRes(), next);
    expect(next).toHaveBeenCalled();
  });

  it('403 when tokens exhausted', async () => {
    mockUserFind.mockResolvedValue({ _id: 'u1', aiTokensRemaining: 0 });
    mockSubWhere.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      first: jest.fn().mockResolvedValue(null),
    });
    const res = mockRes();
    await aiGateMiddleware(mockReq({ user: { _id: 'u1' } }), res, jest.fn());
    expect(getStatus(res)).toBe(403);
    expect(getJson(res).code).toBe('TOKEN_EXHAUSTED');
  });

  it('404 when user profile missing', async () => {
    mockUserFind.mockResolvedValue(null);
    mockUserWhere.mockReturnValue(chainMock(null));
    const res = mockRes();
    await aiGateMiddleware(mockReq({ user: { _id: 'u1' } }), res, jest.fn());
    expect(getStatus(res)).toBe(404);
  });

  it('500 on unexpected error', async () => {
    mockUserFind.mockImplementation(() => { throw new Error('boom'); });
    mockUserWhere.mockImplementation(() => { throw new Error('boom'); });
    const res = mockRes();
    await aiGateMiddleware(mockReq({ user: { _id: 'u1' } }), res, jest.fn());
    expect(getStatus(res)).toBe(500);
  });

  it('continues when subscription check throws', async () => {
    mockUserFind.mockResolvedValue({ _id: 'u1', aiTokensRemaining: 2 });
    mockSubWhere.mockImplementation(() => { throw new Error('sub db'); });
    mockUserWhere.mockReturnValue({ update: jest.fn().mockResolvedValue(true) });

    const req = mockReq({ user: { id: 'u1' } });
    const next = jest.fn();
    await aiGateMiddleware(req, mockRes(), next);
    expect(next).toHaveBeenCalled();
  });
});