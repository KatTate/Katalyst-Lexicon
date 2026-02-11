import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5000';

describe('Epic 4: Principles & Knowledge Connections — API Tests', () => {
  let principleId: string;
  let principleSlug: string;

  describe('GET /api/principles — principles list', () => {
    it('returns a list of principles with 200 status', async () => {
      const res = await fetch(`${BASE}/api/principles`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);

      principleId = data[0].id;
      principleSlug = data[0].slug;
    });

    it('each principle has required display fields', async () => {
      const res = await fetch(`${BASE}/api/principles`);
      const data = await res.json();
      const p = data[0];
      expect(p).toHaveProperty('id');
      expect(p).toHaveProperty('title');
      expect(p).toHaveProperty('slug');
      expect(p).toHaveProperty('summary');
      expect(p).toHaveProperty('status');
      expect(p).toHaveProperty('visibility');
      expect(p).toHaveProperty('tags');
    });

    it('principles include linkedTermCount', async () => {
      const res = await fetch(`${BASE}/api/principles`);
      const data = await res.json();
      const p = data[0];
      expect(p).toHaveProperty('linkedTermCount');
      expect(typeof p.linkedTermCount).toBe('number');
      expect(p.linkedTermCount).toBeGreaterThanOrEqual(0);
    });

    it('principles are sorted by sortOrder', async () => {
      const res = await fetch(`${BASE}/api/principles`);
      const data = await res.json();
      if (data.length < 2) return;

      for (let i = 0; i < data.length - 1; i++) {
        expect(data[i].sortOrder).toBeLessThanOrEqual(data[i + 1].sortOrder);
      }
    });
  });

  describe('GET /api/principles/:id — principle detail', () => {
    it('returns a single principle by UUID', async () => {
      const res = await fetch(`${BASE}/api/principles`);
      const data = await res.json();
      principleId = data[0].id;

      const detailRes = await fetch(`${BASE}/api/principles/${principleId}`);
      expect(detailRes.status).toBe(200);
      const principle = await detailRes.json();
      expect(principle.id).toBe(principleId);
    });

    it('returns a principle by slug', async () => {
      const res = await fetch(`${BASE}/api/principles`);
      const data = await res.json();
      principleSlug = data[0].slug;

      const detailRes = await fetch(`${BASE}/api/principles/${principleSlug}`);
      expect(detailRes.status).toBe(200);
      const principle = await detailRes.json();
      expect(principle.slug).toBe(principleSlug);
    });

    it('principle detail includes body (markdown content)', async () => {
      const res = await fetch(`${BASE}/api/principles/${principleId}`);
      const principle = await res.json();
      expect(principle).toHaveProperty('body');
      expect(typeof principle.body).toBe('string');
      expect(principle.body.length).toBeGreaterThan(0);
    });

    it('returns 404 for non-existent principle', async () => {
      const res = await fetch(`${BASE}/api/principles/00000000-0000-0000-0000-000000000000`);
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/principles/:id/terms — linked terms', () => {
    it('returns terms linked to a principle', async () => {
      const res = await fetch(`${BASE}/api/principles`);
      const data = await res.json();
      const withLinks = data.find((p: any) => p.linkedTermCount > 0) || data[0];

      const termsRes = await fetch(`${BASE}/api/principles/${withLinks.id}/terms`);
      expect(termsRes.status).toBe(200);
      const terms = await termsRes.json();
      expect(Array.isArray(terms)).toBe(true);

      if (withLinks.linkedTermCount > 0) {
        expect(terms.length).toBeGreaterThan(0);
        expect(terms[0]).toHaveProperty('id');
        expect(terms[0]).toHaveProperty('name');
      }
    });
  });

  describe('GET /api/terms/:id/principles — bidirectional link', () => {
    it('returns principles linked to a term', async () => {
      const termsRes = await fetch(`${BASE}/api/terms`);
      const terms = await termsRes.json();
      if (terms.length === 0) return;

      const termId = terms[0].id;
      const res = await fetch(`${BASE}/api/terms/${termId}/principles`);
      expect(res.status).toBe(200);
      const principles = await res.json();
      expect(Array.isArray(principles)).toBe(true);
    });

    it('bidirectional consistency: if principle links to term, term links back', async () => {
      const principlesRes = await fetch(`${BASE}/api/principles`);
      const allPrinciples = await principlesRes.json();
      const withLinks = allPrinciples.find((p: any) => p.linkedTermCount > 0);
      if (!withLinks) return;

      const linkedTermsRes = await fetch(`${BASE}/api/principles/${withLinks.id}/terms`);
      const linkedTerms = await linkedTermsRes.json();
      if (linkedTerms.length === 0) return;

      const termId = linkedTerms[0].id;
      const backLinksRes = await fetch(`${BASE}/api/terms/${termId}/principles`);
      const backLinks = await backLinksRes.json();
      const found = backLinks.find((p: any) => p.id === withLinks.id);
      expect(found).toBeTruthy();
    });
  });
});
