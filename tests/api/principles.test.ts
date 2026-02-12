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

describe('Principles API', () => {
  let principleId: string;
  let termIdForLinking: string;

  it('GET /api/principles - returns list of principles', async () => {
    const res = await request.get('/api/principles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/principles - creates a new principle', async () => {
    const slug = `qa-principle-${Date.now()}`;
    const res = await request.post('/api/principles').send({
      title: 'QA Test Principle',
      slug,
      summary: 'A principle created by QA automation',
      body: '# QA Principle\n\nThis is a test principle.',
      status: 'Draft' as const,
      visibility: 'Internal' as const,
      owner: 'QA Bot',
      tags: ['testing', 'qa'],
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toBe('QA Test Principle');
    expect(res.body.slug).toBe(slug);
    principleId = res.body.id;
  });

  it('GET /api/principles/:id - returns a principle by id', async () => {
    const res = await request.get(`/api/principles/${principleId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(principleId);
  });

  it('GET /api/principles/:id - returns 404 for non-existent', async () => {
    const res = await request.get('/api/principles/non-existent-xyz');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/principles/:id - updates a principle', async () => {
    const res = await request.patch(`/api/principles/${principleId}`).send({
      summary: 'Updated by QA automation',
    });
    expect(res.status).toBe(200);
    expect(res.body.summary).toBe('Updated by QA automation');
  });

  it('POST /api/principles/:id/terms - links a term to a principle', async () => {
    const termRes = await request.post('/api/terms').send({
      name: `QA Link Term ${Date.now()}`,
      category: 'Strategy',
      definition: 'Term for principle linking test',
      whyExists: 'Testing',
      owner: 'QA Bot',
      status: 'Draft' as const,
      visibility: 'Internal' as const,
      version: 1,
    });
    termIdForLinking = termRes.body.id;

    const res = await request.post(`/api/principles/${principleId}/terms`).send({
      termId: termIdForLinking,
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/principles/:id/terms - returns linked terms', async () => {
    const res = await request.get(`/api/principles/${principleId}/terms`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /api/principles/:principleId/terms/:termId - unlinks a term', async () => {
    const res = await request.delete(`/api/principles/${principleId}/terms/${termIdForLinking}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/principles/:id - deletes a principle', async () => {
    const res = await request.delete(`/api/principles/${principleId}`);
    expect(res.status).toBe(204);
  });

  it('cleanup - delete test term', async () => {
    const res = await request.delete(`/api/terms/${termIdForLinking}`);
    expect(res.status).toBe(204);
  });
});
