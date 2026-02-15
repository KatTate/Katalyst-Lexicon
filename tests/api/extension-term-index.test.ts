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

describe('Term Index API (/api/terms/index)', () => {
  it('GET /api/terms/index - returns array of term index entries', async () => {
    const res = await request.get('/api/terms/index');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('synonyms');
    }
  });

  it('GET /api/terms/index - returns ETag header', async () => {
    const res = await request.get('/api/terms/index');
    expect(res.status).toBe(200);
    const etag = res.headers['etag'];
    expect(etag).toBeDefined();
    expect(typeof etag).toBe('string');
    expect(etag).toMatch(/^W\/"[a-f0-9]+"$/);
  });

  it('GET /api/terms/index - returns Cache-Control: no-cache', async () => {
    const res = await request.get('/api/terms/index');
    expect(res.status).toBe(200);
    expect(res.headers['cache-control']).toBe('no-cache');
  });

  it('GET /api/terms/index - returns 304 when If-None-Match matches ETag', async () => {
    const first = await request.get('/api/terms/index');
    expect(first.status).toBe(200);
    const etag = first.headers['etag'];
    expect(etag).toBeDefined();

    const second = await request
      .get('/api/terms/index')
      .set('If-None-Match', etag);
    expect(second.status).toBe(304);
  });

  it('GET /api/terms/index - returns 200 when If-None-Match does not match', async () => {
    const res = await request
      .get('/api/terms/index')
      .set('If-None-Match', 'W/"stale-etag-value"');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/terms/index - ETag is consistent across requests (no data change)', async () => {
    const first = await request.get('/api/terms/index');
    const second = await request.get('/api/terms/index');
    expect(first.headers['etag']).toBe(second.headers['etag']);
  });

  it('GET /api/terms/index - entries have correct shape (id, name, synonyms only)', async () => {
    const res = await request.get('/api/terms/index');
    expect(res.status).toBe(200);
    if (res.body.length > 0) {
      const entry = res.body[0];
      expect(Object.keys(entry)).toEqual(expect.arrayContaining(['id', 'name', 'synonyms']));
      expect(typeof entry.id).toBe('string');
      expect(typeof entry.name).toBe('string');
      expect(Array.isArray(entry.synonyms)).toBe(true);
      expect(entry).not.toHaveProperty('definition');
      expect(entry).not.toHaveProperty('status');
    }
  });

  it('GET /api/terms/index - returns consistent ordering across requests', async () => {
    const first = await request.get('/api/terms/index');
    const second = await request.get('/api/terms/index');
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    const firstNames = first.body.map((t: any) => t.name);
    const secondNames = second.body.map((t: any) => t.name);
    expect(firstNames).toEqual(secondNames);
  });

  it('GET /api/terms/index - has rate limit headers', async () => {
    const res = await request.get('/api/terms/index');
    expect(res.status).toBe(200);
    expect(res.headers['ratelimit-limit']).toBeDefined();
    expect(res.headers['ratelimit-remaining']).toBeDefined();
  });
});
