import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:5000';

describe('Epic 1: Search & Discovery — API Tests', () => {
  describe('GET /api/terms', () => {
    it('returns a list of terms with 200 status', async () => {
      const res = await fetch(`${BASE}/api/terms`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('each term has required fields for TermCard display', async () => {
      const res = await fetch(`${BASE}/api/terms`);
      const data = await res.json();
      const term = data[0];
      expect(term).toHaveProperty('id');
      expect(term).toHaveProperty('name');
      expect(term).toHaveProperty('category');
      expect(term).toHaveProperty('status');
      expect(term).toHaveProperty('definition');
      expect(term).toHaveProperty('version');
      expect(term).toHaveProperty('updatedAt');
    });

    it('term status is one of the valid values', async () => {
      const res = await fetch(`${BASE}/api/terms`);
      const data = await res.json();
      const validStatuses = ['Draft', 'In Review', 'Canonical', 'Deprecated'];
      for (const term of data) {
        expect(validStatuses).toContain(term.status);
      }
    });
  });

  describe('GET /api/terms/search', () => {
    it('returns empty array for queries shorter than 2 chars', async () => {
      const res = await fetch(`${BASE}/api/terms/search?q=a`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual([]);
    });

    it('returns empty array when q is missing', async () => {
      const res = await fetch(`${BASE}/api/terms/search`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual([]);
    });

    it('returns results for a valid query of 2+ chars', async () => {
      const termsRes = await fetch(`${BASE}/api/terms`);
      const terms = await termsRes.json();
      if (terms.length === 0) return;

      const firstTermName = terms[0].name;
      const query = firstTermName.substring(0, 3).toLowerCase();

      const res = await fetch(`${BASE}/api/terms/search?q=${encodeURIComponent(query)}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('search results include required display fields', async () => {
      const termsRes = await fetch(`${BASE}/api/terms`);
      const terms = await termsRes.json();
      if (terms.length === 0) return;

      const query = terms[0].name.substring(0, 3);
      const res = await fetch(`${BASE}/api/terms/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.length === 0) return;

      const result = data[0];
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('definition');
    });

    it('exact name matches rank first (ranked results)', async () => {
      const termsRes = await fetch(`${BASE}/api/terms`);
      const terms = await termsRes.json();
      if (terms.length === 0) return;

      const exactName = terms[0].name;
      const res = await fetch(`${BASE}/api/terms/search?q=${encodeURIComponent(exactName)}`);
      const data = await res.json();

      if (data.length > 0) {
        expect(data[0].name.toLowerCase()).toBe(exactName.toLowerCase());
      }
    });

    it('returns results within acceptable response time (<500ms)', async () => {
      const start = Date.now();
      await fetch(`${BASE}/api/terms/search?q=test`);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(500);
    });

    it('returns empty results for gibberish query', async () => {
      const res = await fetch(`${BASE}/api/terms/search?q=xyzqwfgh123`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data).toEqual([]);
    });
  });

  describe('GET /api/terms/:id (single term for detail)', () => {
    it('returns a single term by valid ID', async () => {
      const termsRes = await fetch(`${BASE}/api/terms`);
      const terms = await termsRes.json();
      if (terms.length === 0) return;

      const id = terms[0].id;
      const res = await fetch(`${BASE}/api/terms/${id}`);
      expect(res.status).toBe(200);
      const term = await res.json();
      expect(term.id).toBe(id);
      expect(term.name).toBe(terms[0].name);
    });

    it('returns 404 for non-existent term ID', async () => {
      const res = await fetch(`${BASE}/api/terms/00000000-0000-0000-0000-000000000000`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('GET /api/categories', () => {
    it('returns a list of categories', async () => {
      const res = await fetch(`${BASE}/api/categories`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });

    it('each category has name and color fields', async () => {
      const res = await fetch(`${BASE}/api/categories`);
      const data = await res.json();
      const cat = data[0];
      expect(cat).toHaveProperty('id');
      expect(cat).toHaveProperty('name');
      expect(cat).toHaveProperty('color');
    });
  });
});
