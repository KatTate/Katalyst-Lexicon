import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'http';
import { registerRoutes } from '../../server/routes';
import supertest from 'supertest';
import { db } from '../../server/db';
import { users } from '../../shared/models/auth';
import { eq } from 'drizzle-orm';

const TEST_MEMBER_ID = `test-member-${Date.now()}`;
const TEST_APPROVER_ID = `test-approver-${Date.now()}`;
const TEST_ADMIN_ID = `test-admin-${Date.now()}`;

let unauthenticatedRequest: supertest.Agent;
let memberRequest: supertest.Agent;
let approverRequest: supertest.Agent;
let adminRequest: supertest.Agent;

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
  await db.insert(users).values([
    { id: TEST_MEMBER_ID, email: `member-${Date.now()}@test.com`, firstName: 'Test', lastName: 'Member', role: 'Member' },
    { id: TEST_APPROVER_ID, email: `approver-${Date.now()}@test.com`, firstName: 'Test', lastName: 'Approver', role: 'Approver' },
    { id: TEST_ADMIN_ID, email: `admin-${Date.now()}@test.com`, firstName: 'Test', lastName: 'Admin', role: 'Admin' },
  ]).onConflictDoNothing();

  unauthenticatedRequest = await createTestAppWithAuth(null);
  memberRequest = await createTestAppWithAuth(TEST_MEMBER_ID);
  approverRequest = await createTestAppWithAuth(TEST_APPROVER_ID);
  adminRequest = await createTestAppWithAuth(TEST_ADMIN_ID);
});

afterAll(async () => {
  servers.forEach(s => s.close());
  await db.delete(users).where(eq(users.id, TEST_MEMBER_ID));
  await db.delete(users).where(eq(users.id, TEST_APPROVER_ID));
  await db.delete(users).where(eq(users.id, TEST_ADMIN_ID));
});

describe('AC1: Unauthenticated users get 401 on write operations', () => {
  it('POST /api/proposals returns 401 with "Please sign in"', async () => {
    const res = await unauthenticatedRequest.post('/api/proposals').send({
      termName: 'Test', category: 'Strategy', type: 'new',
      definition: 'test', whyExists: 'test', changesSummary: 'test',
    });
    expect(res.status).toBe(401);
    expect(res.body.error || res.body.message).toMatch(/sign in|unauthorized/i);
  });

  it('POST /api/terms returns 401 with "Please sign in"', async () => {
    const res = await unauthenticatedRequest.post('/api/terms').send({
      name: 'Test', category: 'Strategy', definition: 'test',
      whyExists: 'test', owner: 'test',
    });
    expect(res.status).toBe(401);
    expect(res.body.error || res.body.message).toMatch(/sign in|unauthorized/i);
  });

  it('POST /api/categories returns 401', async () => {
    const res = await unauthenticatedRequest.post('/api/categories').send({
      name: 'Test Cat', description: 'test',
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/settings returns 401', async () => {
    const res = await unauthenticatedRequest.post('/api/settings').send({
      key: 'test', value: true,
    });
    expect(res.status).toBe(401);
  });

  it('POST /api/principles returns 401', async () => {
    const res = await unauthenticatedRequest.post('/api/principles').send({
      title: 'Test', slug: 'test', summary: 'test', body: 'test',
    });
    expect(res.status).toBe(401);
  });

  it('GET /api/proposals returns 401', async () => {
    const res = await unauthenticatedRequest.get('/api/proposals');
    expect(res.status).toBe(401);
  });

  it('GET /api/settings returns 401', async () => {
    const res = await unauthenticatedRequest.get('/api/settings');
    expect(res.status).toBe(401);
  });

  it('GET /api/users returns 401', async () => {
    const res = await unauthenticatedRequest.get('/api/users');
    expect(res.status).toBe(401);
  });
});

describe('AC5: Public read access without authentication', () => {
  it('GET /api/terms returns 200', async () => {
    const res = await unauthenticatedRequest.get('/api/terms');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/terms/search returns 200', async () => {
    const res = await unauthenticatedRequest.get('/api/terms/search?q=test');
    expect(res.status).toBe(200);
  });

  it('GET /api/categories returns 200', async () => {
    const res = await unauthenticatedRequest.get('/api/categories');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /api/principles returns 200', async () => {
    const res = await unauthenticatedRequest.get('/api/principles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('AC2: Member gets 403 "Permission denied" on admin endpoints', () => {
  it('POST /api/terms returns 403 with "Permission denied"', async () => {
    const res = await memberRequest.post('/api/terms').send({
      name: 'Test', category: 'Strategy', definition: 'test',
      whyExists: 'test', owner: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/categories returns 403 with "Permission denied"', async () => {
    const res = await memberRequest.post('/api/categories').send({
      name: 'Test Cat', description: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/settings returns 403 with "Permission denied"', async () => {
    const res = await memberRequest.post('/api/settings').send({
      key: 'test', value: true,
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/users returns 403 with "Permission denied"', async () => {
    const res = await memberRequest.post('/api/users').send({
      email: 'test@test.com', firstName: 'Test', lastName: 'Test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/principles returns 403 with "Permission denied"', async () => {
    const res = await memberRequest.post('/api/principles').send({
      title: 'Test', slug: 'test', summary: 'test', body: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });
});

describe('AC3: Member gets 403 on review endpoints', () => {
  let testProposalId: string;

  beforeAll(async () => {
    const res = await memberRequest.post('/api/proposals').send({
      termName: `RBAC Test ${Date.now()}`, category: 'Strategy', type: 'new',
      definition: 'test', whyExists: 'test', changesSummary: 'test',
    });
    testProposalId = res.body.id;
  });

  afterAll(async () => {
    if (testProposalId) {
      await adminRequest.delete(`/api/proposals/${testProposalId}`);
    }
  });

  it('POST /api/proposals/:id/approve returns 403 for Member', async () => {
    const res = await memberRequest.post(`/api/proposals/${testProposalId}/approve`).send({
      comment: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/proposals/:id/reject returns 403 for Member', async () => {
    const res = await memberRequest.post(`/api/proposals/${testProposalId}/reject`).send({
      comment: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/proposals/:id/request-changes returns 403 for Member', async () => {
    const res = await memberRequest.post(`/api/proposals/${testProposalId}/request-changes`).send({
      comment: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });
});

describe('AC4: Approver gets 403 on admin actions', () => {
  it('POST /api/terms returns 403 for Approver', async () => {
    const res = await approverRequest.post('/api/terms').send({
      name: 'Test', category: 'Strategy', definition: 'test',
      whyExists: 'test', owner: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/categories returns 403 for Approver', async () => {
    const res = await approverRequest.post('/api/categories').send({
      name: 'Test Cat', description: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/settings returns 403 for Approver', async () => {
    const res = await approverRequest.post('/api/settings').send({
      key: 'test', value: true,
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/users returns 403 for Approver', async () => {
    const res = await approverRequest.post('/api/users').send({
      email: 'test@test.com', firstName: 'Test', lastName: 'Test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });

  it('POST /api/principles returns 403 for Approver', async () => {
    const res = await approverRequest.post('/api/principles').send({
      title: 'Test', slug: 'test', summary: 'test', body: 'test',
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Permission denied');
  });
});

describe('Positive auth: correct roles can access their endpoints', () => {
  it('Member can POST /api/proposals (propose permission)', async () => {
    const res = await memberRequest.post('/api/proposals').send({
      termName: `Member Propose ${Date.now()}`, category: 'Strategy', type: 'new',
      definition: 'test', whyExists: 'test', changesSummary: 'test',
    });
    expect(res.status).toBe(201);
    if (res.body.id) {
      await adminRequest.delete(`/api/proposals/${res.body.id}`);
    }
  });

  it('Approver can access review endpoints', async () => {
    const createRes = await approverRequest.post('/api/proposals').send({
      termName: `Approver Review ${Date.now()}`, category: 'Strategy', type: 'new',
      definition: 'test', whyExists: 'test', changesSummary: 'test',
    });
    expect(createRes.status).toBe(201);
    const pid = createRes.body.id;

    const approveRes = await approverRequest.post(`/api/proposals/${pid}/approve`).send({
      comment: 'Approved by test approver',
    });
    expect(approveRes.status).toBe(200);

    await adminRequest.delete(`/api/proposals/${pid}`);
  });

  it('Admin can POST /api/categories (admin permission)', async () => {
    const res = await adminRequest.post('/api/categories').send({
      name: `RBAC Test Category ${Date.now()}`, description: 'test category',
    });
    expect(res.status).toBe(201);
    if (res.body.id) {
      await adminRequest.delete(`/api/categories/${res.body.id}`);
    }
  });

  it('Admin can POST /api/settings (admin permission)', async () => {
    const res = await adminRequest.post('/api/settings').send({
      key: `rbac_test_${Date.now()}`, value: true,
    });
    expect(res.status).toBe(200);
  });

  it('Admin can GET /api/proposals (authenticated)', async () => {
    const res = await adminRequest.get('/api/proposals');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('Member can GET /api/proposals (authenticated)', async () => {
    const res = await memberRequest.get('/api/proposals');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('AC12: Proposal submittedBy uses real user identity', () => {
  it('submittedBy is set to authenticated user name, not client-provided value', async () => {
    const res = await memberRequest.post('/api/proposals').send({
      termName: `Identity Test ${Date.now()}`, category: 'Strategy', type: 'new',
      submittedBy: 'Hacker McHackface',
      definition: 'test', whyExists: 'test', changesSummary: 'test',
    });
    expect(res.status).toBe(201);
    expect(res.body.submittedBy).toBe('Test Member');
    expect(res.body.submittedBy).not.toBe('Hacker McHackface');

    if (res.body.id) {
      await adminRequest.delete(`/api/proposals/${res.body.id}`);
    }
  });
});
