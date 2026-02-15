import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestApp, closeTestApp } from './setup';
import type supertest from 'supertest';

let request: supertest.Agent;

const VALID_SECRET = process.env.EXTENSION_API_SECRET || 'test-secret';
const VALID_EMAIL = 'qa-ext@katgroupinc.com';

beforeAll(async () => {
  process.env.EXTENSION_API_SECRET = VALID_SECRET;
  process.env.ALLOWED_EMAIL_DOMAIN = 'katgroupinc.com';
  request = await createTestApp();
});

afterAll(async () => {
  await closeTestApp();
});

describe('Extension Auth Middleware', () => {
  const proposalPayload = {
    termName: `ExtAuth-Test-${Date.now()}`,
    category: 'Strategy',
    type: 'new' as const,
    changesSummary: 'Extension auth test proposal',
    definition: 'A term proposed via extension auth test',
    whyExists: 'For testing extension auth',
    usedWhen: 'During tests',
    notUsedWhen: 'In production',
  };

  it('POST /api/proposals - returns 401 without any auth headers', async () => {
    const res = await request
      .post('/api/proposals')
      .send(proposalPayload);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/sign in/i);
  });

  it('POST /api/proposals - returns 401 with empty secret (not recognized as extension request)', async () => {
    const res = await request
      .post('/api/proposals')
      .set('X-Extension-User-Email', VALID_EMAIL)
      .set('X-Extension-Secret', '')
      .send(proposalPayload);
    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/sign in/i);
  });

  it('POST /api/proposals - returns 403 with wrong secret', async () => {
    const res = await request
      .post('/api/proposals')
      .set('X-Extension-User-Email', VALID_EMAIL)
      .set('X-Extension-Secret', 'wrong-secret-value')
      .send(proposalPayload);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/invalid extension secret/i);
  });

  it('POST /api/proposals - returns 403 with disallowed email domain', async () => {
    const res = await request
      .post('/api/proposals')
      .set('X-Extension-User-Email', 'outsider@gmail.com')
      .set('X-Extension-Secret', VALID_SECRET)
      .send(proposalPayload);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/domain/i);
  });

  it('POST /api/proposals - succeeds with valid extension auth headers', async () => {
    const payload = {
      ...proposalPayload,
      termName: `ExtAuth-Valid-${Date.now()}`,
    };
    const res = await request
      .post('/api/proposals')
      .set('X-Extension-User-Email', VALID_EMAIL)
      .set('X-Extension-Secret', VALID_SECRET)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.termName).toBe(payload.termName);
    expect(res.body.status).toBe('pending');

    await request.delete(`/api/proposals/${res.body.id}`);
  });

  it('POST /api/proposals - auto-provisions user from extension email', async () => {
    const uniqueEmail = `ext-provision-${Date.now()}@katgroupinc.com`;
    const payload = {
      ...proposalPayload,
      termName: `ExtAuth-Provision-${Date.now()}`,
    };
    const res = await request
      .post('/api/proposals')
      .set('X-Extension-User-Email', uniqueEmail)
      .set('X-Extension-Secret', VALID_SECRET)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.submittedBy).toBeDefined();

    await request.delete(`/api/proposals/${res.body.id}`);
  });

  it('POST /api/proposals - returns 403 with wrong extension ID', async () => {
    const original = process.env.ALLOWED_EXTENSION_ID;
    process.env.ALLOWED_EXTENSION_ID = 'allowed-extension-id-123';

    const res = await request
      .post('/api/proposals')
      .set('X-Extension-User-Email', VALID_EMAIL)
      .set('X-Extension-Secret', VALID_SECRET)
      .set('X-Extension-Id', 'wrong-extension-id-456')
      .send(proposalPayload);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/unrecognized extension/i);

    if (original) {
      process.env.ALLOWED_EXTENSION_ID = original;
    } else {
      delete process.env.ALLOWED_EXTENSION_ID;
    }
  });
});

describe('Extension Proposal Creation — field validation', () => {
  const validHeaders = {
    'X-Extension-User-Email': VALID_EMAIL,
    'X-Extension-Secret': VALID_SECRET,
  };

  it('POST /api/proposals - returns 400 for missing required fields', async () => {
    const res = await request
      .post('/api/proposals')
      .set(validHeaders)
      .send({ termName: 'Incomplete' });
    expect(res.status).toBe(400);
  });

  it('POST /api/proposals - accepts full extension clipper payload', async () => {
    const payload = {
      termName: `Clipper-Full-${Date.now()}`,
      category: 'Strategy',
      type: 'new',
      definition: 'Full clipper payload definition',
      whyExists: 'Testing full payload',
      usedWhen: 'When testing clipper submissions',
      notUsedWhen: 'In manual workflows',
      changesSummary: 'New term proposed via extension clipper',
      examplesGood: [],
      examplesBad: [],
      synonyms: [],
    };
    const res = await request
      .post('/api/proposals')
      .set(validHeaders)
      .send(payload);
    expect(res.status).toBe(201);
    expect(res.body.termName).toBe(payload.termName);
    expect(res.body.definition).toBe(payload.definition);
    expect(res.body.whyExists).toBe(payload.whyExists);
    expect(res.body.changesSummary).toBe(payload.changesSummary);

    await request.delete(`/api/proposals/${res.body.id}`);
  });
});
