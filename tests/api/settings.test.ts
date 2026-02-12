import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, closeTestApp } from './setup';
import type supertest from 'supertest';

let request: supertest.Agent;

beforeAll(async () => {
  request = await createTestApp();
});

afterAll(async () => {
  await closeTestApp();
});

describe('Settings API', () => {
  const testKey = `qa_setting_${Date.now()}`;

  it('GET /api/settings - returns list of settings', async () => {
    const res = await request.get('/api/settings');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/settings - creates/upserts a setting', async () => {
    const res = await request.post('/api/settings').send({
      key: testKey,
      value: true,
    });
    expect(res.status).toBe(200);
    expect(res.body.key).toBe(testKey);
    expect(res.body.value).toBe(true);
  });

  it('POST /api/settings - upserts existing setting', async () => {
    const res = await request.post('/api/settings').send({
      key: testKey,
      value: false,
    });
    expect(res.status).toBe(200);
    expect(res.body.key).toBe(testKey);
    expect(res.body.value).toBe(false);
  });

  it('POST /api/settings/batch - saves multiple settings', async () => {
    const res = await request.post('/api/settings/batch').send({
      settings: [
        { key: `${testKey}_batch1`, value: true },
        { key: `${testKey}_batch2`, value: false },
      ],
    });
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});
