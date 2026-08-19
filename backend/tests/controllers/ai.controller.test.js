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
  formatCarChatCatalogLine: (c) => c.name,
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

const sampleCar = {
  _id: '1',
  slug: 'avanza',
  name: 'Avanza',
  brand: 'Toyota',
  type: 'MPV',
  basePrice: 250000000,
  thumbnailUrl: 'https://img.test/a.png',
};

describe('ai controller', () => {
  beforeEach(() => jest.clearAllMocks());

  it('handleAIChat 400 without message', async () => {
    const res = mockRes();
    await handleAIChat(mockReq({ user: aiReq.user, body: {} }), res);
    expect(getStatus(res)).toBe(400);
  });

  it('handleAIChat 400 non-string message', async () => {
    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 123 } }), res);
    expect(getStatus(res)).toBe(400);
  });

  it('handleAIChat 200 plain text', async () => {
    mockGetActiveCars.mockResolvedValue([{ name: 'Avanza' }]);
    mockInvokeGroq.mockResolvedValue({ content: 'Jawaban AI' });
    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Halo' } }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data.reply).toBe('Jawaban AI');
    expect(getJson(res).data.replyType).toBe('text');
  });

  it('handleAIChat 200 recommendations JSON', async () => {
    mockGetActiveCars.mockResolvedValue([sampleCar]);
    mockInvokeGroq.mockResolvedValue({
      content: JSON.stringify({
        replyType: 'recommendations',
        reply: 'Here are some options:',
        items: [{
          carId: '1',
          slug: 'avanza',
          aiReason: 'Good family car',
        }],
      }),
    });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Recommend family cars' } }), res);

    const data = getJson(res).data;
    expect(getStatus(res)).toBe(200);
    expect(data.replyType).toBe('recommendations');
    expect(data.items).toHaveLength(1);
    expect(data.items[0].slug).toBe('avanza');
    expect(data.recommendations).toHaveLength(1);
  });

  it('handleAIChat strips FORMAT C wrapper', async () => {
    mockGetActiveCars.mockResolvedValue([sampleCar]);
    mockInvokeGroq.mockResolvedValue({
      content:
        '-- FORMAT C (RECOMMENDATION) --\n' +
        JSON.stringify({
          replyType: 'recommendations',
          reply: 'Here are some 7-seat options:',
          items: [{ carId: '1', slug: 'avanza', aiReason: 'Family MPV' }],
        }),
    });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'rekomendasi mobil 7 seater' } }), res);

    const data = getJson(res).data;
    expect(data.replyType).toBe('recommendations');
    expect(data.items).toHaveLength(1);
    expect(data.reply).not.toMatch(/FORMAT C/);
  });

  it('handleAIChat does not leak raw JSON when parse fails', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    mockInvokeGroq.mockResolvedValue({ content: '-- FORMAT C --\n{ broken json' });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'recommend cars' } }), res);

    const data = getJson(res).data;
    expect(data.replyType).toBe('text');
    expect(data.items).toBeNull();
    expect(data.reply).not.toMatch(/FORMAT C/);
    expect(data.reply).not.toMatch(/"replyType"/);
  });

  it('handleAIChat recommendations with non-array items', async () => {
    mockGetActiveCars.mockResolvedValue([sampleCar]);
    mockInvokeGroq.mockResolvedValue({
      content: JSON.stringify({
        replyType: 'recommendations',
        reply: 'Try these:',
        items: 'not-an-array',
      }),
    });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Recommend cars' } }), res);

    const data = getJson(res).data;
    expect(data.replyType).toBe('text');
    expect(data.items).toBeNull();
  });

  it('handleAIChat recommendations with empty reply uses default intro', async () => {
    mockGetActiveCars.mockResolvedValue([sampleCar]);
    mockInvokeGroq.mockResolvedValue({
      content: JSON.stringify({
        replyType: 'recommendations',
        items: [{ carId: '1', slug: 'avanza', aiReason: 'ok' }],
      }),
    });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Recommend cars' } }), res);

    const data = getJson(res).data;
    expect(data.replyType).toBe('recommendations');
    expect(data.reply).toContain('RAC AI catalog');
  });

  it('handleAIChat filters invalid recommendation items', async () => {
    mockGetActiveCars.mockResolvedValue([sampleCar]);
    mockInvokeGroq.mockResolvedValue({
      content: JSON.stringify({
        replyType: 'recommendations',
        reply: 'Try these:',
        items: [
          { carId: '999', slug: 'fake', aiReason: 'x' },
          { carId: '1', slug: 'wrong-slug', aiReason: 'x' },
        ],
      }),
    });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Recommend cars' } }), res);

    const data = getJson(res).data;
    expect(getStatus(res)).toBe(200);
    expect(data.replyType).toBe('text');
    expect(data.items).toBeNull();
  });

  it('handleAIChat recommendations with empty reply after invalid items', async () => {
    mockGetActiveCars.mockResolvedValue([sampleCar]);
    mockInvokeGroq.mockResolvedValue({
      content: JSON.stringify({
        replyType: 'recommendations',
        reply: '',
        items: [{ carId: '999', slug: 'fake', aiReason: 'x' }],
      }),
    });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Recommend cars' } }), res);

    const data = getJson(res).data;
    expect(data.replyType).toBe('text');
    expect(data.reply).toMatch(/No vehicles in the RAC AI catalog/i);
  });

  it('handleAIChat 200 parsed text JSON', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    mockInvokeGroq.mockResolvedValue({
      content: JSON.stringify({ reply: 'Plain answer from JSON' }),
    });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Hello' } }), res);

    expect(getJson(res).data.replyType).toBe('text');
    expect(getJson(res).data.reply).toBe('Plain answer from JSON');
  });

  it('handleAIChat free user returns remaining tokens from req', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    mockInvokeGroq.mockResolvedValue({ content: 'Hi' });

    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'Hi' } }), res);

    expect(getJson(res).data.remainingTokens).toBe(4);
  });

  it('handleAIChat premium returns unlimited tokens', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    mockInvokeGroq.mockResolvedValue({ content: 'Hi' });

    const res = mockRes();
    await handleAIChat(mockReq({
      user: { _id: 'u1' },
      aiAccessType: 'premium',
      body: { message: 'Hi' },
    }), res);

    expect(getJson(res).data.remainingTokens).toBe('unlimited');
  });

  it('handleAIChat redirects follow-up recommendation requests', async () => {
    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'rekomendasi lain' } }), res);

    const data = getJson(res).data;
    expect(getStatus(res)).toBe(200);
    expect(data.replyType).toBe('text');
    expect(data.items).toBeNull();
    expect(data.reply).toMatch(/AI Recommendation feature/i);
    expect(mockInvokeGroq).not.toHaveBeenCalled();
  });

  it('handleAIChat uses catalog formatter fallback when helper missing', async () => {
    jest.resetModules();
    jest.unstable_mockModule('../../src/ai/groq.service.js', () => ({
      invokeGroq: mockInvokeGroq,
    }));
    jest.unstable_mockModule('../../src/ai/catalog.helper.js', () => ({
      getActiveCars: mockGetActiveCars,
      formatCarLine: (c) => c.name,
      formatCarSummaryLine: (c) => c.name,
      formatCarChatCatalogLine: undefined,
      parseJsonFromLlm: (s) => JSON.parse(s),
    }));
    jest.unstable_mockModule('../../src/ai/usageLog.service.js', () => ({
      logAiUsage: mockLogAiUsage,
    }));

    const { handleAIChat: chatWithFallback } =
      await import('../../src/controllers/ai.controller.js');

    mockGetActiveCars.mockResolvedValue([{
      _id: '1',
      slug: 'avanza',
      name: 'Avanza',
      brand: 'Toyota',
      type: 'MPV',
      basePrice: 250000000,
      specs: { seats: 7, transmission: 'CVT' },
    }]);
    mockInvokeGroq.mockResolvedValue({ content: 'plain answer' });

    const res = mockRes();
    await chatWithFallback(mockReq({ ...aiReq, body: { message: 'hello' } }), res);

    expect(getStatus(res)).toBe(200);
    expect(mockInvokeGroq).toHaveBeenCalled();
    const systemPrompt = mockInvokeGroq.mock.calls[0][0];
    expect(systemPrompt).toContain('Avanza');
    expect(systemPrompt).toContain('Seats: 7');
  });

  it('handleAIChat 503 on rate limit', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    mockInvokeGroq.mockRejectedValue({ status: 429 });
    const res = mockRes();
    await handleAIChat(mockReq({ ...aiReq, body: { message: 'hi' } }), res);
    expect(getStatus(res)).toBe(503);
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
      body: {
        budgetMin: 100,
        budgetMax: 500,
        needType: 'family',
        passengers: 5,
        priority: 'comfort',
        selectedColor: 'white',
      },
    }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('handleAIRecommend 404 empty catalog', async () => {
    mockGetActiveCars.mockResolvedValue([]);
    const res = mockRes();
    await handleAIRecommend(mockReq({ ...aiReq, body: { budgetMin: 1, budgetMax: 2 } }), res);
    expect(getStatus(res)).toBe(404);
  });

  it('handleAIRecommend fallback when JSON invalid', async () => {
    jest.resetModules();
    jest.unstable_mockModule('../../src/ai/groq.service.js', () => ({
      invokeGroq: mockInvokeGroq,
    }));
    jest.unstable_mockModule('../../src/ai/catalog.helper.js', () => ({
      getActiveCars: mockGetActiveCars,
      formatCarLine: (c) => c.name,
      formatCarSummaryLine: (c) => c.name,
      formatCarChatCatalogLine: (c) => c.name,
      parseJsonFromLlm: () => { throw new Error('parse fail'); },
    }));
    jest.unstable_mockModule('../../src/ai/usageLog.service.js', () => ({
      logAiUsage: mockLogAiUsage,
    }));

    const { handleAIRecommend: recommend } =
      await import('../../src/controllers/ai.controller.js');

    mockGetActiveCars.mockResolvedValue([{ _id: '1', name: 'X' }]);
    mockInvokeGroq.mockResolvedValue({ content: 'bukan json' });

    const res = mockRes();
    await recommend(mockReq({ ...aiReq, body: { budgetMin: 1, budgetMax: 2 } }), res);

    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data.recommendations[0].rawInsight).toBeDefined();
  });

  it('handleAIRecommend 503 on groq error', async () => {
    mockGetActiveCars.mockResolvedValue([{ _id: '1', name: 'X' }]);
    mockInvokeGroq.mockRejectedValue({ status: 404, code: 'model_not_found' });
    const res = mockRes();
    await handleAIRecommend(mockReq({ ...aiReq, body: { budgetMin: 1, budgetMax: 2 } }), res);
    expect(getStatus(res)).toBe(503);
  });

  it('handleCreditSimulation 200', async () => {
    mockInvokeGroq.mockResolvedValue({
      content: '{"financialHealthStatus":"Safe","insightText":"OK"}',
    });
    const res = mockRes();
    await handleCreditSimulation(mockReq({
      ...aiReq,
      body: { carPrice: 300000000, downPayment: 60000000, tenorMonths: 36 },
    }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data.calculation.monthlyInstallment).toBeGreaterThan(0);
  });

  it('handleCreditSimulation 200 with custom interest rate', async () => {
    mockInvokeGroq.mockResolvedValue({
      content: '{"financialHealthStatus":"Moderate","insightText":"OK"}',
    });
    const res = mockRes();
    await handleCreditSimulation(mockReq({
      ...aiReq,
      body: {
        carPrice: 300000000,
        downPayment: 60000000,
        tenorMonths: 36,
        interestRatePerYear: 12,
      },
    }), res);
    expect(getStatus(res)).toBe(200);
  });

  it('handleCreditSimulation fallback when AI JSON invalid', async () => {
    mockInvokeGroq.mockResolvedValue({ content: 'Plain insight text' });
    const res = mockRes();
    await handleCreditSimulation(mockReq({
      ...aiReq,
      body: { carPrice: 300000000, downPayment: 60000000, tenorMonths: 36 },
    }), res);
    expect(getStatus(res)).toBe(200);
    expect(getJson(res).data.aiFinancialInsight.insightText).toBe('Plain insight text');
  });

  it('handleCreditSimulation 400 invalid DP', async () => {
    const res = mockRes();
    await handleCreditSimulation(mockReq({
      ...aiReq,
      body: { carPrice: 100, downPayment: 100, tenorMonths: 12 },
    }), res);
    expect(getStatus(res)).toBe(400);
  });

  it('handleCreditSimulation 400 missing required fields', async () => {
    const res = mockRes();
    await handleCreditSimulation(mockReq({ ...aiReq, body: { carPrice: 100 } }), res);
    expect(getStatus(res)).toBe(400);
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