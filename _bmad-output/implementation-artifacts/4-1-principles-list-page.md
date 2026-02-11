# Story 4.1: Principles List Page

Status: done

## Story

As a user exploring organizational thinking,
I want to browse a list of all principles,
So that I can discover the philosophies behind the organization's vocabulary.

## Acceptance Criteria

**Card Content:**

1. **Given** I navigate to the principles page, **When** the page loads, **Then** I see a list of all principles displayed as cards. Each card shows: principle title, status badge, summary preview (2-line truncation), tag list, and linked term count (e.g., "5 related terms").

**Status Badges:**

2. **Given** principles exist with different statuses, **When** I view the list, **Then** I see status badges on each card (Published, Draft, Archived) consistent with the term status badge pattern (Published = green, Draft = gray, Archived = muted).

**Empty State:**

3. **Given** no principles exist yet, **When** I view the principles list page, **Then** I see an empty state: "Principles will appear here once they're published". The message does not include a "Create" CTA (since most users cannot create principles).

**Navigation:**

4. **Given** I click on a principle card, **When** I click, **Then** I navigate to that principle's detail page (`/principle/{slug}`).

**Accessibility:**

5. **Given** I am using a screen reader, **When** I navigate the principles list, **Then** the page has proper heading hierarchy (h1 for page title, h3 for card titles) and each card is announced with title and linked term count.

**Page Title:**

6. **Given** I navigate to the principles page, **When** the page loads, **Then** the browser tab title is "Principles — Katalyst Lexicon".

## Dev Notes

### Architecture Patterns to Follow

- **Brownfield context**: The principles list page already exists at `client/src/pages/BrowsePrinciples.tsx`. It renders a card grid with title, status badge, summary (2-line clamp), tags, and owner. This story enhances it with: linked term count per card, improved empty state copy, and page title update. It does NOT require a full rewrite — it's an enhancement.
- **Linked term count**: The current `GET /api/principles` endpoint returns principle objects without linked term count. Two options:
  1. **Preferred**: Add a `linkedTermCount` virtual field to the API response by joining `principleTermLinks` and counting per principle in `storage.getPrinciples()`. This avoids N+1 queries on the client.
  2. **Alternative**: Fetch `GET /api/principles/:id/terms` per principle on the client and count — but this is N+1 and should be avoided.
- **PrincipleStatusBadge**: Already exists inline in `BrowsePrinciples.tsx` (and duplicated in `PrincipleDetail.tsx`). Consider extracting to a shared component (e.g., `client/src/components/PrincipleStatusBadge.tsx`) to follow DRY and the variant pattern from Lesson 2 (Epic 1 retro). However, this is optional cleanup — the story ACs don't require it.
- **Card variant pattern**: Epic 1 retro Lesson 2 recommends building PrincipleCard with a variant pattern from day one. If the card content is reusable elsewhere (e.g., in the Term Detail "Related Principles" section), extract a `PrincipleCard` component. Currently, the card markup is inline in `BrowsePrinciples.tsx`.
- **Page title**: Use `useEffect` to set `document.title = "Principles — Katalyst Lexicon"` on mount, and reset on unmount.

### UI/UX Deliverables

**BrowsePrinciples Page (`client/src/pages/BrowsePrinciples.tsx`) — Enhancement:**
- Add linked term count to each card (e.g., "5 related terms" or "No linked terms")
- Update empty state copy to: "Principles will appear here once they're published" (currently says "No principles found yet.")
- Remove "Create" CTA from empty state (none exists currently — verify this remains true)
- Add page title: "Principles — Katalyst Lexicon"
- Ensure heading hierarchy: h1 for "Principles" page title, h3 for card titles (already correct)

**Optional: Extract PrincipleCard component:**
- If extracted, the card should accept a `principle` prop and optional `linkedTermCount`
- `data-testid="principle-card-{id}"` on each card (currently uses `card-principle-{id}` — align naming)

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate API endpoint for linked term counts. Enhance the existing `GET /api/principles` response or `storage.getPrinciples()` to include count data.
- **DO NOT** add a "Create Principle" button to the principles list page. Most users cannot create principles (admin-only feature from Epic 7).
- **DO NOT** use N+1 queries to fetch term counts per principle on the client. The count should come from the API or be computed from a single batch query.
- **DO NOT** duplicate the PrincipleStatusBadge — if refactoring, extract it. If not refactoring, accept the duplication for now (it's in two files).

### Gotchas & Integration Warnings

- **`GET /api/principles` does not include linked term count**: The current storage layer's `getPrinciples()` does a simple `select().from(principles)`. To include `linkedTermCount`, you need to either:
  - Add a LEFT JOIN + GROUP BY + COUNT on `principleTermLinks` in `getPrinciples()`, or
  - Fetch all `principleTermLinks` separately and merge counts client-side (simpler but less elegant).
  - The Drizzle ORM approach: use a subquery or `sql<number>\`(SELECT COUNT(*) FROM principle_term_links WHERE principle_id = principles.id)\`` as an extra column.
- **Empty state currently says "No principles found yet."**: This needs to be updated to the AC's prescribed copy: "Principles will appear here once they're published".
- **data-testid naming**: Current cards use `card-principle-{id}`. The epic specifies `principle-card-{id}`. Align to whichever convention the rest of the codebase uses (check TermCard: it uses `card-term-{id}`). Stick with `card-principle-{id}` for consistency.
- **Principle status values differ from term statuses**: Principles use "Published", "Draft", "Archived" while terms use "Canonical", "Draft", "In Review", "Deprecated". The StatusBadge component from terms should NOT be reused directly — PrincipleStatusBadge is a separate component with different status options.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/BrowsePrinciples.tsx` | MODIFY | Add linked term count, update empty state, add page title |
| `server/storage.ts` | MODIFY | Enhance `getPrinciples()` to include linked term count |
| `server/routes.ts` | MODIFY (minor) | Ensure response includes new field if storage layer changes shape |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-query` — server state management
- `wouter` — routing
- `lucide-react` — icons
- All shadcn/ui components

**No new packages needed.**

**No environment variables needed.**

### References

- Epic 4 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 4, Story 4.1
- Existing principles list page: `client/src/pages/BrowsePrinciples.tsx`
- Existing principle API: `server/routes.ts` → `GET /api/principles`
- Existing storage: `server/storage.ts` → `getPrinciples()`
- Schema: `shared/schema.ts` → `principles`, `principleTermLinks`
- Epic 1 retro Lesson 2 (variant pattern): `_bmad-output/implementation-artifacts/epic-1-retro-2026-02-10.md`

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (via Replit Agent)

### Completion Notes
Most of Story 4.1's ACs were already satisfied by Story 4.0 foundation work (PrincipleCard, PrincipleStatusBadge, linkedTermCount API enrichment, EmptyState component). Remaining gaps addressed:
- Updated empty state message from "No principles found yet." to "Principles will appear here once they're published" (AC3)
- Added `document.title = "Principles — Katalyst Lexicon"` with cleanup on unmount (AC6)

### LSP Status
Clean — no errors or warnings

### Visual Verification
Pending e2e test

### File List
- `client/src/pages/BrowsePrinciples.tsx` — MODIFIED (added useEffect for page title, updated empty state message)
