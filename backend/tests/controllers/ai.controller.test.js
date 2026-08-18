import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { mockReq, mockRes, getJson, getStatus } from '../helpers/mockReqRes.js';

const mockGetActiveCars = jest.fn();
const mockInvokeGroq = jest.fn();
const mockLogAiUsage = jest.fn();

jest.unstable_mockModule('../../src/ai/groq.service.js', () => ({
  invokeGroq: mockInvokeGroq,
}));

jest.unstable_mockModule('../../src/ai/catalog.helper.js', () => ({
  getActiveCars: mockGetActiveCars,
  formatCarLine: (c) => c.name,
  formatCarSummaryLine: (c) => c.name,
  parseJsonFromLlm: (s) => JSON.parse(s),
}));

jest.unstable_mockModule('../../src/ai/usageLog.service.js', () => ({
  logAiUsage: mockLogAiUsage,
}));

const { handleAIChat, handleAIRecommend, handleCreditSimulation } =
  await import('../../src/controllers/ai.controller.js');

const aiReq = {
  user: { _id: 'u1' },
  aiAccessType: 'free',
  remainingTokens: 4,
};

describe('ai controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handleAIChat 400 without message', async () => {
    const res = mockRes();
    await handleAIChat(mockReq({ user: aiReq.user, body: {} }), res);
    expect(getStatus(res)).toBe(400);
  });

  it('handleAIChat 200', async () => {
    mockGetActiveCars.mockResolvedValue([{ name: 'Avanza' }]);
    mockInvokeGroq.mockResolvedValue({ content: 'Jawaban AI' });
    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Halo' } }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data.reply).toBe('Jawaban AI');
  });

  it('handleAIRecommend 400 without budget', async () => {
    const res = mockRes();
    await handleAIRecommend(mockReq({ ...aiReq, body: {} }), res);
    expect(getStatus(res)).toBe(400);
  });

  it('handleAIRecommend 200', async () => {
    mockGetActiveCars.mockResolvedValue([{ _id: '1', name: 'Avanza' }]);
    mockInvokeGroq.mockResolvedValue({ content: '[{"carId":"1","matchScore":90}]' });
    const res = mockRes();
    await handleAIRecommend(mockReq({
      ...aiReq,
      body: { budgetMin: 100, budgetMax: 500 },
    }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('handleCreditSimulation 200', async () => {
    mockInvokeGroq.mockResolvedValue({ content: '{"financialHealthStatus":"Aman","insightText":"OK"}' });
    const res = mockRes();
    await handleCreditSimulation(mockReq({
      ...aiReq,
      body: { carPrice: 300000000, downPayment: 60000000, tenorMonths: 36 },
    }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data.calculation.monthlyInstallment).toBeGreaterThan(0);
  });

  it('handleCreditSimulation 400 invalid DP', async () => {
    const res = mockRes();
    await handleCreditSimulation(mockReq({
      ...aiReq,
      body: { carPrice: 100, downPayment: 100, tenorMonths: 12 },
    }), res);
    expect(getStatus(res)).toBe(400);
  });

  it('handleAIRecommend 404 empty catalog', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    const res = mockRes();
    await handleAIRecommend(mockReq({ ...aiReq, body: { budgetMin: 1, budgetMax: 2 } }), res);
    expect(getStatus(res)).toBe(404);
  });

  it('handleAIRecommend fallback when JSON invalid', async () => {
    mockGetActiveCars.mockResolvedValue([{ _id: '1', name: 'X' }]);
    mockInvokeGroq.mockResolvedValue({ content: 'bukan json' });
    jest.unstable_mockModule('../../src/ai/catalog.helper.js', () => ({
      getActiveCars: mockGetActiveCars,
      formatCarLine: (c) => c.name,
      formatCarSummaryLine: (c) => c.name,
      parseJsonFromLlm: () => { throw new Error('parse fail'); },
    }));
    const { handleAIRecommend: recommend } = await import('../../src/controllers/ai.controller.js');
    const res = mockRes();
    await recommend(mockReq({ ...aiReq, body: { budgetMin: 1, budgetMax: 2 } }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data.recommendations[0].rawInsight).toBeDefined();
  });

  it('handleAIChat 503 on rate limit', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    mockInvokeGroq.mockRejectedValue({ status: 429 });
    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'hi' } }), res);
    expect(getStatus(res)).toBe(503);
  });

  it('handleAIRecommend 503 on groq error', async () => {
    mockGetActiveCars.mockResolvedValue([{ _id: '1', name: 'X' }]);
    mockInvokeGroq.mockRejectedValue({ status: 404, code: 'model_not_found' });
    const res = mockRes();
    await handleAIRecommend(mockReq({ ...aiReq, body: { budgetMin: 1, budgetMax: 2 } }), res);
    expect(getStatus(res)).toBe(503);
  });

  it('handleCreditSimulation 503 on groq error', async () => {
    mockInvokeGroq.mockRejectedValue(new Error('ai down'));
    const res = mockRes();
    await handleCreditSimulation(mockReq({
      ...aiReq,
      body: { carPrice: 300000000, downPayment: 60000000, tenorMonths: 36 },
    }), res);
    expect(getStatus(res)).toBe(500);
  });
});