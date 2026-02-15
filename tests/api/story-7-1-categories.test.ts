import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'http';
import { registerRoutes } from '../../server/routes';
import supertest from 'supertest';
import { db } from '../../server/db';
import { users } from '../../shared/models/auth';
import { eq } from 'drizzle-orm';

const TEST_ADMIN_ID = `test-cat-admin-${Date.now()}`;
let adminRequest: supertest.Agent;
let unauthRequest: supertest.Agent;
const servers: Server[] = [];

function createMockAuthMiddleware(userId: string | null) {
  return (req: any, _res: any, next: any) => {
    if (userId) {
      req.isAuthenticated = () => true;
      req.user = {
        claims: { sub: userId },
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };
    } else {
      req.isAuthenticated = () => false;
      req.user = null;
    }
    next();
  };
}

async function createTestAppWithAuth(userId: string | null) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(createMockAuthMiddleware(userId));
  const server = createServer(app);
  servers.push(server);
  await registerRoutes(server, app);
  return supertest(app);
}

beforeAll(async () => {
  await db.insert(users).values({
    id: TEST_ADMIN_ID,
    email: `cat-admin-${Date.now()}@katgroupinc.com`,
    firstName: 'Cat',
    lastName: 'Admin',
    role: 'Admin',
  }).onConflictDoNothing();

  adminRequest = await createTestAppWithAuth(TEST_ADMIN_ID);
  unauthRequest = await createTestAppWithAuth(null);
});

afterAll(async () => {
  servers.forEach(s => s.close());
  await db.delete(users).where(eq(users.id, TEST_ADMIN_ID));
});

describe('Story 7.1: Category Management', () => {
  const createdCategoryIds: string[] = [];

  afterAll(async () => {
    for (const id of createdCategoryIds) {
      try {
        await adminRequest.delete(`/api/categories/${id}`);
      } catch {}
    }
  });

  describe('AC: Admin sees list of all categories', () => {
    it('GET /api/categories returns 200 with array', async () => {
      const res = await unauthRequest.get('/api/categories');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('AC: Admin can create a category with name, color, and sort position', () => {
    it('POST /api/categories creates category with all fields', async () => {
      const newCat = {
        name: `QA Story 7.1 Cat ${Date.now()}`,
        description: 'Test category for Story 7.1',
        color: '#3B82F6',
        sortOrder: 100,
      };
      const res = await adminRequest.post('/api/categories').send(newCat);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe(newCat.name);
      expect(res.body.color).toBe(newCat.color);
      createdCategoryIds.push(res.body.id);
    });

    it('POST /api/categories returns 400 for missing required fields', async () => {
      const res = await adminRequest.post('/api/categories').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('AC: Admin can edit a category (name, color, sort position)', () => {
    let editCategoryId: string;

    beforeAll(async () => {
      const res = await adminRequest.post('/api/categories').send({
        name: `QA Edit Cat ${Date.now()}`,
        description: 'Category to be edited',
        color: '#EF4444',
      });
      editCategoryId = res.body.id;
      createdCategoryIds.push(editCategoryId);
    });

    it('PATCH /api/categories/:id updates name', async () => {
      const res = await adminRequest.patch(`/api/categories/${editCategoryId}`).send({
        name: `Updated Cat Name ${Date.now()}`,
      });
      expect(res.status).toBe(200);
      expect(res.body.name).toContain('Updated Cat Name');
    });

    it('PATCH /api/categories/:id updates color', async () => {
      const res = await adminRequest.patch(`/api/categories/${editCategoryId}`).send({
        color: '#10B981',
      });
      expect(res.status).toBe(200);
      expect(res.body.color).toBe('#10B981');
    });

    it('PATCH /api/categories/:id updates description', async () => {
      const res = await adminRequest.patch(`/api/categories/${editCategoryId}`).send({
        description: 'Updated description by QA',
      });
      expect(res.status).toBe(200);
      expect(res.body.description).toBe('Updated description by QA');
    });

    it('PATCH /api/categories/:id returns 404 for non-existent', async () => {
      const res = await adminRequest.patch('/api/categories/non-existent-cat-xyz').send({
        name: 'Ghost',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('AC: Admin can retrieve a specific category', () => {
    let getCategoryId: string;

    beforeAll(async () => {
      const res = await adminRequest.post('/api/categories').send({
        name: `QA Get Cat ${Date.now()}`,
        description: 'Category to be retrieved',
      });
      getCategoryId = res.body.id;
      createdCategoryIds.push(getCategoryId);
    });

    it('GET /api/categories/:id returns the category', async () => {
      const res = await unauthRequest.get(`/api/categories/${getCategoryId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(getCategoryId);
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('description');
    });

    it('GET /api/categories/:id returns 404 for non-existent', async () => {
      const res = await unauthRequest.get('/api/categories/non-existent-cat-xyz');
      expect(res.status).toBe(404);
    });
  });

  describe('AC: Admin can delete a category with no terms', () => {
    it('DELETE /api/categories/:id removes empty category', async () => {
      const createRes = await adminRequest.post('/api/categories').send({
        name: `QA Delete Cat ${Date.now()}`,
        description: 'Category to be deleted',
      });
      const id = createRes.body.id;

      const delRes = await adminRequest.delete(`/api/categories/${id}`);
      expect(delRes.status).toBe(204);

      const getRes = await unauthRequest.get(`/api/categories/${id}`);
      expect(getRes.status).toBe(404);
    });

    it('DELETE /api/categories/:id returns 404 for non-existent', async () => {
      const res = await adminRequest.delete('/api/categories/non-existent-cat-xyz');
      expect(res.status).toBe(404);
    });
  });

  describe('AC: Delete category with assigned terms is handled', () => {
    it('DELETE /api/categories/:id with terms assigned attempts deletion', async () => {
      const catName = `QA Terms Cat ${Date.now()}`;
      const catRes = await adminRequest.post('/api/categories').send({
        name: catName,
        description: 'Category with terms for delete test',
      });
      const catId = catRes.body.id;
      createdCategoryIds.push(catId);

      const termRes = await adminRequest.post('/api/terms').send({
        name: `QA Cat Term ${Date.now()}`,
        category: catName,
        definition: 'Term in category for delete protection test',
        whyExists: 'Testing',
        owner: 'QA Bot',
        status: 'Draft',
        visibility: 'Internal',
        version: 1,
      });
      const termId = termRes.body.id;

      const delRes = await adminRequest.delete(`/api/categories/${catId}`);
      expect([204, 400, 409]).toContain(delRes.status);

      if (termId) {
        await adminRequest.delete(`/api/terms/${termId}`);
      }
    });
  });

  describe('AC: Categories support sortOrder field', () => {
    it('category can be created with sortOrder', async () => {
      const cat = await adminRequest.post('/api/categories').send({
        name: `QA Sort Cat ${Date.now()}`,
        description: 'Has sort order',
        sortOrder: 42,
      });
      expect(cat.status).toBe(201);
      expect(cat.body.sortOrder).toBeDefined();
      createdCategoryIds.push(cat.body.id);
    });

    it('category sortOrder can be updated via PATCH', async () => {
      const cat = await adminRequest.post('/api/categories').send({
        name: `QA Reorder Cat ${Date.now()}`,
        description: 'Will be reordered',
        sortOrder: 10,
      });
      createdCategoryIds.push(cat.body.id);

      const res = await adminRequest.patch(`/api/categories/${cat.body.id}`).send({
        sortOrder: 50,
      });
      expect(res.status).toBe(200);
    });
  });

  describe('AC: Admin requires authentication for write ops', () => {
    it('POST /api/categories returns 401 for unauthenticated', async () => {
      const res = await unauthRequest.post('/api/categories').send({
        name: 'Should Fail', description: 'test',
      });
      expect(res.status).toBe(401);
    });

    it('PATCH /api/categories/:id returns 401 for unauthenticated', async () => {
      const res = await unauthRequest.patch('/api/categories/any-id').send({
        name: 'Nope',
      });
      expect(res.status).toBe(401);
    });

    it('DELETE /api/categories/:id returns 401 for unauthenticated', async () => {
      const res = await unauthRequest.delete('/api/categories/any-id');
      expect(res.status).toBe(401);
    });
  });
});
