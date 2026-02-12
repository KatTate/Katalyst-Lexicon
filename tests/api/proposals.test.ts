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

describe('Proposals API', () => {
  let proposalId: string;
  let withdrawProposalId: string;

  const baseProposal = {
    termName: `QA Proposal Term ${Date.now()}`,
    category: 'Strategy',
    type: 'new' as const,
    submittedBy: 'QA Bot',
    changesSummary: 'QA test proposal',
    definition: 'A term proposed by QA',
    whyExists: 'For testing',
    usedWhen: 'During tests',
    notUsedWhen: 'In production',
    status: 'pending' as const,
  };

  it('GET /api/proposals - returns list of proposals', async () => {
    const res = await request.get('/api/proposals');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/proposals - creates a new proposal', async () => {
    const res = await request.post('/api/proposals').send(baseProposal);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.termName).toBe(baseProposal.termName);
    expect(res.body.status).toBe('pending');
    proposalId = res.body.id;
  });

  it('POST /api/proposals - creates another proposal for withdraw test', async () => {
    const res = await request.post('/api/proposals').send({
      ...baseProposal,
      termName: `QA Withdraw Term ${Date.now()}`,
    });
    expect(res.status).toBe(201);
    withdrawProposalId = res.body.id;
  });

  it('GET /api/proposals/:id - returns proposal with events', async () => {
    const res = await request.get(`/api/proposals/${proposalId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(proposalId);
    expect(res.body).toHaveProperty('events');
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  it('GET /api/proposals/:id - returns 404 for non-existent', async () => {
    const res = await request.get('/api/proposals/non-existent-xyz');
    expect(res.status).toBe(404);
  });

  it('GET /api/proposals?status=pending - filters by status', async () => {
    const res = await request.get('/api/proposals?status=pending');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    for (const p of res.body) {
      expect(p.status).toBe('pending');
    }
  });

  it('POST /api/proposals/:id/request-changes - requests changes on a proposal', async () => {
    const res = await request.post(`/api/proposals/${proposalId}/request-changes`).send({
      comment: 'Please improve the definition',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/proposals/:id/resubmit - resubmits after changes requested', async () => {
    const res = await request.post(`/api/proposals/${proposalId}/resubmit`).send({
      definition: 'An improved definition by QA',
      changesSummary: 'Improved definition per review feedback',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.definition).toBe('An improved definition by QA');
  });

  it('POST /api/proposals/:id/approve - approves a proposal', async () => {
    const res = await request.post(`/api/proposals/${proposalId}/approve`).send({
      comment: 'Looks great',
      approvedBy: 'QA Approver',
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/proposals/:id/approve - returns 409 for already approved', async () => {
    const res = await request.post(`/api/proposals/${proposalId}/approve`).send({
      comment: 'Trying again',
    });
    expect(res.status).toBe(409);
  });

  it('POST /api/proposals/:id/withdraw - withdraws a pending proposal', async () => {
    const res = await request.post(`/api/proposals/${withdrawProposalId}/withdraw`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/proposals/:id/withdraw - returns 409 for already withdrawn', async () => {
    const res = await request.post(`/api/proposals/${withdrawProposalId}/withdraw`);
    expect(res.status).toBe(409);
  });

  it('DELETE /api/proposals/:id - deletes a proposal', async () => {
    const res = await request.delete(`/api/proposals/${withdrawProposalId}`);
    expect(res.status).toBe(204);
  });
});
