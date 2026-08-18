import { jest, describe, it, expect } from '@jest/globals';
import request from 'supertest';
import app from '../src/app.js';

describe('app routes', () => {
  it('GET /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('SUCCESS');
  });

  it('404 unknown route', async () => {
    const res = await request(app).get('/api/unknown-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('loads app with empty CORS_ORIGIN', async () => {
    const prev = process.env.CORS_ORIGIN;
    process.env.CORS_ORIGIN = '';
    jest.resetModules();
    const { default: freshApp } = await import('../src/app.js');
    const res = await request(freshApp).get('/health');
    expect(res.status).toBe(200);
    process.env.CORS_ORIGIN = prev;
  });
});