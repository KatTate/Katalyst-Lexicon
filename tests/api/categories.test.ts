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

describe('Categories API', () => {
  let createdCategoryId: string;

  it('GET /api/categories - returns list of categories', async () => {
    const res = await request.get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/categories - creates a new category', async () => {
    const newCategory = {
      name: `QA Category ${Date.now()}`,
      description: 'Test category for QA automation',
      color: 'bg-blue-500',
    };
    const res = await request.post('/api/categories').send(newCategory);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(newCategory.name);
    createdCategoryId = res.body.id;
  });

  it('POST /api/categories - returns 400 for invalid data', async () => {
    const res = await request.post('/api/categories').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/categories/:id - returns a specific category', async () => {
    const res = await request.get(`/api/categories/${createdCategoryId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdCategoryId);
  });

  it('GET /api/categories/:id - returns 404 for non-existent category', async () => {
    const res = await request.get('/api/categories/non-existent-id-xyz');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/categories/:id - updates a category', async () => {
    const res = await request.patch(`/api/categories/${createdCategoryId}`).send({
      description: 'Updated by QA automation',
    });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Updated by QA automation');
  });

  it('DELETE /api/categories/:id - deletes a category', async () => {
    const res = await request.delete(`/api/categories/${createdCategoryId}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/categories/:id - returns 404 for deleted category', async () => {
    const res = await request.delete(`/api/categories/${createdCategoryId}`);
    expect(res.status).toBe(404);
  });
});
