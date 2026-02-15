# Test Automation Summary

**Generated**: 2026-02-15 (updated from 2026-02-12)
**Framework**: Vitest + Supertest (API) | Playwright (E2E)
**Agent**: Quinn QA (BMAD Automate)

## Generated Tests

### API Tests (Vitest + Supertest)

| File | Description | Tests | Status |
|------|-------------|-------|--------|
| tests/api/terms.test.ts | Terms CRUD, search, versioning, category filter | 11 | Fail* |
| tests/api/categories.test.ts | Categories CRUD, validation | 8 | Fail* |
| tests/api/proposals.test.ts | Proposals CRUD, approve/reject/request-changes/resubmit/withdraw + cleanup | 17 | Fail* |
| tests/api/users.test.ts | Users CRUD, validation | 8 | Fail* |
| tests/api/settings.test.ts | Settings upsert, batch save | 4 | Fail* |
| tests/api/principles.test.ts | Principles CRUD, term linking/unlinking + cleanup | 9 | Fail* |
| **tests/api/story-7-5-rbac.test.ts** | **Role-based access enforcement (AC1-AC5, AC12)** | **32** | **All Pass** |

*Pre-existing test files fail because they were written before Story 7.5 added auth middleware and do not mock authentication. 39 of 57 pre-existing tests fail. These need to be updated to use the mock auth pattern from `story-7-5-rbac.test.ts`.

**New RBAC Tests**: 32/32 passing

### E2E Tests (Playwright)

| Workflow | Description | Status |
|----------|-------------|--------|
| Homepage | Page load, search visibility, navigation, title | Pass |
| Browse Page | Category display, term listing, term links | Pass |
| Term Detail | Term name, definition, "Why This Exists" section | Pass |
| Principles Page | Principle list, titles, summaries | Pass |
| Propose Term | Form fields, submit button, category selector | Pass |
| Review Queue | Proposal list or empty state, status filters | Pass |
| API: GET /api/terms | 200 response, array body, term structure | Pass |
| API: GET /api/categories | 200 response, array body, category structure | Pass |
| API: GET /api/terms/search | 200 response, search functionality | Pass |
| **Unauthenticated sidebar nav (AC7)** | **Sign In visible; Propose/Review/Admin nav hidden in sidebar** | **Pass** |
| **Public page access (AC5)** | **/browse and /principles load without auth** | **Pass** |
| **Admin login + full sidebar (AC6, AC10, AC11)** | **OIDC login → Admin role → all nav sections visible** | **Pass** |

**Total E2E Workflows**: 12 — All passing

## Story 7.5 AC Coverage Matrix

| AC | Description | API Test | E2E Test | Status |
|---|---|---|---|---|
| AC1 | 401 on unauthenticated write ops + "Please sign in" message | Yes (8 tests, response body verified) | — | Covered (API only; UI "Please sign in" message not E2E tested) |
| AC2 | 403 for Member on admin pages + "Permission denied" | Yes (5 tests, response body verified) | — | Covered (API only; UI "Permission denied" page not E2E tested) |
| AC3 | 403 for Member on review endpoints + "Permission denied" | Yes (3 tests, response body verified) | — | Covered (API only; UI "Permission denied" page not E2E tested) |
| AC4 | 403 for Approver on admin actions | Yes (5 tests, response body verified) | — | Covered |
| AC5 | Public read access | Yes (4 tests) | Yes (2 pages) | Fully Covered |
| AC6 | Nav filtered by role | — | Yes (Admin only) | Partially Covered (Member/Approver nav not E2E tested) |
| AC7 | Unauthenticated nav (no propose/review/admin in sidebar) | — | Yes | Covered |
| AC8 | @katgroupinc.com domain restriction | — | — | Not Covered (feature deferred/not implemented) |
| AC9 | Non-domain email rejection | — | — | Not Covered (feature deferred/not implemented) |
| AC10 | First OIDC user gets Admin role | — | Yes | Covered |
| AC11 | User identity display (name + sign out) | — | Yes | Covered |
| AC12 | Proposal submittedBy uses real identity | Yes (1 test) | — | Covered |
| AC13 | Reviewer identity in audit trail | — | — | Not Covered |

## Story 7.5 Endpoint Coverage

| Endpoint | Auth Required | Role Required | Test Coverage |
|---|---|---|---|
| GET /api/terms | No | — | AC5 |
| GET /api/terms/search | No | — | AC5 |
| GET /api/categories | No | — | AC5 |
| GET /api/principles | No | — | AC5 |
| GET /api/proposals | Yes | — | AC1 |
| GET /api/users | Yes | — | AC1 |
| GET /api/settings | Yes | — | AC1 |
| POST /api/terms | Yes | Admin | AC1, AC2, AC4 |
| POST /api/categories | Yes | Admin | AC1, AC2, AC4 |
| POST /api/settings | Yes | Admin | AC1, AC2, AC4 |
| POST /api/users | Yes | Admin | AC2, AC4 |
| POST /api/principles | Yes | Admin | AC1, AC2, AC4 |
| POST /api/proposals | Yes | Member+ | AC1, AC12, positive |
| POST /api/proposals/:id/approve | Yes | Approver+ | AC3, positive |
| POST /api/proposals/:id/reject | Yes | Approver+ | AC3 |
| POST /api/proposals/:id/request-changes | Yes | Approver+ | AC3 |

## Findings

### Bug: Home Page CTA Visible to Unauthenticated Users
- **Location**: `client/src/pages/Home.tsx` line 66, `data-testid="button-propose-term"`
- **Description**: The "Propose New Term" call-to-action button in the Home page "Contribute to the Lexicon" section is visible to unauthenticated users. The sidebar navigation correctly hides the Propose button (AC7 passes), but the CTA in the main content area is not gated by auth state.
- **Impact**: Low — clicking it navigates to `/propose` where API calls would fail (401), but it's misleading UX.
- **Recommendation**: Wrap the CTA section with `useAuth()` and conditionally render based on authentication status.

### Pre-existing Test Failures (39 of 57 tests)
- Older test files (terms, categories, settings, users, principles) fail because they hit protected endpoints without authentication after Story 7.5 added auth middleware.
- **Root cause**: `tests/api/setup.ts` does not inject auth middleware. Tests were passing before Story 7.5.
- **Recommendation**: Update `tests/api/setup.ts` to accept an optional user ID for mock auth, or update each test file individually.

### Gaps Requiring Future Work
- **AC6 partial**: Only Admin navigation tested via E2E. Member and Approver sidebar filtering should also be E2E tested.
- **AC8/AC9 not implemented**: Domain restriction (`@katgroupinc.com`) was deferred during Story 7.5 implementation. Cannot test what doesn't exist.
- **AC13 not covered**: Reviewer identity in audit trail should be tested via API (approve a proposal with mock auth, then check the proposal events for correct actor name).
- **AC1/AC2/AC3 UI messages**: API tests verify "Please sign in" and "Permission denied" in response bodies, but the corresponding UI display of these messages is not E2E tested.

## Test Infrastructure

- **Config**: `vitest.config.ts` — path aliases, test include/exclude patterns
- **Setup**: `tests/api/setup.ts` — reusable Express test app factory with Supertest (no auth)
- **RBAC Pattern**: `tests/api/story-7-5-rbac.test.ts` — mock auth middleware for simulating unauthenticated/Member/Approver/Admin states; creates real DB users for role lookups
- **Run Commands**:
  - RBAC tests only: `npx vitest run tests/api/story-7-5-rbac.test.ts`
  - All tests: `npx vitest run` (note: 39 pre-existing failures due to missing auth)

## Next Steps

1. Fix Home page CTA visibility bug (gate behind auth check)
2. Update pre-existing test files to use mock auth pattern
3. Add E2E tests for Member and Approver role-specific sidebar navigation (AC6)
4. Add API test for AC13 (reviewer identity in audit trail)
5. Add E2E tests for "Permission denied" and "Please sign in" UI messages (AC1-AC3)
6. Implement and test domain restriction (AC8/AC9) when ready

---

**Done!** Tests generated and verified.
