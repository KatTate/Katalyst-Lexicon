import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'http';
import { registerRoutes } from '../../server/routes';
import supertest from 'supertest';
import { db } from '../../server/db';
import { users } from '../../shared/models/auth';
import { eq } from 'drizzle-orm';

const TEST_ADMIN_ID = `test-settings-admin-${Date.now()}`;
const TEST_MEMBER_ID = `test-settings-member-${Date.now()}`;
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
    { id: TEST_ADMIN_ID, email: `settings-admin-${Date.now()}@katgroupinc.com`, firstName: 'Settings', lastName: 'Admin', role: 'Admin' },
    { id: TEST_MEMBER_ID, email: `settings-member-${Date.now()}@katgroupinc.com`, firstName: 'Settings', lastName: 'Member', role: 'Member' },
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

describe('Story 7.4: System Settings & Governance Controls', () => {
  const testTimestamp = Date.now();

  describe('AC: Admin can view all settings', () => {
    it('GET /api/settings returns 200 with array', async () => {
      const res = await adminRequest.get('/api/settings');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('AC: Admin can toggle governance settings', () => {
    it('POST /api/settings saves "require_approver_signoff" toggle (on)', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `require_approver_signoff_${testTimestamp}`,
        value: true,
      });
      expect(res.status).toBe(200);
      expect(res.body.key).toBe(`require_approver_signoff_${testTimestamp}`);
      expect(res.body.value).toBe(true);
    });

    it('POST /api/settings saves "require_change_notes" toggle (on)', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `require_change_notes_${testTimestamp}`,
        value: true,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(true);
    });

    it('POST /api/settings saves "allow_self_approval" toggle (off)', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `allow_self_approval_${testTimestamp}`,
        value: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(false);
    });
  });

  describe('AC: Admin can toggle notification settings', () => {
    it('POST /api/settings saves "weekly_digest" toggle', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `weekly_digest_${testTimestamp}`,
        value: true,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(true);
    });

    it('POST /api/settings saves "new_proposal_alerts" toggle', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `new_proposal_alerts_${testTimestamp}`,
        value: true,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(true);
    });

    it('POST /api/settings saves "changes_requested_alerts" toggle', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `changes_requested_alerts_${testTimestamp}`,
        value: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(false);
    });
  });

  describe('AC: Admin can toggle visibility settings', () => {
    it('POST /api/settings saves "enable_client_portal" toggle', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `enable_client_portal_${testTimestamp}`,
        value: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(false);
    });

    it('POST /api/settings saves "enable_public_glossary" toggle', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: `enable_public_glossary_${testTimestamp}`,
        value: true,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(true);
    });
  });

  describe('AC: Setting change auto-saves (upsert behavior)', () => {
    const toggleKey = `auto_save_test_${testTimestamp}`;

    it('first save creates the setting', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: toggleKey,
        value: true,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(true);
    });

    it('second save updates the same setting (upsert)', async () => {
      const res = await adminRequest.post('/api/settings').send({
        key: toggleKey,
        value: false,
      });
      expect(res.status).toBe(200);
      expect(res.body.value).toBe(false);
    });

    it('GET /api/settings reflects the updated value', async () => {
      const res = await adminRequest.get('/api/settings');
      expect(res.status).toBe(200);
      const setting = res.body.find((s: any) => s.key === toggleKey);
      expect(setting).toBeDefined();
      expect(setting.value).toBe(false);
    });
  });

  describe('AC: Batch settings save works', () => {
    it('POST /api/settings/batch saves multiple settings at once', async () => {
      const res = await adminRequest.post('/api/settings/batch').send({
        settings: [
          { key: `batch_gov_1_${testTimestamp}`, value: true },
          { key: `batch_gov_2_${testTimestamp}`, value: false },
          { key: `batch_vis_1_${testTimestamp}`, value: true },
        ],
      });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3);
    });
  });

  describe('AC: Non-admin gets "Permission denied" on settings', () => {
    it('GET /api/settings returns 401 for unauthenticated', async () => {
      const res = await unauthRequest.get('/api/settings');
      expect(res.status).toBe(401);
    });

    it('POST /api/settings returns 401 for unauthenticated', async () => {
      const res = await unauthRequest.post('/api/settings').send({
        key: 'nope', value: true,
      });
      expect(res.status).toBe(401);
    });

    it('POST /api/settings returns 403 for Member', async () => {
      const res = await memberRequest.post('/api/settings').send({
        key: 'nope', value: true,
      });
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Permission denied');
    });

    it('POST /api/settings/batch returns 403 for Member', async () => {
      const res = await memberRequest.post('/api/settings/batch').send({
        settings: [{ key: 'nope', value: true }],
      });
      expect(res.status).toBe(403);
    });
  });
});
