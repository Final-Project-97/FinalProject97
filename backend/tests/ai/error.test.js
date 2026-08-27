import { describe, it, expect } from '@jest/globals';
import { mapGroqError } from '../../src/ai/errors.js';

describe('mapGroqError', () => {
  it('maps rate limit to 503', () => {
    const r = mapGroqError({ status: 429 });
    expect(r.httpStatus).toBe(503);
    expect(r.body.code).toBe('AI_RATE_LIMIT');
  });

  it('maps model not found', () => {
    const r = mapGroqError({ status: 404, code: 'model_not_found' });
    expect(r.httpStatus).toBe(503);
    expect(r.body.code).toBe('AI_MODEL_UNAVAILABLE');
  });

  it('default 500', () => {
    const r = mapGroqError(new Error('x'));
    expect(r.httpStatus).toBe(500);
    expect(r.body.code).toBe('AI_ERROR');
  });
});