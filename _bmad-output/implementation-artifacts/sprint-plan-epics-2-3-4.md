# Sprint Plan: Epics 2, 3, 4

Generated: 2026-02-11
Input: gap-analysis-epics-2-3-4.md, epic-1-retro-2026-02-10.md
Status: Ready for execution

---

## Planning Principles Applied

1. **Smallest-gap-first**: Epic 4 has the least NEW work → ship early wins
2. **File-batching**: Stories touching the same file go in the same sprint (TermDetail.tsx = 4.3 + 2.1 + 2.2)
3. **Dependency ordering**: 3.2 depends on 3.1; shared components before consumers
4. **Retro lessons carried forward**: Variant pattern (Lesson 2), search hook extraction queued (Lesson 3), findings carry-forward (Lesson 5)
5. **Foundation-then-features**: API enrichment + dependency installation done before UI stories

---

## Sprint 1: Shared Foundation + Epic 4 + Epic 2

**Goal:** Ship all of Epic 4 (Principles) and Epic 2 (Term Detail) — the two epics closest to done. Batch all TermDetail.tsx work together.

### Phase A — Foundation Tasks (do first, unblocks everything)

| # | Task | Type | Unblocks | Est. |
|---|------|------|----------|------|
| F1 | Install `react-markdown` + `rehype-sanitize` npm packages | Dependency | Story 4.2 | 5 min |
| F2 | Extract `PrincipleStatusBadge` to `client/src/components/PrincipleStatusBadge.tsx` from duplicated code in BrowsePrinciples.tsx and PrincipleDetail.tsx | Refactor | Stories 4.1, 4.2, 4.3 | 15 min |
| F3 | Create `PrincipleCard` component at `client/src/components/PrincipleCard.tsx` with `variant="card"` (list page) and `variant="inline"` (embedded) — apply Retro Lesson 2 | New Component | Stories 4.1, 4.2, 4.3 | 30 min |
| F4 | API: Add `linkedTermCount` to `GET /api/principles` response — modify `storage.getPrinciples()` to LEFT JOIN on `principleTermLinks` and COUNT per principle | Backend | Story 4.1 | 30 min |

### Phase B — Epic 4 Stories (smallest gaps)

| # | Story | Gap Summary | Key Changes | Est. |
|---|-------|-------------|-------------|------|
| S1 | **4.3: Bidirectional Term-Principle Links** | 2 MET, 2 PARTIAL | Fix `data-testid` from `link-principle-{id}` → `linked-principle-{id}`. Add `PrincipleStatusBadge` to linked principle cards in TermDetail.tsx Tier 2 section. | 45 min |
| S2 | **4.1: Principles List Page** | 3 MET, 3 PARTIAL, 1 NEW | Integrate `PrincipleCard` + `linkedTermCount` into BrowsePrinciples.tsx. Update empty state to "Principles will appear here once they're published". Add `document.title` update. | 1.5 hr |
| S3 | **4.2: Principle Detail Page** | 2 MET, 5 PARTIAL, 1 NEW | Replace custom `renderMarkdown()` with `react-markdown` + `rehype-sanitize`. Show "Related Terms" section always (with empty state when no linked terms). Use TermCard components instead of tag-style links. Fix heading hierarchy (h3 → h2). Add `document.title`. Add missing `data-testid` attrs. | 2.5 hr |

### Phase C — Epic 2 Stories (batched with 4.3 on TermDetail.tsx)

| # | Story | Gap Summary | Key Changes | Est. |
|---|-------|-------------|-------------|------|
| S4 | **2.1: Term Detail Page Two-Tier** | 7 MET, 4 PARTIAL | Fix heading hierarchy inside TierSection (use semantic h2 for section titles). Align `data-testid` naming to AC spec. Accept deprecated banner limitation (no `replacedByTermId` in schema — document as known limitation, defer to future story). | 1.5 hr |
| S5 | **2.2: Version History** | 5 MET, 2 PARTIAL | Add "v1 — Original" label for version 1 entries. Verify snapshot dialog fully renders `snapshotJson` data (complete the snapshot view if incomplete). | 1 hr |

**Sprint 1 Total: ~8 hours**
**Deliverable: Epics 2 and 4 fully complete (5 stories, 7 ACs from PARTIAL→MET, 2 ACs from NEW→MET)**

---

## Sprint 2: Epic 3 — Browse & Discover

**Goal:** Ship Epic 3 — the largest piece of new work. Story 3.1 is a major restructure; Story 3.2 builds on top of it.

### Phase A — Story 3.1: Browse Page Restructure [Size: L]

| # | Task | Type | Details | Est. |
|---|------|------|---------|------|
| T1 | Restructure Browse.tsx from flat grid → grouped-by-category sections | Major Refactor | Each category gets: section anchor (`id="category-{name}"`), h2 heading, color-accent left border (from `category.color`), term count badge, TermCard grid within section. | 2 hr |
| T2 | Sidebar: scroll-to-anchor behavior | Change | Replace URL-based category filter with smooth-scroll to in-page anchors. Add `scroll-margin-top` offset for fixed header. Highlight active category in sidebar based on scroll position (IntersectionObserver). | 1.5 hr |
| T3 | Sidebar responsive breakpoint | Fix | Move sidebar visibility from `md:` (768px) to `lg:` (1024px+). Sidebar hidden on tablet+mobile. | 15 min |
| T4 | Mobile "Jump to category" dropdown | New | Add Select/dropdown at top of page on mobile (`< 768px`) that scrolls to selected category section. | 45 min |
| T5 | Category empty states | New | Empty category section: "No terms in this category yet" + "Propose a term" button linking to `/propose?category={categoryName}`. When filters active (3.2): hide empty category sections entirely. | 30 min |
| T6 | Accessibility: `nav` + `aria-label` + heading hierarchy | Fix | Wrap sidebar in `<nav aria-label="Categories">`. Category names as h2. | 15 min |
| T7 | Page title: "Browse — Katalyst Lexicon" | New | `document.title` update in `useEffect`. | 5 min |
| T8 | `data-testid` alignment | Fix | Add test IDs: sidebar container, each category link, each category section, jump-to dropdown, empty state CTAs. | 15 min |

**Story 3.1 Est: ~5.5 hours**

### Phase B — Story 3.2: Filter Terms by Status and Visibility [Size: M]

| # | Task | Type | Details | Est. |
|---|------|------|---------|------|
| T9 | Filter bar component | New | Horizontal bar above category sections. Multi-select status toggles (Canonical, Draft, In Review, Deprecated) + single-select visibility dropdown (All, Internal, Client-Safe, Public). | 2 hr |
| T10 | Mobile filter layout | New | Collapsible "Filters" section on mobile (`< 768px`). Badge shows active filter count when collapsed (e.g., "Filters (2)"). | 45 min |
| T11 | Client-side filter logic | New | Filter the terms array: status filter = OR within selected statuses, visibility filter = exact match. Combined = AND. Category counts update to reflect filtered results. Empty categories hidden when filters active. | 1 hr |
| T12 | URL param sync | New | Bidirectional: filter state → URL params (`?status=canonical,in-review&visibility=client-safe`), URL params → filter state on page load. Use wouter `useSearch` + `useLocation`. | 1 hr |
| T13 | "Clear filters" button + empty state | New | Clear-filters resets all filters and URL params. Global empty state: "No terms match these filters" with prominent clear button. | 30 min |
| T14 | `data-testid` on filter elements | New | Test IDs: each filter option, clear-filters button, filter container, active-filter-count badge. | 15 min |

**Story 3.2 Est: ~5.5 hours**

**Sprint 2 Total: ~11 hours**
**Deliverable: Epic 3 fully complete (2 stories, ~14 ACs from NEW→MET, ~6 ACs from PARTIAL→MET)**

---

## Summary

| Sprint | Epics | Stories | Key Risk | Est. Hours |
|--------|-------|---------|----------|------------|
| Sprint 1 | 4 + 2 | 4.3, 4.1, 4.2, 2.1, 2.2 | Low — brownfield enhancements, no new architecture | ~8 hr |
| Sprint 2 | 3 | 3.1, 3.2 | Medium — 3.1 is a major page restructure | ~11 hr |
| **Total** | **3 epics** | **7 stories** | | **~19 hr** |

---

## Known Limitations & Deferrals

| Item | Story | Decision | Rationale |
|------|-------|----------|-----------|
| Deprecated term replacement link | 2.1, AC 9 | Defer | Schema has no `replacedByTermId` field. Adding requires migration + admin UI for linking. Separate story. |
| "Suggest an edit" navigates to /propose page vs. inline dialog | 2.1, AC 10 | Accept current | Inline dialog provides equivalent UX and was intentionally built. Story 5.2 covers the full proposal form navigation. The dialog approach is arguably better UX (no page navigation). |
| `useSearch()` hook extraction | Retro Lesson 3 | Queue for pre-Epic 5 | Not blocking for Epics 2-4. Required before Epic 5 duplicate detection. |
| EmptyState formal component | Cross-cutting | Inline per story | Each story standardizes its own empty state copy. Formal component extraction is a Nice-to-Have unless pattern debt emerges. |

---

## Definition of Done (per story)

1. All ACs verified as MET (upgraded from PARTIAL/NEW)
2. All `data-testid` attributes aligned to AC spec
3. `document.title` updates on all pages
4. No LSP errors
5. Playwright e2e test pass at desktop viewport
6. sprint-status.yaml updated to reflect story completion
