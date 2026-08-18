import { jest, describe, it, expect, beforeEach } from '@jest/globals';

const mockCreate = jest.fn();

jest.unstable_mockModule('../../src/models/index.js', () => ({
  AiUsageLog: { create: mockCreate },
}));

const { logAiUsage } = await import('../../src/ai/usageLog.service.js');

describe('logAiUsage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates log', async () => {
    mockCreate.mockResolvedValue(true);
    await logAiUsage({ userId: 'u1', feature: 'chat', metadata: { n: 1 } });
    expect(mockCreate).toHaveBeenCalled();
  });

  it('ignores db error', async () => {
    mockCreate.mockRejectedValue(new Error('fail'));
    await expect(logAiUsage({ userId: 'u1', feature: 'chat' })).resolves.toBeUndefined();
  });
});