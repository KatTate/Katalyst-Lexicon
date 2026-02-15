import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'http';
import { registerRoutes } from '../../server/routes';
import supertest from 'supertest';
import { db } from '../../server/db';
import { users } from '../../shared/models/auth';
import { eq } from 'drizzle-orm';

const TEST_ADMIN_ID = `test-princ-admin-${Date.now()}`;
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
    email: `princ-admin-${Date.now()}@katgroupinc.com`,
    firstName: 'Princ',
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

describe('Story 7.3: Principles Authoring (Admin)', () => {
  const createdPrincipleIds: string[] = [];
  const createdTermIds: string[] = [];

  afterAll(async () => {
    for (const id of createdPrincipleIds) {
      try {
        await adminRequest.delete(`/api/principles/${id}`);
      } catch {}
    }
    for (const id of createdTermIds) {
      try {
        await adminRequest.delete(`/api/terms/${id}`);
      } catch {}
    }
  });

  describe('AC: Admin can create a principle with all fields', () => {
    it('POST /api/principles creates principle with title, summary, body (markdown), status, visibility, tags', async () => {
      const slug = `qa-principle-${Date.now()}`;
      const res = await adminRequest.post('/api/principles').send({
        title: 'QA Test Principle - Story 7.3',
        slug,
        summary: 'A principle created by QA automation for story 7.3',
        body: '# Test Principle\n\nThis is **bold** and _italic_ markdown.\n\n- List item 1\n- List item 2\n\n```js\nconsole.log("hello");\n```',
        status: 'Draft',
        visibility: 'Internal',
        tags: ['testing', 'qa', 'automation'],
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.title).toBe('QA Test Principle - Story 7.3');
      expect(res.body.slug).toContain('qa-principle-');
      expect(res.body.status).toBe('Draft');
      expect(res.body.visibility).toBe('Internal');
      expect(res.body.body).toContain('# Test Principle');
      createdPrincipleIds.push(res.body.id);
    });

    it('POST /api/principles returns 400 for missing required fields', async () => {
      const res = await adminRequest.post('/api/principles').send({});
      expect(res.status).toBe(400);
    });

    it('POST /api/principles handles duplicate slugs gracefully', async () => {
      const slug = `qa-dup-slug-${Date.now()}`;
      const res1 = await adminRequest.post('/api/principles').send({
        title: 'Duplicate Slug Test 1',
        slug,
        summary: 'First principle',
        body: 'Body 1',
      });
      expect(res1.status).toBe(201);
      createdPrincipleIds.push(res1.body.id);

      const res2 = await adminRequest.post('/api/principles').send({
        title: 'Duplicate Slug Test 2',
        slug,
        summary: 'Second principle with same slug',
        body: 'Body 2',
      });
      expect(res2.status).toBe(201);
      expect(res2.body.slug).not.toBe(res1.body.slug);
      createdPrincipleIds.push(res2.body.id);
    });
  });

  describe('AC: Admin can edit a principle', () => {
    let editPrincipleId: string;

    beforeAll(async () => {
      const res = await adminRequest.post('/api/principles').send({
        title: 'QA Edit Principle',
        slug: `qa-edit-princ-${Date.now()}`,
        summary: 'To be edited',
        body: 'Original body content',
        status: 'Draft',
        visibility: 'Internal',
      });
      editPrincipleId = res.body.id;
      createdPrincipleIds.push(editPrincipleId);
    });

    it('PATCH /api/principles/:id updates title', async () => {
      const res = await adminRequest.patch(`/api/principles/${editPrincipleId}`).send({
        title: 'Updated Principle Title',
      });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Principle Title');
    });

    it('PATCH /api/principles/:id updates body with markdown', async () => {
      const newBody = '# Updated Body\n\n## Section\n\nNew **markdown** content with `code`.';
      const res = await adminRequest.patch(`/api/principles/${editPrincipleId}`).send({
        body: newBody,
      });
      expect(res.status).toBe(200);
      expect(res.body.body).toBe(newBody);
    });

    it('PATCH /api/principles/:id updates status to Published', async () => {
      const res = await adminRequest.patch(`/api/principles/${editPrincipleId}`).send({
        status: 'Published',
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Published');
    });

    it('PATCH /api/principles/:id updates visibility', async () => {
      const res = await adminRequest.patch(`/api/principles/${editPrincipleId}`).send({
        visibility: 'Client-Safe',
      });
      expect(res.status).toBe(200);
      expect(res.body.visibility).toBe('Client-Safe');
    });

    it('PATCH /api/principles/:id returns 404 for non-existent', async () => {
      const res = await adminRequest.patch('/api/principles/non-existent-xyz').send({
        title: 'Ghost',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('AC: Admin can archive a principle', () => {
    let archivePrincipleId: string;

    beforeAll(async () => {
      const res = await adminRequest.post('/api/principles').send({
        title: 'QA Archive Principle',
        slug: `qa-archive-princ-${Date.now()}`,
        summary: 'To be archived',
        body: 'Archive test body',
        status: 'Published',
      });
      archivePrincipleId = res.body.id;
      createdPrincipleIds.push(archivePrincipleId);
    });

    it('PATCH /api/principles/:id can set status to Archived', async () => {
      const res = await adminRequest.patch(`/api/principles/${archivePrincipleId}`).send({
        status: 'Archived',
      });
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Archived');
    });

    it('archived principle is still viewable via GET', async () => {
      const res = await unauthRequest.get(`/api/principles/${archivePrincipleId}`);
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('Archived');
    });
  });

  describe('AC: Admin can link and unlink terms to principles', () => {
    let linkPrincipleId: string;
    let linkTermId1: string;
    let linkTermId2: string;

    beforeAll(async () => {
      const princRes = await adminRequest.post('/api/principles').send({
        title: 'QA Link Principle',
        slug: `qa-link-princ-${Date.now()}`,
        summary: 'For linking tests',
        body: 'Link test body',
      });
      linkPrincipleId = princRes.body.id;
      createdPrincipleIds.push(linkPrincipleId);

      const term1Res = await adminRequest.post('/api/terms').send({
        name: `QA Link Term 1 ${Date.now()}`,
        category: 'Strategy',
        definition: 'Term 1 for linking test',
        whyExists: 'Testing',
        owner: 'QA Bot',
        status: 'Draft',
        visibility: 'Internal',
        version: 1,
      });
      linkTermId1 = term1Res.body.id;
      createdTermIds.push(linkTermId1);

      const term2Res = await adminRequest.post('/api/terms').send({
        name: `QA Link Term 2 ${Date.now()}`,
        category: 'Strategy',
        definition: 'Term 2 for linking test',
        whyExists: 'Testing',
        owner: 'QA Bot',
        status: 'Draft',
        visibility: 'Internal',
        version: 1,
      });
      linkTermId2 = term2Res.body.id;
      createdTermIds.push(linkTermId2);
    });

    it('POST /api/principles/:id/terms links a term to a principle', async () => {
      const res = await adminRequest.post(`/api/principles/${linkPrincipleId}/terms`).send({
        termId: linkTermId1,
      });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('POST /api/principles/:id/terms links a second term', async () => {
      const res = await adminRequest.post(`/api/principles/${linkPrincipleId}/terms`).send({
        termId: linkTermId2,
      });
      expect(res.status).toBe(201);
    });

    it('GET /api/principles/:id/terms returns linked terms', async () => {
      const res = await unauthRequest.get(`/api/principles/${linkPrincipleId}/terms`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('GET /api/terms/:id/principles returns linked principles (bidirectional)', async () => {
      const res = await unauthRequest.get(`/api/terms/${linkTermId1}/principles`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('DELETE /api/principles/:principleId/terms/:termId unlinks a term', async () => {
      const res = await adminRequest.delete(`/api/principles/${linkPrincipleId}/terms/${linkTermId1}`);
      expect(res.status).toBe(204);
    });

    it('after unlinking, GET /api/principles/:id/terms returns fewer terms', async () => {
      const res = await unauthRequest.get(`/api/principles/${linkPrincipleId}/terms`);
      expect(res.status).toBe(200);
      const termIds = res.body.map((t: any) => t.id);
      expect(termIds).not.toContain(linkTermId1);
    });
  });

  describe('AC: Principle can be retrieved by slug', () => {
    let slugPrincipleId: string;
    let slugValue: string;

    beforeAll(async () => {
      slugValue = `qa-slug-test-${Date.now()}`;
      const res = await adminRequest.post('/api/principles').send({
        title: 'QA Slug Test Principle',
        slug: slugValue,
        summary: 'For slug lookup tests',
        body: 'Slug test body',
      });
      slugPrincipleId = res.body.id;
      slugValue = res.body.slug;
      createdPrincipleIds.push(slugPrincipleId);
    });

    it('GET /api/principles/:slug returns principle by slug', async () => {
      const res = await unauthRequest.get(`/api/principles/${slugValue}`);
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(slugValue);
    });
  });

  describe('AC: Principles are publicly readable', () => {
    it('GET /api/principles returns 200 for unauthenticated users', async () => {
      const res = await unauthRequest.get('/api/principles');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('AC: Only admins can write principles', () => {
    it('POST /api/principles returns 401 for unauthenticated', async () => {
      const res = await unauthRequest.post('/api/principles').send({
        title: 'Fail', slug: 'fail', summary: 'fail', body: 'fail',
      });
      expect(res.status).toBe(401);
    });
  });

  describe('AC: Admin can delete a principle', () => {
    it('DELETE /api/principles/:id removes the principle', async () => {
      const createRes = await adminRequest.post('/api/principles').send({
        title: 'QA Delete Principle',
        slug: `qa-del-princ-${Date.now()}`,
        summary: 'Will be deleted',
        body: 'Delete me',
      });
      const id = createRes.body.id;

      const delRes = await adminRequest.delete(`/api/principles/${id}`);
      expect(delRes.status).toBe(204);

      const getRes = await unauthRequest.get(`/api/principles/${id}`);
      expect(getRes.status).toBe(404);
    });
  });
});
