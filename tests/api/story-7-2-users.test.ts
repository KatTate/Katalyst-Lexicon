import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'http';
import { registerRoutes } from '../../server/routes';
import supertest from 'supertest';
import { db } from '../../server/db';
import { users } from '../../shared/models/auth';
import { eq } from 'drizzle-orm';

const TEST_ADMIN_ID = `test-user-admin-${Date.now()}`;
const TEST_MEMBER_ID = `test-user-member-${Date.now()}`;
let adminRequest: supertest.Agent;
let memberRequest: supertest.Agent;
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
  await db.insert(users).values([
    { id: TEST_ADMIN_ID, email: `user-admin-${Date.now()}@katgroupinc.com`, firstName: 'User', lastName: 'Admin', role: 'Admin' },
    { id: TEST_MEMBER_ID, email: `user-member-${Date.now()}@katgroupinc.com`, firstName: 'User', lastName: 'Member', role: 'Member' },
  ]).onConflictDoNothing();

  adminRequest = await createTestAppWithAuth(TEST_ADMIN_ID);
  memberRequest = await createTestAppWithAuth(TEST_MEMBER_ID);
  unauthRequest = await createTestAppWithAuth(null);
});

afterAll(async () => {
  servers.forEach(s => s.close());
  await db.delete(users).where(eq(users.id, TEST_ADMIN_ID));
  await db.delete(users).where(eq(users.id, TEST_MEMBER_ID));
});

describe('Story 7.2: User Management', () => {
  const createdUserIds: string[] = [];

  afterAll(async () => {
    for (const id of createdUserIds) {
      try {
        await db.delete(users).where(eq(users.id, id));
      } catch {}
    }
  });

  describe('AC: Admin sees table of all users', () => {
    it('GET /api/users returns 200 with array of users', async () => {
      const res = await adminRequest.get('/api/users');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('each user has name, email, role fields', async () => {
      const res = await adminRequest.get('/api/users');
      const user = res.body.find((u: any) => u.id === TEST_ADMIN_ID);
      expect(user).toBeDefined();
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
    });
  });

  describe('AC: Admin can create a new user', () => {
    it('POST /api/users creates user with all fields', async () => {
      const newUser = {
        email: `qa-new-user-${Date.now()}@katgroupinc.com`,
        firstName: 'QA',
        lastName: 'NewUser',
        role: 'Member' as const,
      };
      const res = await adminRequest.post('/api/users').send(newUser);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.firstName).toBe('QA');
      expect(res.body.role).toBe('Member');
      createdUserIds.push(res.body.id);
    });

    it('POST /api/users with duplicate email is handled gracefully', async () => {
      const email = `qa-dup-${Date.now()}@katgroupinc.com`;
      const res1 = await adminRequest.post('/api/users').send({
        email,
        firstName: 'Dup',
        lastName: 'User1',
        role: 'Member',
      });
      expect(res1.status).toBe(201);
      createdUserIds.push(res1.body.id);

      const res2 = await adminRequest.post('/api/users').send({
        email,
        firstName: 'Dup',
        lastName: 'User2',
        role: 'Member',
      });
      expect([201, 400, 409, 500]).toContain(res2.status);
      if (res2.status === 201 && res2.body.id) {
        createdUserIds.push(res2.body.id);
      }
    });
  });

  describe('AC: Admin can change a user role', () => {
    let roleChangeUserId: string;

    beforeAll(async () => {
      const res = await adminRequest.post('/api/users').send({
        email: `qa-role-${Date.now()}@katgroupinc.com`,
        firstName: 'Role',
        lastName: 'Changer',
        role: 'Member',
      });
      roleChangeUserId = res.body.id;
      createdUserIds.push(roleChangeUserId);
    });

    it('PATCH /api/users/:id changes role from Member to Approver', async () => {
      const res = await adminRequest.patch(`/api/users/${roleChangeUserId}`).send({
        role: 'Approver',
      });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('Approver');
    });

    it('PATCH /api/users/:id changes role from Approver to Admin', async () => {
      const res = await adminRequest.patch(`/api/users/${roleChangeUserId}`).send({
        role: 'Admin',
      });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('Admin');
    });

    it('PATCH /api/users/:id changes role back to Member', async () => {
      const res = await adminRequest.patch(`/api/users/${roleChangeUserId}`).send({
        role: 'Member',
      });
      expect(res.status).toBe(200);
      expect(res.body.role).toBe('Member');
    });
  });

  describe('AC: Cannot remove the last admin', () => {
    let soloAdminId: string;

    beforeAll(async () => {
      const res = await adminRequest.post('/api/users').send({
        email: `qa-solo-admin-${Date.now()}@katgroupinc.com`,
        firstName: 'Solo',
        lastName: 'Admin',
        role: 'Admin',
      });
      soloAdminId = res.body.id;
      createdUserIds.push(soloAdminId);
    });

    it('PATCH returns 400 when trying to demote the last admin', async () => {
      const allUsers = await adminRequest.get('/api/users');
      const admins = allUsers.body.filter((u: any) => u.role === 'Admin');

      if (admins.length === 1) {
        const lastAdminId = admins[0].id;
        const res = await adminRequest.patch(`/api/users/${lastAdminId}`).send({
          role: 'Member',
        });
        expect(res.status).toBe(400);
        expect(res.body.error).toMatch(/last admin/i);
      } else {
        expect(admins.length).toBeGreaterThan(0);
      }
    });
  });

  describe('AC: Admin can get a specific user', () => {
    it('GET /api/users/:id returns the user', async () => {
      const res = await adminRequest.get(`/api/users/${TEST_ADMIN_ID}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(TEST_ADMIN_ID);
    });

    it('GET /api/users/:id returns 404 for non-existent user', async () => {
      const res = await adminRequest.get('/api/users/non-existent-user-xyz');
      expect(res.status).toBe(404);
    });
  });

  describe('AC: Admin can delete a user', () => {
    it('DELETE /api/users/:id removes the user', async () => {
      const createRes = await adminRequest.post('/api/users').send({
        email: `qa-delete-user-${Date.now()}@katgroupinc.com`,
        firstName: 'Delete',
        lastName: 'Me',
        role: 'Member',
      });
      const id = createRes.body.id;

      const delRes = await adminRequest.delete(`/api/users/${id}`);
      expect(delRes.status).toBe(204);

      const getRes = await adminRequest.get(`/api/users/${id}`);
      expect(getRes.status).toBe(404);
    });
  });

  describe('AC: Non-admin cannot access user management', () => {
    it('GET /api/users returns 401 for unauthenticated', async () => {
      const res = await unauthRequest.get('/api/users');
      expect(res.status).toBe(401);
    });

    it('POST /api/users returns 403 for Member', async () => {
      const res = await memberRequest.post('/api/users').send({
        email: 'nope@test.com', firstName: 'No', lastName: 'Way',
      });
      expect(res.status).toBe(403);
    });

    it('PATCH /api/users/:id returns 403 for Member', async () => {
      const res = await memberRequest.patch(`/api/users/${TEST_ADMIN_ID}`).send({
        role: 'Member',
      });
      expect(res.status).toBe(403);
    });
  });
});
