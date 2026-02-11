# Story 4.0: Sprint 1 Foundation — Shared Components and API Enrichment

Status: review

## Story

As a developer preparing to implement Epic 4 and Epic 2 stories,
I want shared components extracted, dependencies installed, and API responses enriched,
So that all subsequent stories in Sprint 1 can build on a stable, DRY foundation without mid-sprint refactoring.

## Acceptance Criteria

**F1 — Markdown Rendering Dependencies:**

1. **Given** the packages `react-markdown` and `rehype-sanitize` are installed, **When** I import them in a component, **Then** they resolve without errors and are available for use in Story 4.2.

**F2 — PrincipleStatusBadge Extraction:**

2. **Given** `PrincipleStatusBadge` is duplicated inline in `BrowsePrinciples.tsx` (line 9-21) and `PrincipleDetail.tsx` (line 12-24), **When** I extract it to `client/src/components/PrincipleStatusBadge.tsx`, **Then** both pages import and render the shared component identically to before.

3. **Given** the extracted `PrincipleStatusBadge`, **When** I view principles with statuses Published, Draft, and Archived, **Then** each renders with the same colors and styling as the current inline version: Published = green (`bg-primary/10 text-primary`), Draft = yellow (`bg-kat-warning/20 text-yellow-800`), Archived = muted (`bg-muted text-muted-foreground`).

**F3 — PrincipleCard Component:**

4. **Given** I use `PrincipleCard` with `variant="card"`, **When** I render it on the principles list page, **Then** it displays: title (h3), status badge, summary (2-line truncation), tags (up to 4 + overflow count), and linked term count. The entire card is wrapped in a clickable `Link` to `/principle/{slug}`.

5. **Given** I use `PrincipleCard` with `variant="inline"`, **When** I render it inside a TermDetail Tier 2 section, **Then** it displays: title, summary, and status badge in a compact layout. It does NOT wrap content in a `Link` — the parent context provides navigation. `data-testid="linked-principle-{id}"`.

**F4 — linkedTermCount API Enrichment:**

6. **Given** principles exist with linked terms, **When** I call `GET /api/principles`, **Then** each principle in the response includes a `linkedTermCount` field with the correct count of linked terms.

7. **Given** a principle has no linked terms, **When** I call `GET /api/principles`, **Then** that principle's `linkedTermCount` is `0` (not null or undefined).

**F5 — EmptyState Component:**

8. **Given** I use the `EmptyState` component with `message="No items found"`, **When** it renders, **Then** I see the message centered in muted text within a padded container.

9. **Given** I use `EmptyState` with `actionLabel="Do something"` and `actionHref="/somewhere"`, **When** it renders, **Then** I see a link/button below the message with the provided label, navigating to the provided href.

## Dev Notes

### Architecture Patterns to Follow

- **TermCard as reference pattern**: The existing `TermCard` at `client/src/components/TermCard.tsx` establishes the variant pattern: `variant="card"` (full card for list pages) and `variant="inline"` (compact for embedded contexts like search results). PrincipleCard should follow the same structure:
  - Separate `PrincipleCardContent` (pure rendering) from the outer `PrincipleCard` (wraps with Link for card variant)
  - Card variant: `Link` wraps the entire card → clickable to `/principle/{slug}`
  - Inline variant: No Link wrapper → parent provides navigation context
- **StatusBadge as reference**: `PrincipleStatusBadge` follows the same shape as `StatusBadge` but with different status values (Published/Draft/Archived vs Canonical/Draft/In Review/Deprecated). Keep them as separate components — they serve different domain models.
- **Drizzle ORM pattern for linkedTermCount**: Use a SQL subquery for the count rather than a JS-side JOIN+GROUP:
  ```ts
  sql<number>`COALESCE((SELECT COUNT(*) FROM principle_term_links WHERE principle_id = ${principles.id}), 0)`
  ```
  This adds the count as an extra column without changing the query shape.
- **IStorage interface**: The `getPrinciples()` return type currently returns `Principle[]`. The `linkedTermCount` is a computed virtual field — return it alongside the principle data by extending the return type or using a mapped response in the route handler.

### UI/UX Deliverables

**PrincipleStatusBadge (`client/src/components/PrincipleStatusBadge.tsx`):**
- Extracted from inline implementations in BrowsePrinciples.tsx and PrincipleDetail.tsx
- Props: `status: "Published" | "Draft" | "Archived"`, optional `className`
- Uses `Badge variant="outline"` from shadcn/ui with status-specific color classes

**PrincipleCard (`client/src/components/PrincipleCard.tsx`):**
- Props: `principle: Principle`, `linkedTermCount?: number`, `variant?: "card" | "inline"`
- Card variant: Full card with border, hover effects, padding, Link wrapper
- Inline variant: Compact display, no Link wrapper, `data-testid="linked-principle-{id}"`
- Both variants show: PrincipleStatusBadge, title, summary
- Card variant additionally shows: tags (up to 4 + overflow), linked term count

**EmptyState (`client/src/components/EmptyState.tsx`):**
- Props: `message: string`, `actionLabel?: string`, `actionHref?: string`, optional `className`, optional `data-testid`
- Renders: centered muted message text, optional Link/button below
- Uses wouter `Link` for navigation if `actionHref` provided

### Anti-Patterns & Hard Constraints

- **DO NOT** nest `<a>` inside `<a>`. The PrincipleCard `variant="inline"` must NOT wrap in a Link. The TermDetail.tsx Tier 2 section already wraps linked principle items in a Link — double-wrapping creates invalid HTML and broken click targets.
- **DO NOT** change the `IStorage.getPrinciples()` return type signature. Instead, handle the `linkedTermCount` enrichment in the route handler or by extending the response mapping.
- **DO NOT** create N+1 queries. The linkedTermCount MUST be computed in a single query (subquery or JOIN), not by fetching links per principle.
- **DO NOT** reinstall existing packages. `@tanstack/react-query`, `wouter`, `lucide-react`, all shadcn/ui components are already installed.

### Gotchas & Integration Warnings

- **PrincipleStatusBadge duplication**: After extracting, remember to remove the inline `PrincipleStatusBadge` function from BOTH `BrowsePrinciples.tsx` (lines 9-21) AND `PrincipleDetail.tsx` (lines 12-24). Forgetting one creates a shadow definition.
- **Drizzle SQL subquery typing**: The `sql<number>` template tag in Drizzle returns the count as a number. However, PostgreSQL may return it as a string — use `Number()` coercion or `COALESCE(..., 0)::int` cast.
- **PrincipleCard data-testid convention**: The list page currently uses `card-principle-{id}`. The TermCard uses `card-term-{id}`. Keep `card-principle-{id}` for the card variant. For inline variant, use `linked-principle-{id}` per Story 4.3 AC.
- **EmptyState is intentionally lightweight**: It's a thin wrapper, not a complex component. Keep it under 30 lines. Don't add icons, illustrations, or animation — just text + optional action link.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/PrincipleStatusBadge.tsx` | CREATE | Extract from BrowsePrinciples.tsx + PrincipleDetail.tsx |
| `client/src/components/PrincipleCard.tsx` | CREATE | Card + inline variants, follows TermCard pattern |
| `client/src/components/EmptyState.tsx` | CREATE | Lightweight message + optional action link |
| `client/src/pages/BrowsePrinciples.tsx` | MODIFY | Remove inline PrincipleStatusBadge, import shared version |
| `client/src/pages/PrincipleDetail.tsx` | MODIFY | Remove inline PrincipleStatusBadge + renderMarkdown, import shared version |
| `server/storage.ts` | MODIFY | Add linkedTermCount subquery to getPrinciples() |
| `server/routes.ts` | MODIFY | Ensure GET /api/principles returns linkedTermCount in response |

### Dependencies & Environment Variables

**Packages to install:**
- `react-markdown` — markdown rendering (replaces custom renderMarkdown in Story 4.2)
- `rehype-sanitize` — XSS sanitization for markdown HTML output

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-query`, `wouter`, `lucide-react`, `drizzle-orm`, `drizzle-zod`, `zod`
- All shadcn/ui components (`@/components/ui/*`)

**No environment variables needed.**

### References

- TermCard variant pattern: `client/src/components/TermCard.tsx` — lines 24-28 (interface), lines 30-100 (content + wrapper)
- StatusBadge pattern: `client/src/components/StatusBadge.tsx` — entire file
- Current inline PrincipleStatusBadge: `client/src/pages/BrowsePrinciples.tsx` lines 9-21
- Current inline PrincipleStatusBadge (duplicate): `client/src/pages/PrincipleDetail.tsx` lines 12-24
- Storage interface: `server/storage.ts` lines 52-57 (principle methods)
- Schema: `shared/schema.ts` — `principles` table, `principleTermLinks` table
- Sprint plan Phase A: `_bmad-output/implementation-artifacts/sprint-plan-epics-2-3-4.md` → F1-F5
- Party Mode finding #5 (no nested Links): sprint plan findings log
- Party Mode finding #6 (COALESCE for null counts): sprint plan findings log

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (via Replit Agent)

### Completion Notes
Implemented all 5 features (F1-F5) for Sprint 1 Foundation:
- F1: Installed react-markdown and rehype-sanitize packages
- F2: Extracted PrincipleStatusBadge to shared component, removed inline duplicates from BrowsePrinciples.tsx and PrincipleDetail.tsx
- F3: Created PrincipleCard with card/inline variants following TermCard pattern. Card variant wraps in Link, inline does not. Integrated inline variant into TermDetail Tier 2 Related Principles section.
- F4: Enriched GET /api/principles with linkedTermCount via SQL subquery (COALESCE + ::int cast). Bypasses IStorage to avoid changing the interface, uses db directly in route handler.
- F5: Created lightweight EmptyState component (under 30 lines) with message + optional action link. Used in BrowsePrinciples empty state.

### LSP Status
Clean — no errors or warnings

### Visual Verification
UI verified via Playwright e2e testing

### File List
- `client/src/components/PrincipleStatusBadge.tsx` — CREATED
- `client/src/components/PrincipleCard.tsx` — CREATED
- `client/src/components/EmptyState.tsx` — CREATED
- `client/src/pages/BrowsePrinciples.tsx` — MODIFIED (removed inline badge, uses PrincipleCard + EmptyState)
- `client/src/pages/PrincipleDetail.tsx` — MODIFIED (removed inline badge, imports shared PrincipleStatusBadge)
- `client/src/pages/TermDetail.tsx` — MODIFIED (uses PrincipleCard inline variant in Related Principles Tier 2)
- `server/routes.ts` — MODIFIED (enriched GET /api/principles with linkedTermCount subquery)
- `_bmad-output/implementation-artifacts/4-0-sprint-1-foundation.md` — MODIFIED (status updates)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED (status updates)
