import { jest, describe, it, expect } from '@jest/globals';

const mockInvoke = jest.fn();

jest.unstable_mockModule('../../src/ai/groq.config.js', () => ({
  createGroqChat: jest.fn(() => ({ invoke: mockInvoke })),
}));

const { invokeGroq } = await import('../../src/ai/groq.service.js');

describe('invokeGroq', () => {
  it('returns model response', async () => {
    mockInvoke.mockResolvedValue({ content: 'ok' });
    const r = await invokeGroq('sys', 'usr');
    expect(r.content).toBe('ok');
  });
});