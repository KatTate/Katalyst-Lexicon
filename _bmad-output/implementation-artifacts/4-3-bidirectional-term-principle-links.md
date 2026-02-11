# Story 4.3: Bidirectional Term-Principle Links

Status: review

## Story

As a user viewing a term detail page,
I want to see which principles are connected to this term,
So that I understand the broader organizational context behind the term's definition.

## Acceptance Criteria

**Term → Principles (Populated):**

1. **Given** I am on a term detail page and the term has linked principles, **When** I expand the "Related Principles" Tier 2 section, **Then** I see a list of linked principles with their title, summary preview, and status. Clicking a principle navigates me to that principle's detail page (`/principle/{slug}`).

**Term → Principles (Empty):**

2. **Given** a term has no linked principles, **When** I expand the "Related Principles" Tier 2 section, **Then** I see a brief message: "No principles linked to this term".

**Bidirectional Consistency:**

3. **Given** I link a principle to a term (via admin), **When** I view either the term detail or the principle detail, **Then** the link appears in both directions — the term shows the principle in its "Related Principles" Tier 2 section, and the principle shows the term in its "Related Terms" section.

**data-testid:**

4. **Given** linked principles are displayed in the term detail Tier 2 section, **When** I view each linked principle item, **Then** each has `data-testid="linked-principle-{id}"`.

## Dev Notes

### Architecture Patterns to Follow

- **Brownfield context**: The term detail page's "Related Principles" Tier 2 section was built in Epic 2 (Story 2.1) and already fully implements this story's requirements. Specifically:
  - `TermDetail.tsx` fetches `governingPrinciples` via `api.terms.getPrinciples(id)` which calls `GET /api/terms/:id/principles`
  - The TierSection renders linked principles with title, summary, and status
  - Empty state shows "No principles are linked to this term yet."
  - Each principle card links to `/principle/{slug}`
  - The API endpoint `GET /api/terms/:id/principles` exists and calls `storage.getPrinciplesForTerm()`
  - The principle detail page (`PrincipleDetail.tsx`) already fetches and displays related terms via `GET /api/principles/:id/terms`
- **Bidirectional link mechanism**: The `principleTermLinks` join table already exists with `principleId` and `termId` columns. Both directions are already queried:
  - Term → Principles: `storage.getPrinciplesForTerm(termId)` reads links where `termId` matches, then fetches the corresponding principles
  - Principle → Terms: `storage.getTermsForPrinciple(principleId)` reads links where `principleId` matches, then fetches the corresponding terms
  - Both endpoints exist in `server/routes.ts`: `GET /api/terms/:id/principles` and `GET /api/principles/:id/terms`
- **What this story actually needs to verify/adjust**:
  1. Ensure the `data-testid` convention matches: AC specifies `linked-principle-{id}`, but current implementation uses `link-principle-{id}`. Align if needed.
  2. Ensure the empty state message matches: AC says "No principles linked to this term", current says "No principles are linked to this term yet." — close enough but verify alignment.
  3. Ensure the principle card in TermDetail shows status (it currently shows title and summary but may not show status badge).
  4. E2E test the bidirectional flow: navigate from term → principle → verify linked term shows the original term.

### UI/UX Deliverables

**TermDetail Page (`client/src/pages/TermDetail.tsx`) — Minor Adjustments:**
- Verify `data-testid="linked-principle-{id}"` on each principle card in the Tier 2 section (currently `link-principle-{id}`)
- Add PrincipleStatusBadge to each linked principle card if not already present
- Verify empty state copy alignment

**Verification Only (no changes expected):**
- `PrincipleDetail.tsx` related terms section — already shows linked terms (Story 4.2 will enhance to TermCards)
- `GET /api/terms/:id/principles` endpoint — already functional
- `GET /api/principles/:id/terms` endpoint — already functional
- `principleTermLinks` table — already seeded with test data

### Anti-Patterns & Hard Constraints

- **DO NOT** create a new API endpoint. Both directions are already served by existing endpoints.
- **DO NOT** modify the `principleTermLinks` schema. The join table is already correctly structured.
- **DO NOT** duplicate the bidirectional query logic. Both directions already exist in `storage.ts`.
- **DO NOT** embed linking/unlinking UI in this story. That's an admin feature from Epic 7.

### Gotchas & Integration Warnings

- **This story may require zero or minimal code changes**: Epic 2 (Story 2.1) already built the "Related Principles" Tier 2 section with data fetching, rendering, empty state, and navigation. This story primarily validates that implementation meets the ACs and adds any missing details (status badge, data-testid alignment).
- **Story 4.2 dependency**: Story 4.2 enhances the principle detail page to show related terms as TermCards. Story 4.3's bidirectional verification depends on 4.2 completing the principle → term direction enhancement. However, the current PrincipleDetail.tsx already shows related terms (as tag links), so basic bidirectional verification works even before 4.2.
- **data-testid mismatch**: Current TermDetail.tsx uses `link-principle-{id}` but the AC specifies `linked-principle-{id}`. This is a minor rename.
- **Seed data**: The database seeding script should include at least one principle linked to at least one term via the `principleTermLinks` table. Verify seed data exists for E2E testing.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/TermDetail.tsx` | MODIFY (minor) | Align data-testid naming, add status badge to principle cards if missing |

### Dependencies & Environment Variables

**No new packages needed.**

**No environment variables needed.**

**Story dependencies:** Stories 4.1 and 4.2 should be implemented first (4.2 enhances the principle → term direction). However, this story can be implemented independently since the term → principle direction was already built in Epic 2.

### References

- Epic 4 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 4, Story 4.3
- Term detail "Related Principles" section: `client/src/pages/TermDetail.tsx` (built in Epic 2, Story 2.1)
- Principle detail "Related Terms" section: `client/src/pages/PrincipleDetail.tsx`
- Bidirectional API endpoints: `server/routes.ts` → `GET /api/terms/:id/principles`, `GET /api/principles/:id/terms`
- Storage methods: `server/storage.ts` → `getPrinciplesForTerm()`, `getTermsForPrinciple()`
- Join table schema: `shared/schema.ts` → `principleTermLinks`
- Scratchpad note: "Story 4.3 (bidirectional links) depends on Epic 2 Story 2.1 completing the term detail Tier 2 'Related Principles' section shell (now complete)"

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (via Replit Agent)

### Completion Notes
Most of Story 4.3's ACs were already satisfied by Story 4.0 foundation work (PrincipleCard inline variant with PrincipleStatusBadge, correct data-testid="linked-principle-{id}") and prior Epic 2 implementation (Related Principles Tier 2 section in TermDetail, bidirectional API endpoints). Remaining gap addressed:
- Aligned empty state message to match AC exactly: "No principles linked to this term" (was "No principles are linked to this term yet.")
- Added data-testid="text-empty-principles" to the empty state element

### LSP Status
Clean — no errors or warnings

### Visual Verification
Pending e2e test

### File List
- `client/src/pages/TermDetail.tsx` — MODIFIED (empty state message alignment + data-testid)
