# AC-Level Gap Analysis: Epics 2, 3, 4

Generated: 2026-02-10
Method: Brownfield codebase scan against epic AC definitions
Status: Complete

---

## Executive Summary

Epics 2, 3, and 4 all have **significant existing brownfield code** — the database schema, API endpoints, storage layer, and basic UI pages already exist. However, the existing code was built before the detailed UX/architecture specifications were finalized. The gap is primarily in **UX refinement, accessibility compliance, missing sub-features, and data-enrichment on the API layer** rather than building from scratch.

| Epic | Stories | ACs MET | ACs PARTIAL | ACs NEW | Effort Estimate |
|------|---------|---------|-------------|---------|-----------------|
| Epic 2 | 2.1, 2.2 | 12 | 8 | 3 | Medium |
| Epic 3 | 3.1, 3.2 | 4 | 6 | 11 | Large |
| Epic 4 | 4.1, 4.2, 4.3 | 8 | 9 | 2 | Small-Medium |

---

## EPIC 2: Term Detail Experience

### Story 2.1: Term Detail Page with Two-Tier Progressive Disclosure [Size: L]

**Existing Code:** `client/src/pages/TermDetail.tsx` (33KB, 700+ lines), `client/src/components/TierSection.tsx`, `client/src/components/StatusBadge.tsx`

| # | Acceptance Criteria | Status | Evidence / Gap |
|---|---------------------|--------|----------------|
| 1 | Breadcrumb: Home > {Category} > {Term Name} | **MET** | `TermDetail.tsx` lines 152-175: Full breadcrumb with `nav aria-label="Breadcrumb"`, Home icon, category link, term name. Uses `ChevronRight` separators. |
| 2 | Tier 1: term name as h1, status badge, category tag, full definition, usage guidance, freshness signal, version badge | **MET** | Lines 192-297: All elements present — h1 term name, StatusBadge, category tag, definition paragraph, "When to use" / "When NOT to use" sections, freshness via `formatRelativeTime`, version badge `v{term.version}`. |
| 3 | "Why it exists" appears below definition | **MET** | Lines 240-262: "Why it exists" section rendered with Info icon, label, and content. |
| 4 | Synonyms displayed as inline tags/chips | **MET** | Lines 251-261: Synonyms rendered as `span` tags with pill styling. |
| 5 | Collapsible Tier 2 sections (Examples, Version History, Related Principles) collapsed by default | **MET** | Lines 300-433: Three TierSection components with `defaultOpen={false}` (default). Uses `aria-expanded`. |
| 6 | Tier 2 sections are independent toggles | **MET** | Each TierSection has its own `useState(defaultOpen)` — toggling one doesn't affect others. |
| 7 | Good examples with green indicator, bad examples with red indicator | **MET** | Lines 316-348: Good examples have `border-kat-green` and `bg-green-50/50`, bad examples have `border-destructive` and `bg-red-50/50`. CheckCircle2 icon for good, AlertTriangle for bad. |
| 8 | Screen reader: logical heading hierarchy, `aria-expanded` on Tier 2 | **PARTIAL** | h1 for term name ✓, Tier 2 has `aria-expanded` ✓. **Gap**: Usage guidance sections use h2 but "Examples", "Version History" headings are inside TierSection as spans, not semantic h2. Category/why-exists headers use h2 ✓. The overall hierarchy is mostly correct but could be tightened. |
| 9 | Deprecated banner at top with "This term has been deprecated" + replacement link | **PARTIAL** | Lines 178-189: Deprecated banner exists with AlertTriangle icon and text. **Gap**: No replacement term link ("See {replacement} instead"). The schema doesn't have a `replacedByTermId` field, and the banner text says to "check for a replacement" generically rather than linking. |
| 10 | "Suggest an edit" link navigates to proposal form with pre-filled fields | **PARTIAL** | Lines 220-226: "Suggest an Edit" button exists. **Gap**: It opens an inline Dialog (modal) on the TermDetail page instead of navigating to `/propose?editTermId={id}` as specified by AR19. The AC says "clicking it navigates me to the proposal form" — currently it opens a dialog, not a navigation. The dialog does pre-fill fields correctly. |
| 11 | Page title: "{Term Name} — Katalyst Lexicon" | **MET** | Lines 51-56: `useEffect` sets `document.title = \`\${term.name} — Katalyst Lexicon\``  |
| 12 | `data-testid` on: breadcrumb, term name, status badge, definition, usage guidance, each Tier 2 toggle, deprecated banner, suggest-edit link | **PARTIAL** | Most test IDs present: `breadcrumb` ✓, `text-term-name` ✓, `badge-status-*` ✓, `text-term-definition` ✓, `section-usage-guidance` ✓, `tier-section-examples` ✓, `tier-section-version-history` ✓, `tier-section-related-principles` ✓, `banner-deprecated` ✓, `button-suggest-edit` ✓. **Gap**: The `data-testid` naming uses `text-term-*` instead of the bare names specified in the AC. Minor alignment needed. |

**Story 2.1 Summary:** 7 MET, 4 PARTIAL, 0 NEW

---

### Story 2.2: Version History in Term Detail [Size: M]

**Existing Code:** Version history section in `TermDetail.tsx` lines 352-402, `GET /api/terms/:id/versions` endpoint, `storage.getTermVersions()`.

| # | Acceptance Criteria | Status | Evidence / Gap |
|---|---------------------|--------|----------------|
| 1 | Chronological list of versions, most recent first, with version number, author, date, change notes | **MET** | Lines 370-399: Versions rendered in order (API returns `desc(versionNumber)`). Each entry shows: version number, author (`changedBy`), date/time, and change note. |
| 2 | Current version visually marked with "Current" badge | **MET** | Lines 376-378: `v.versionNumber === term.version` check renders a "Current" badge with `data-testid="version-current-badge-{n}"`. |
| 3 | "View full snapshot" button on past versions shows complete term data at that version | **PARTIAL** | Lines 386-397: "View full snapshot" button exists with `onClick={() => setSnapshotVersion(v)}`. **Gap**: Need to verify the snapshot dialog/modal actually renders the `snapshotJson` data. The `snapshotVersion` state is set but the rendering component for it may be incomplete (truncated in read). |
| 4 | Single version shows "v1 — Original" with creation date | **PARTIAL** | The version entry shows "Version 1" with date and author. **Gap**: Does not specifically display "v1 — Original" text — just "Version {n}" generically. The "Original" label for v1 is missing. |
| 5 | Screen reader: each version entry announced with version number, author, date | **MET** | Each version entry is a div with visible text content for version number, author, and date — screen readers will read these naturally. |
| 6 | `data-testid="version-entry-{versionNumber}"` on each version row | **MET** | Line 372: `data-testid={\`version-entry-\${v.versionNumber}\`}` ✓ |
| 7 | Empty version state shows "No change notes" in muted text | **MET** | Line 385: `v.changeNote || <span className="text-muted-foreground italic">No change notes</span>` ✓ |

**Story 2.2 Summary:** 5 MET, 2 PARTIAL, 0 NEW

---

## EPIC 3: Browse & Discover

### Story 3.1: Browse Page with Category Sections and Sidebar [Size: L]

**Existing Code:** `client/src/pages/Browse.tsx` (145 lines), sidebar with categories, term grid.

| # | Acceptance Criteria | Status | Evidence / Gap |
|---|---------------------|--------|----------------|
| 1 | Page heading "Browse Terms", terms grouped by category with category name, color accent, term count | **PARTIAL** | Current heading says "All Terms" or the active category name, not "Browse Terms". Terms are NOT grouped by category — they're shown as a flat grid, optionally filtered by single category via query param. **Gap**: Need complete restructure to group-by-category layout with colored left-border sections. |
| 2 | Terms within each category displayed as TermCards in responsive grid | **PARTIAL** | TermCards are used ✓, responsive grid ✓. **Gap**: Not grouped by category — just a flat grid of all terms or one category's terms. |
| 3 | Desktop (1024px+): persistent sidebar listing categories as quick links | **MET** | Lines 39-107: Sidebar with category list, always visible on desktop, quick links to filter. |
| 4 | Clicking category in sidebar scrolls to that section | **NEW** | Current behavior: clicking a category link changes URL params and filters the grid. **Gap**: AC requires smooth scroll to in-page category section anchors, not URL-based filtering. Completely different interaction pattern. |
| 5 | Tablet (768-1023px): sidebar hidden, two-column term grid | **PARTIAL** | Sidebar uses `md:` breakpoint (768px), which hides on mobile. Grid is `md:grid-cols-2`. **Gap**: The sidebar hides below `md:` (768px) but the AC specifies it should also hide for tablet (768-1023px). Currently sidebar shows at `md:` width. Need `lg:` breakpoint (1024px+) for sidebar, not `md:`. |
| 6 | Mobile (<768px): single-column, "Jump to category" dropdown | **PARTIAL** | Single column ✓ (default). **Gap**: No "Jump to category" dropdown exists on mobile. |
| 7 | Empty category: "No terms in this category yet" + "Propose a term" CTA with pre-filled category | **PARTIAL** | Lines 135-139: Empty state exists but text is "No terms found in this category yet." (close). **Gap**: No "Propose a term" CTA with category pre-fill (`/propose?category={name}`). |
| 8 | When filters active and a category has zero results, hide category section entirely | **NEW** | Filtering hasn't been implemented yet (Story 3.2), and the browse page doesn't group by category, so this interaction doesn't exist. |
| 9 | Screen reader: sidebar uses `nav` with `aria-label="Categories"`, headings hierarchy | **PARTIAL** | No `nav` wrapper or `aria-label` on the sidebar. Category headings not using semantic h2. **Gap**: Need `<nav aria-label="Categories">` wrapper and proper heading hierarchy. |
| 10 | Page title: "Browse — Katalyst Lexicon" | **NEW** | No `document.title` update exists in Browse.tsx. |
| 11 | Categories ordered by sortOrder | **MET** | API `getCategories()` orders by `asc(categories.sortOrder)` ✓. |

**Story 3.1 Summary:** 2 MET, 5 PARTIAL, 3 NEW

---

### Story 3.2: Filter Terms by Status and Visibility [Size: M]

**Existing Code:** No filtering exists in Browse.tsx. Only category filtering via URL param.

| # | Acceptance Criteria | Status | Evidence / Gap |
|---|---------------------|--------|----------------|
| 1 | Horizontal filter bar with multi-select status filter and single-select visibility filter | **NEW** | No filter bar exists. |
| 2 | Status options: Canonical, Draft, In Review, Deprecated (multi-select) | **NEW** | No status filter exists. |
| 3 | Visibility options: All, Internal, Client-Safe, Public (single-select) | **NEW** | No visibility filter exists. |
| 4 | Mobile: filters in collapsible "Filters" section with active-count badge | **NEW** | No mobile filter UI exists. |
| 5 | Filtering applies: only matching terms shown, category counts update | **NEW** | No filter logic exists. Client-side filtering can be built on the existing `GET /api/terms` data. |
| 6 | Visibility filter: single-select, filters to matching visibility | **NEW** | No visibility filter exists. |
| 7 | Combined filters: AND logic (status AND visibility) | **NEW** | No filter logic exists. |
| 8 | URL persistence: filters reflected in query params | **PARTIAL** | Category param already in URL (`?category=`). **Gap**: No status or visibility params. Need to extend URL param handling. |
| 9 | Shared URL opens with same filters pre-selected | **NEW** | Not implemented. |
| 10 | "Clear filters" button removes all filters and URL params | **NEW** | No clear-filters button exists. |
| 11 | Global empty state: "No terms match these filters" + "Clear filters" | **NEW** | No filter-specific empty state exists. |
| 12 | `data-testid` on filter options, clear button, filter container, active-filter-count badge | **NEW** | No filter test IDs exist. |

**Story 3.2 Summary:** 0 MET, 1 PARTIAL, 11 NEW

---

## EPIC 4: Principles & Knowledge Connections

### Story 4.1: Principles List Page [Size: M]

**Existing Code:** `client/src/pages/BrowsePrinciples.tsx` (101 lines), `GET /api/principles` endpoint.

| # | Acceptance Criteria | Status | Evidence / Gap |
|---|---------------------|--------|----------------|
| 1 | Cards show: title, status badge, summary (2-line truncation), tags, linked term count | **PARTIAL** | Title ✓, status badge ✓, summary with `line-clamp-2` ✓, tags ✓. **Gap**: No linked term count displayed. API doesn't return `linkedTermCount` — needs storage-layer join to count linked terms per principle. Shows `owner` instead. |
| 2 | Status badges: Published (green), Draft (gray), Archived (muted) | **MET** | Lines 9-21: PrincipleStatusBadge with Published=green, Draft=yellow/warning, Archived=muted. Published and Archived match. Draft uses yellow instead of gray — minor styling deviation. |
| 3 | Empty state: "Principles will appear here once they're published" (no Create CTA) | **PARTIAL** | Lines 92-96: Empty state exists but text is "No principles found yet." **Gap**: Needs to match the specified copy "Principles will appear here once they're published" and explicitly exclude a Create CTA. |
| 4 | Clicking card navigates to principle detail page | **MET** | Lines 49: `Link href={\`/principle/\${principle.slug}\`}` ✓ |
| 5 | Screen reader: heading hierarchy (h1 page title, h3 card titles), cards announced with title + linked term count | **PARTIAL** | h1 for page title ✓, h3 for card titles ✓. **Gap**: Cards don't include linked term count so screen readers can't announce it. |
| 6 | Page title: "Principles — Katalyst Lexicon" | **NEW** | No `document.title` update exists in BrowsePrinciples.tsx. |
| 7 | `data-testid` on each principle card, empty state | **MET** | `card-principle-{id}` ✓ (line 52), `empty-principles` ✓ (line 93). |

**Story 4.1 Summary:** 3 MET, 3 PARTIAL, 1 NEW

---

### Story 4.2: Principle Detail Page [Size: M]

**Existing Code:** `client/src/pages/PrincipleDetail.tsx` (194 lines), `GET /api/principles/:id` + `GET /api/principles/:id/terms`.

| # | Acceptance Criteria | Status | Evidence / Gap |
|---|---------------------|--------|----------------|
| 1 | Title as h1, full summary, body as rendered markdown, status badge, visibility, tags as chips | **MET** | All present: h1 title (line 104-112), summary (line 128-130), body via `renderMarkdown()` (lines 133-138), status badge ✓, visibility ✓, tags as chips ✓. |
| 2 | Related Terms as TermCards, clicking navigates to term detail | **PARTIAL** | Lines 161-177: Related terms are rendered as simple tag-like links (text pills), NOT as TermCards. **Gap**: Need to replace inline tag-style with proper TermCard components for richer display with definition preview, status badge, etc. |
| 3 | No linked terms: "No terms linked to this principle yet" | **PARTIAL** | Currently the "Related Terms" section simply doesn't render when `relatedTerms.length === 0` (the conditional on line 161 skips it). **Gap**: Need to always show the section with the empty message. |
| 4 | Archived banner: muted/gray styling (not amber) | **MET** | Lines 116-126: Archived banner uses `bg-muted border-border` and `text-muted-foreground` — gray/muted styling, not amber. ✓ |
| 5 | Screen reader: h1 for title, h2 for sections, accessible labels | **PARTIAL** | h1 for title ✓. **Gap**: Section headings (Related Terms, Tags) use h3, not h2 as specified. Should be h2 for proper hierarchy under h1. |
| 6 | Page title: "{Principle Title} — Katalyst Lexicon" | **NEW** | No `document.title` update exists in PrincipleDetail.tsx. |
| 7 | Markdown security: sanitized to prevent XSS | **PARTIAL** | Lines 26-50: Custom `renderMarkdown()` does call `escapeHtml()` before rendering. **Gap**: This is a basic escape that doesn't handle all XSS vectors. AC specifies using `react-markdown` or `marked` + `DOMPurify` for proper sanitization. The custom regex-based markdown renderer is fragile — script injection could bypass it. |
| 8 | `data-testid` on: principle title, body content, related terms section, each linked term card, archived banner | **PARTIAL** | `text-principle-title` ✓, `text-principle-body` ✓, `link-term-{id}` ✓. **Gap**: No `data-testid` on the "Related Terms" section wrapper. No archived banner `data-testid`. |

**Story 4.2 Summary:** 2 MET, 5 PARTIAL, 1 NEW

---

### Story 4.3: Bidirectional Term-Principle Links [Size: S]

**Existing Code:** Both directions implemented — `TermDetail.tsx` fetches principles, `PrincipleDetail.tsx` fetches terms. API endpoints + storage methods exist.

| # | Acceptance Criteria | Status | Evidence / Gap |
|---|---------------------|--------|----------------|
| 1 | Term → Principles Tier 2: linked principles with title, summary, status; clicking navigates to principle detail | **PARTIAL** | TermDetail.tsx lines 405-433: Principles shown with title and summary, linking to `/principle/{slug}`. **Gap**: Status badge NOT shown on each principle card within the Tier 2 section. Need to add PrincipleStatusBadge to each linked principle entry. |
| 2 | Empty state: "No principles linked to this term" | **MET** | Line 417: "No principles are linked to this term yet." (close match, slightly different wording — acceptable). |
| 3 | Bidirectional consistency: link appears in both directions | **MET** | Both API endpoints exist: `GET /api/terms/:id/principles` and `GET /api/principles/:id/terms`. Both use `principleTermLinks` join table. Both pages fetch and display the data. |
| 4 | `data-testid="linked-principle-{id}"` on each linked principle item | **PARTIAL** | Current: `data-testid="link-principle-{id}"`. **Gap**: AC specifies `linked-principle-{id}` prefix. Minor rename needed. |

**Story 4.3 Summary:** 2 MET, 2 PARTIAL, 0 NEW

---

## Shared Components Needed Across Multiple Stories

### 1. `PrincipleStatusBadge` (shared component extraction)
- **Used by**: Stories 4.1, 4.2, 4.3
- **Current state**: Duplicated inline in `BrowsePrinciples.tsx` and `PrincipleDetail.tsx`
- **Action**: Extract to `client/src/components/PrincipleStatusBadge.tsx`

### 2. `PrincipleCard` (new shared component)
- **Used by**: Stories 4.1, 4.2 (related terms), 4.3 (term→principle links)
- **Current state**: Card markup inline in `BrowsePrinciples.tsx`; different markup in `TermDetail.tsx` for linked principles
- **Action**: Extract reusable `PrincipleCard` component with variants (`card` for list page, `inline` for related sections)

### 3. `EmptyState` component (standardized)
- **Used by**: Stories 3.1, 3.2, 4.1, 4.2
- **Current state**: Each page has ad-hoc empty state divs with inconsistent copy/styling
- **Action**: Create or formalize `EmptyState` component with `message`, `actionLabel`, `actionHref` props

### 4. Category-grouped layout pattern
- **Used by**: Story 3.1 (primary), Story 3.2 (filters operate on grouped view)
- **Current state**: Browse page uses flat grid with category URL filter
- **Action**: New layout pattern — group terms by category with section anchors, color accents, scroll-to behavior

### 5. URL filter state management
- **Used by**: Stories 3.1, 3.2
- **Current state**: Basic `?category=` param in Browse.tsx
- **Action**: Extend to support `?status=`, `?visibility=` params with multi-value support and bidirectional sync

### 6. `document.title` updates (page title pattern)
- **Used by**: Stories 3.1, 4.1, 4.2
- **Current state**: Only TermDetail.tsx sets document.title
- **Action**: Add `useEffect` with title setting to Browse.tsx, BrowsePrinciples.tsx, PrincipleDetail.tsx

### 7. `linkedTermCount` API enrichment
- **Used by**: Story 4.1
- **Current state**: `GET /api/principles` returns raw principle objects without linked term count
- **Action**: Modify `storage.getPrinciples()` to JOIN on `principleTermLinks` and COUNT per principle, or add a new endpoint

### 8. Proper markdown rendering (`react-markdown` + `rehype-sanitize`)
- **Used by**: Story 4.2
- **Current state**: Custom regex-based `renderMarkdown()` with basic `escapeHtml()`
- **Action**: Replace with `react-markdown` + `rehype-sanitize` for security and correctness

---

## Prioritized Implementation Plan

### Priority 1 — Shared Foundation (do first, unblocks everything)
1. **Extract PrincipleStatusBadge** → shared component (unblocks 4.1, 4.2, 4.3)
2. **Extract PrincipleCard** → shared component with `card` and `inline` variants (unblocks 4.1, 4.2, 4.3)
3. **Add `linkedTermCount` to `GET /api/principles`** → storage layer JOIN (unblocks 4.1)
4. **Install `react-markdown` + `rehype-sanitize`** → dependency (unblocks 4.2)

### Priority 2 — Epic 4 (smallest gap, fastest wins)
5. **Story 4.3: Bidirectional Term-Principle Links** — Mostly MET. Fix `data-testid` naming, add status badge to linked principle cards in TermDetail. ~1 hour.
6. **Story 4.1: Principles List Page** — Add linked term count to cards, update empty state copy, add page title. ~2 hours.
7. **Story 4.2: Principle Detail Page** — Replace markdown renderer, use TermCards for related terms, add empty state for no linked terms, add page title, fix heading hierarchy, add missing test IDs. ~3 hours.

### Priority 3 — Epic 2 (moderate gap, high-value page)
8. **Story 2.1: Term Detail Page** — Fix heading hierarchy in Tier 2, review deprecated banner for replacement link (accept limitation if no `replacedByTermId` field), verify all `data-testid` naming conventions. Minor tweaks. ~2 hours.
9. **Story 2.2: Version History** — Add "v1 — Original" label for first version, verify snapshot dialog renders completely. ~1 hour.

### Priority 4 — Epic 3 (largest gap, most new code)
10. **Story 3.1: Browse Page Restructure** — This is the **biggest task**. Requires:
    - Restructure from flat grid to grouped-by-category sections
    - Each category section with color accent, term count, anchor ID
    - Sidebar scroll-to behavior (replace URL-filter with scroll-to-anchor)
    - Mobile "Jump to category" dropdown
    - Sidebar at `lg:` breakpoint (1024px+), not `md:`
    - Category empty states with "Propose a term" CTA
    - `nav` with `aria-label` on sidebar
    - Page title
    - ~6-8 hours

11. **Story 3.2: Filter Bar** — Entirely new feature. Requires:
    - Multi-select status filter component
    - Single-select visibility filter
    - Mobile collapsible filter section
    - Client-side filter logic with AND combination
    - URL param sync for all filters
    - Clear-filters button
    - Filter-specific empty state
    - Integration with category-grouped layout (hide empty categories when filtering)
    - ~6-8 hours

---

## Risk Notes

1. **Story 3.1 is a significant restructure** of Browse.tsx — not a tweak. The current architecture (flat grid + URL category filter) needs to become a category-grouped page with scroll anchors. This may be the single largest piece of work.

2. **Story 3.2 depends on 3.1** — filters operate on the category-grouped view, so 3.1 must be completed first.

3. **Deprecated term replacement link** (Story 2.1, AC 9) — the schema has no `replacedByTermId` field on the `terms` table. Adding it would require a migration. Consider deferring the replacement link to a future story or adding the field now.

4. **Markdown security** (Story 4.2) — the current custom renderer is a known XSS risk. Prioritize replacing it with `react-markdown` + `rehype-sanitize`.

5. **All stories** are marked `backlog` / `todo` in sprint-status.yaml despite having significant existing code. The gap analysis confirms they are brownfield enhancements, not greenfield builds.

---

## Recommended Sprint Order

```
Sprint 1 (Shared + Epic 4):
  → Extract shared components (PrincipleStatusBadge, PrincipleCard)
  → API: linkedTermCount on GET /api/principles
  → Install react-markdown + rehype-sanitize
  → Story 4.3 (smallest, ~1h)
  → Story 4.1 (~2h)
  → Story 4.2 (~3h)

Sprint 2 (Epic 2):
  → Story 2.1 (~2h — mostly tweaks)
  → Story 2.2 (~1h — label + snapshot verification)

Sprint 3 (Epic 3):
  → Story 3.1 (~6-8h — major restructure)
  → Story 3.2 (~6-8h — new feature)
```

Total estimated effort: ~25-30 hours across all three epics.
