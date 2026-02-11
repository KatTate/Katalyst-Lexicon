import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5000';

describe('Epic 2: Term Detail Experience — API Tests', () => {
  let termId: string;
  let termData: any;

  describe('GET /api/terms/:id — full term detail', () => {
    it('returns all Tier 1 fields for term detail page', async () => {
      const termsRes = await fetch(`${BASE}/api/terms`);
      const terms = await termsRes.json();
      expect(terms.length).toBeGreaterThan(0);

      termId = terms[0].id;
      const res = await fetch(`${BASE}/api/terms/${termId}`);
      expect(res.status).toBe(200);
      termData = await res.json();

      expect(termData).toHaveProperty('name');
      expect(termData).toHaveProperty('definition');
      expect(termData).toHaveProperty('category');
      expect(termData).toHaveProperty('status');
      expect(termData).toHaveProperty('version');
      expect(termData).toHaveProperty('updatedAt');
      expect(termData).toHaveProperty('whyExists');
      expect(termData).toHaveProperty('usedWhen');
      expect(termData).toHaveProperty('notUsedWhen');
      expect(termData).toHaveProperty('owner');
      expect(termData).toHaveProperty('visibility');
    });

    it('returns array fields for Tier 2 content (examples, synonyms)', async () => {
      const res = await fetch(`${BASE}/api/terms/${termId}`);
      const term = await res.json();

      expect(term).toHaveProperty('examplesGood');
      expect(term).toHaveProperty('examplesBad');
      expect(term).toHaveProperty('synonyms');
      expect(Array.isArray(term.examplesGood)).toBe(true);
      expect(Array.isArray(term.examplesBad)).toBe(true);
      expect(Array.isArray(term.synonyms)).toBe(true);
    });

    it('version is a positive integer', async () => {
      const res = await fetch(`${BASE}/api/terms/${termId}`);
      const term = await res.json();
      expect(typeof term.version).toBe('number');
      expect(term.version).toBeGreaterThanOrEqual(1);
    });

    it('updatedAt is a valid date string', async () => {
      const res = await fetch(`${BASE}/api/terms/${termId}`);
      const term = await res.json();
      const date = new Date(term.updatedAt);
      expect(date.getTime()).not.toBeNaN();
    });
  });

  describe('GET /api/terms/:id/versions — version history', () => {
    it('returns version history array', async () => {
      const termsRes = await fetch(`${BASE}/api/terms`);
      const terms = await termsRes.json();
      termId = terms[0].id;

      const res = await fetch(`${BASE}/api/terms/${termId}/versions`);
      expect(res.status).toBe(200);
      const versions = await res.json();
      expect(Array.isArray(versions)).toBe(true);
    });

    it('each version entry has required fields', async () => {
      const res = await fetch(`${BASE}/api/terms/${termId}/versions`);
      const versions = await res.json();
      if (versions.length === 0) return;

      const v = versions[0];
      expect(v).toHaveProperty('id');
      expect(v).toHaveProperty('termId');
      expect(v).toHaveProperty('versionNumber');
      expect(v).toHaveProperty('changedBy');
      expect(v).toHaveProperty('changedAt');
      expect(v).toHaveProperty('changeNote');
      expect(v).toHaveProperty('snapshotJson');
    });

    it('versions are sorted most recent first (descending)', async () => {
      const res = await fetch(`${BASE}/api/terms/${termId}/versions`);
      const versions = await res.json();
      if (versions.length < 2) return;

      for (let i = 0; i < versions.length - 1; i++) {
        expect(versions[i].versionNumber).toBeGreaterThan(versions[i + 1].versionNumber);
      }
    });

    it('snapshotJson contains term definition snapshot', async () => {
      const res = await fetch(`${BASE}/api/terms/${termId}/versions`);
      const versions = await res.json();
      if (versions.length === 0) return;

      const snapshot = versions[0].snapshotJson;
      expect(snapshot).toBeTruthy();
      expect(typeof snapshot).toBe('object');
      expect(snapshot).toHaveProperty('definition');
    });

    it('most recent version number matches term current version', async () => {
      const termRes = await fetch(`${BASE}/api/terms/${termId}`);
      const term = await termRes.json();

      const versionsRes = await fetch(`${BASE}/api/terms/${termId}/versions`);
      const versions = await versionsRes.json();
      if (versions.length === 0) return;

      expect(versions[0].versionNumber).toBe(term.version);
    });

    it('returns empty array for non-existent term versions', async () => {
      const res = await fetch(`${BASE}/api/terms/00000000-0000-0000-0000-000000000000/versions`);
      expect(res.status).toBe(200);
      const versions = await res.json();
      expect(versions).toEqual([]);
    });
  });

  describe('GET /api/terms/category/:category — terms by category', () => {
    it('returns terms filtered by category', async () => {
      const catsRes = await fetch(`${BASE}/api/categories`);
      const cats = await catsRes.json();
      if (cats.length === 0) return;

      const categoryName = cats[0].name;
      const res = await fetch(`${BASE}/api/terms/category/${encodeURIComponent(categoryName)}`);
      expect(res.status).toBe(200);
      const terms = await res.json();
      expect(Array.isArray(terms)).toBe(true);
      for (const term of terms) {
        expect(term.category).toBe(categoryName);
      }
    });
  });
});
