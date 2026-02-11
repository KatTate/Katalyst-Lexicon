# Sprint Plan: Epics 2, 3, 4

Generated: 2026-02-11
Input: gap-analysis-epics-2-3-4.md, epic-1-retro-2026-02-10.md
Reviewed: Party Mode review 2026-02-11 (12 findings incorporated)
Status: Ready for execution

---

## Planning Principles Applied

1. **Smallest-gap-first**: Epic 4 has the least NEW work → ship early wins
2. **File-batching**: Stories touching the same file go in the same sprint (TermDetail.tsx = 4.3 + 2.1 + 2.2)
3. **Dependency ordering**: 3.2 depends on 3.1; shared components before consumers
4. **Retro lessons carried forward**: Variant pattern (Lesson 2), search hook extraction queued (Lesson 3), findings carry-forward (Lesson 5)
5. **Foundation-then-features**: API enrichment + dependency installation done before UI stories
6. **Shared-component validation**: Run shared components through their first consumer before wider use (Finding #1)

---

## Sprint 1: Shared Foundation + Epic 4 + Epic 2

**Goal:** Ship all of Epic 4 (Principles) and Epic 2 (Term Detail) — the two epics closest to done. Batch all TermDetail.tsx work together.

### Phase A — Foundation Tasks (do first, unblocks everything)

| # | Task | Type | Unblocks | Est. |
|---|------|------|----------|------|
| F1 | Install `react-markdown` + `rehype-sanitize` npm packages | Dependency | Story 4.2 | 5 min |
| F2 | Extract `PrincipleStatusBadge` to `client/src/components/PrincipleStatusBadge.tsx` from duplicated code in BrowsePrinciples.tsx and PrincipleDetail.tsx | Refactor | Stories 4.1, 4.2, 4.3 | 15 min |
| F3 | Create `PrincipleCard` component at `client/src/components/PrincipleCard.tsx` with `variant="card"` (list page) and `variant="inline"` (embedded) — apply Retro Lesson 2. **Note:** `variant="inline"` must NOT wrap children in a `Link` — the parent context already provides the link wrapper. Double `<a>` nesting = invalid HTML. (Finding #5) | New Component | Stories 4.1, 4.2, 4.3 | 30 min |
| F4 | API: Add `linkedTermCount` to `GET /api/principles` response — modify `storage.getPrinciples()` to LEFT JOIN on `principleTermLinks` and COUNT per principle. Use `COALESCE(COUNT(...), 0)` to prevent null counts on principles with no links. (Finding #6) | Backend | Story 4.1 | 30 min |
| F5 | Create lightweight `EmptyState` component at `client/src/components/EmptyState.tsx` with props: `message`, `actionLabel?`, `actionHref?`. Prevents 4-page inconsistency across stories. (Finding #2) | New Component | Stories 4.1, 4.2, 3.1 | 15 min |

### Phase B — Epic 4 Stories (smallest gaps)

**Story order: 4.1 → 4.3 → 4.2** (reordered per Finding #1 — validate PrincipleCard + linkedTermCount in 4.1 before wider use)

| # | Story | Gap Summary | Key Changes | Est. |
|---|-------|-------------|-------------|------|
| S1 | **4.1: Principles List Page** | 3 MET, 3 PARTIAL, 1 NEW | Integrate `PrincipleCard` + `linkedTermCount` into BrowsePrinciples.tsx. Use `EmptyState` with message "Principles will appear here once they're published" (no Create CTA). Add `document.title` update. | 1.5 hr |
| S2 | **4.3: Bidirectional Term-Principle Links** | 2 MET, 2 PARTIAL | Fix `data-testid` from `link-principle-{id}` → `linked-principle-{id}`. Add `PrincipleStatusBadge` to linked principle cards in TermDetail.tsx Tier 2 section using `PrincipleCard variant="inline"`. | 45 min |
| S3 | **4.2: Principle Detail Page** | 2 MET, 5 PARTIAL, 1 NEW | Replace custom `renderMarkdown()` with `react-markdown` + `rehype-sanitize`. Show "Related Terms" section always (with `EmptyState` when no linked terms: "No terms linked to this principle yet"). Use TermCard components instead of tag-style links. Fix heading hierarchy (h3 → h2). Add `document.title`. Add missing `data-testid` attrs. | 2.5 hr |

### Phase C — Epic 2 Stories (batched with 4.3 on TermDetail.tsx)

**QA note (Finding from Bob):** Stories 4.3, 2.1, and 2.2 all modify TermDetail.tsx. QA should test all three stories' ACs against the final TermDetail.tsx state holistically, not individually.

| # | Story | Gap Summary | Key Changes | Est. |
|---|-------|-------------|-------------|------|
| S4 | **2.1: Term Detail Page Two-Tier** | 7 MET, 4 PARTIAL | Fix heading hierarchy inside TierSection — use `<h2><button aria-expanded>Title</button></h2>` pattern per WAI-ARIA accordion spec (Finding #8 from Amelia). Align `data-testid` naming to AC spec. Accept deprecated banner limitation (no `replacedByTermId` in schema — document as known limitation, defer to future story). | 1.5 hr |
| S5 | **2.2: Version History** | 5 MET, 2 PARTIAL | Add "v1 — Original" label for version 1 entries. Verify snapshot dialog fully renders `snapshotJson` data — **confirm dialog exists in truncated code; if missing, this is a NEW task, not PARTIAL** (Finding #10). | 1 hr |

**Sprint 1 Total: ~8.5 hours implementation + ~1.5 hours QA buffer = ~10 hours realistic**
**Deliverable: Epics 2 and 4 fully complete (5 stories, 7 ACs from PARTIAL→MET, 2 ACs from NEW→MET)**

---

## Sprint 2: Epic 3 — Browse & Discover

**Goal:** Ship Epic 3 — the largest piece of new work. Story 3.1 is a major restructure; Story 3.2 builds on top of it.

**Pre-sprint decision required (Finding #9):** Decide the filter UI pattern for Story 3.2 before Sprint 2 starts:
- **Desktop:** Toggle pill buttons (recommended — discoverable, visual)
- **Mobile:** Multi-select dropdown (recommended — compact, touch-friendly)
- Finalize this during Sprint 1 review to avoid mid-sprint UX rework.

### Phase A — Story 3.1: Browse Page Restructure [Size: L]

| # | Task | Type | Details | Est. |
|---|------|------|---------|------|
| T1 | Restructure Browse.tsx from flat grid → grouped-by-category sections | Major Refactor | Each category gets: section anchor (`id="category-{name}"`), h2 heading, color-accent left border (from `category.color`), term count badge, TermCard grid within section. | 2 hr |
| T2 | Sidebar: scroll-to-anchor behavior | Change | Replace URL-based category filter with smooth-scroll to in-page anchors. Add `scroll-margin-top` offset for fixed header using CSS custom property `var(--header-offset)` so Story 3.2's filter bar can adjust it without touching 3.1's code (Finding #4). Highlight active category in sidebar based on scroll position (IntersectionObserver). **Note:** IntersectionObserver threshold tuning + bidirectional sync is complex — budget accordingly (Finding #3). | 2.5 hr |
| T3 | Sidebar responsive breakpoint | Fix | Move sidebar visibility from `md:` (768px) to `lg:` (1024px+). Sidebar hidden on tablet+mobile. | 15 min |
| T4 | Mobile "Jump to category" dropdown | New | Add Select/dropdown at top of page on mobile (`< 768px`) that scrolls to selected category section. **After scroll completes, reset dropdown label to "Jump to category..."** to avoid users confusing scroll-to with filter-to (Finding #12). | 45 min |
| T5 | Category empty states | New | Empty category section using `EmptyState` component: message "No terms in this category yet", actionLabel "Propose a term", actionHref `/propose?category={categoryName}`. When filters active (3.2): hide empty category sections entirely. | 30 min |
| T6 | Accessibility: `nav` + `aria-label` + heading hierarchy | Fix | Wrap sidebar in `<nav aria-label="Categories">`. Category names as h2. | 15 min |
| T7 | Page title: "Browse — Katalyst Lexicon" | New | `document.title` update in `useEffect`. | 5 min |
| T8 | `data-testid` alignment | Fix | Add test IDs: sidebar container, each category link, each category section, jump-to dropdown, empty state CTAs. | 15 min |

**Story 3.1 Est: ~6.5 hours**

### Phase B — Story 3.2: Filter Terms by Status and Visibility [Size: M]

| # | Task | Type | Details | Est. |
|---|------|------|---------|------|
| T9 | Filter bar component | New | Horizontal bar above category sections. Desktop: toggle pill buttons for status (Canonical, Draft, In Review, Deprecated — multi-select). Single-select visibility dropdown (All, Internal, Client-Safe, Public). Update `var(--header-offset)` to account for filter bar height. | 2 hr |
| T10 | Mobile filter layout | New | Collapsible "Filters" section on mobile (`< 768px`). Badge shows active filter count when collapsed (e.g., "Filters (2)"). Status uses multi-select dropdown on mobile instead of toggle pills. | 45 min |
| T11 | Client-side filter logic | New | Filter the terms array: status filter = OR within selected statuses, visibility filter = exact match. Combined = AND. Category counts update to reflect filtered results. Empty categories hidden when filters active. | 1 hr |
| T12 | URL param sync | New | Bidirectional: filter state → URL params (`?status=canonical,in-review&visibility=client-safe`), URL params → filter state on page load. Use wouter `useSearch` + `useLocation`. **QA note:** Test direct URL navigation with params, browser back/forward with filter changes, filter + category scroll interaction, and encoding of special characters in category names. | 1 hr |
| T13 | "Clear filters" button + empty state | New | Clear-filters resets all filters and URL params. Global `EmptyState`: message "No terms match these filters", actionLabel "Clear filters", actionHref clears params. | 30 min |
| T14 | `data-testid` on filter elements | New | Test IDs: each filter option, clear-filters button, filter container, active-filter-count badge. | 15 min |

**Story 3.2 Est: ~5.5 hours**

**Sprint 2 Total: ~12 hours implementation + ~2.5 hours QA buffer = ~14.5 hours realistic**
**Deliverable: Epic 3 fully complete (2 stories, ~14 ACs from NEW→MET, ~6 ACs from PARTIAL→MET)**

---

## Summary

| Sprint | Epics | Stories | Key Risk | Est. Hours (with QA) |
|--------|-------|---------|----------|----------------------|
| Sprint 1 | 4 + 2 | 4.1, 4.3, 4.2, 2.1, 2.2 | Low — brownfield enhancements, no new architecture | ~10 hr |
| Sprint 2 | 3 | 3.1, 3.2 | Medium — 3.1 is a major page restructure | ~14.5 hr |
| **Total** | **3 epics** | **7 stories** | | **~24.5 hr** |

---

## Known Limitations & Deferrals

| Item | Story | Decision | Rationale |
|------|-------|----------|-----------|
| Deprecated term replacement link | 2.1, AC 9 | Defer | Schema has no `replacedByTermId` field. Adding requires migration + admin UI for linking. Separate story. |
| "Suggest an edit" navigates to /propose page vs. inline dialog | 2.1, AC 10 | Accept current | Inline dialog provides equivalent UX and was intentionally built. Story 5.2 covers the full proposal form navigation. The dialog approach is arguably better UX (no page navigation). |
| `useSearch()` hook extraction | Retro Lesson 3 | Queue for pre-Epic 5 | Not blocking for Epics 2-4. Required before Epic 5 duplicate detection. |

---

## Definition of Done (per story)

1. All ACs verified as MET (upgraded from PARTIAL/NEW)
2. All `data-testid` attributes aligned to AC spec
3. `document.title` updates on all pages
4. No LSP errors
5. Playwright e2e test pass at **desktop and tablet (768px) viewports** (Finding #7)
6. **Accessibility ACs manually verified** — heading hierarchy, aria-labels, screen reader announcements (Finding #8)
7. sprint-status.yaml updated to reflect story completion

---

## Party Mode Review Findings Log

Review date: 2026-02-11
Participants: John (PM), Winston (Architect), Sally (UX), Bob (SM), Amelia (Dev), Quinn (QA)

| # | Finding | Raised By | Status |
|---|---------|-----------|--------|
| 1 | Reorder Sprint 1: 4.1 → 4.3 → 4.2 (validate shared components first) | Bob | Incorporated — Phase B reordered |
| 2 | Add EmptyState component to Phase A foundation (15 min, prevents 4-page inconsistency) | Sally | Incorporated — added as F5 |
| 3 | Increase T2 (IntersectionObserver) estimate from 1.5h → 2.5h | Winston, Amelia | Incorporated — T2 updated |
| 4 | Add `--header-offset` CSS custom property in 3.1 for 3.2 filter bar compatibility | Amelia | Incorporated — T2 details updated |
| 5 | PrincipleCard inline variant must NOT wrap in Link (double `<a>` risk) | Amelia | Incorporated — F3 note added |
| 6 | Use COALESCE(COUNT(...), 0) for linkedTermCount to prevent null | Amelia | Incorporated — F4 details updated |
| 7 | Add tablet viewport (768px) to Definition of Done for Story 3.1 ACs | Quinn | Incorporated — DoD item 5 updated |
| 8 | Add accessibility verification to Definition of Done | Bob | Incorporated — DoD item 6 added |
| 9 | Decide filter UI pattern (toggle pills vs dropdown) before Sprint 2 | Sally | Incorporated — pre-sprint decision noted |
| 10 | Verify snapshot dialog exists in TermDetail.tsx (may be NEW, not PARTIAL) | Amelia | Incorporated — S5 flagged for verification |
| 11 | Budget 20% QA buffer → realistic estimates updated | Bob | Incorporated — totals revised to ~24.5h |
| 12 | Mobile "Jump to" dropdown should reset label after scroll | Sally | Incorporated — T4 details updated |
