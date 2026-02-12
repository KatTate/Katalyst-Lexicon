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

describe('Users API', () => {
  let createdUserId: string;

  it('GET /api/users - returns list of users', async () => {
    const res = await request.get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/users - creates a new user', async () => {
    const newUser = {
      name: 'QA Test User',
      email: `qa-${Date.now()}@test.com`,
      role: 'Member' as const,
    };
    const res = await request.post('/api/users').send(newUser);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(newUser.name);
    createdUserId = res.body.id;
  });

  it('POST /api/users - returns 400 for invalid data', async () => {
    const res = await request.post('/api/users').send({});
    expect(res.status).toBe(400);
  });

  it('GET /api/users/:id - returns a specific user', async () => {
    const res = await request.get(`/api/users/${createdUserId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdUserId);
  });

  it('GET /api/users/:id - returns 404 for non-existent user', async () => {
    const res = await request.get('/api/users/non-existent-xyz');
    expect(res.status).toBe(404);
  });

  it('PATCH /api/users/:id - updates a user', async () => {
    const res = await request.patch(`/api/users/${createdUserId}`).send({
      name: 'QA Updated User',
    });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('QA Updated User');
  });

  it('DELETE /api/users/:id - deletes a user', async () => {
    const res = await request.delete(`/api/users/${createdUserId}`);
    expect(res.status).toBe(204);
  });

  it('DELETE /api/users/:id - returns 404 for deleted user', async () => {
    const res = await request.delete(`/api/users/${createdUserId}`);
    expect(res.status).toBe(404);
  });
});
