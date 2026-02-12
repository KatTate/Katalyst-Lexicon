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

describe('Terms API', () => {
  let createdTermId: string;

  it('GET /api/terms - returns list of terms', async () => {
    const res = await request.get('/api/terms');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/terms - creates a new term', async () => {
    const newTerm = {
      name: `QA Test Term ${Date.now()}`,
      category: 'Strategy',
      definition: 'A test term created by automated QA',
      whyExists: 'For testing purposes',
      usedWhen: 'During QA testing',
      notUsedWhen: 'In production scenarios',
      status: 'Draft' as const,
      visibility: 'Internal' as const,
      owner: 'QA Bot',
      version: 1,
      examplesGood: ['Good example 1'],
      examplesBad: ['Bad example 1'],
      synonyms: ['test-syn'],
    };
    const res = await request.post('/api/terms').send(newTerm);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(newTerm.name);
    expect(res.body.definition).toBe(newTerm.definition);
    createdTermId = res.body.id;
  });

  it('GET /api/terms/:id - returns a specific term', async () => {
    const res = await request.get(`/api/terms/${createdTermId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdTermId);
  });

  it('GET /api/terms/:id - returns 404 for non-existent term', async () => {
    const res = await request.get('/api/terms/non-existent-id-xyz');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('PATCH /api/terms/:id - updates a term', async () => {
    const res = await request.patch(`/api/terms/${createdTermId}`).send({
      definition: 'Updated definition by QA',
      changeNote: 'QA update test',
      changedBy: 'QA Bot',
    });
    expect(res.status).toBe(200);
    expect(res.body.definition).toBe('Updated definition by QA');
    expect(res.body.version).toBe(2);
  });

  it('PATCH /api/terms/:id - returns 404 for non-existent term', async () => {
    const res = await request.patch('/api/terms/non-existent-id-xyz').send({
      definition: 'Will not work',
    });
    expect(res.status).toBe(404);
  });

  it('GET /api/terms/:id/versions - returns version history', async () => {
    const res = await request.get(`/api/terms/${createdTermId}/versions`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body[0].versionNumber).toBeGreaterThan(res.body[1].versionNumber);
  });

  it('GET /api/terms/search?q=... - searches terms', async () => {
    const res = await request.get('/api/terms/search?q=QA Test');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/terms/search - returns empty for short query', async () => {
    const res = await request.get('/api/terms/search?q=a');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('GET /api/terms/category/:category - filters by category', async () => {
    const res = await request.get('/api/terms/category/Strategy');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('DELETE /api/terms/:id - deletes a term', async () => {
    const res = await request.delete(`/api/terms/${createdTermId}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/terms/:id - returns 404 for already deleted term', async () => {
    const res = await request.delete(`/api/terms/${createdTermId}`);
    expect(res.status).toBe(404);
  });
});
