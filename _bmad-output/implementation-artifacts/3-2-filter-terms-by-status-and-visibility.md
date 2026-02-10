# Story 3.2: Filter Terms by Status and Visibility

Status: todo

## Story

As a user browsing terms,
I want to filter by status and visibility level so I can narrow down to the terms relevant to my current context,
So that I find exactly what I need without scrolling through everything.

## Acceptance Criteria

**Filter Bar Layout:**

1. **Given** I am on the browse page, **When** I look above the category sections, **Then** I see a horizontal filter bar with: a multi-select status filter and a single-select visibility filter.

2. **Given** I view the status filter, **When** I see the options, **Then** it shows: Canonical, Draft, In Review, Deprecated. I can select multiple simultaneously (e.g., Canonical + In Review).

3. **Given** I view the visibility filter, **When** I see the options, **Then** it shows: All, Internal, Client-Safe, Public. I can select only one at a time.

**Mobile Filter Layout:**

4. **Given** I am on mobile (< 768px), **When** I view the filter area, **Then** the filters are inside a collapsible "Filters" section that I can expand/collapse. When collapsed, a badge shows how many filters are active (e.g., "Filters (2)").

**Filter Application — Status:**

5. **Given** I select "Canonical" and "In Review" status filters, **When** the filters apply, **Then** only terms with status Canonical or In Review are shown. The term count per visible category section updates to reflect filtered results.

**Filter Application — Visibility:**

6. **Given** I select "Client-Safe" from the visibility filter, **When** the filter applies, **Then** only terms with visibility "Client-Safe" are shown.

**Combined Filters:**

7. **Given** I have both status and visibility filters active, **When** I view results, **Then** status and visibility filters work together with AND logic: a term must match the selected status(es) AND the selected visibility to appear.

**URL Persistence:**

8. **Given** I select "Canonical" and "In Review" status filters and "Client-Safe" visibility, **When** the URL updates, **Then** it reflects my filter selections (e.g., `?status=canonical,in-review&visibility=client-safe`).

9. **Given** I copy the current URL with filter parameters and share it with a colleague, **When** they open the URL, **Then** they see the same filtered view with the same filters pre-selected.

**Clear Filters:**

10. **Given** filters are active, **When** I click a "Clear filters" button, **Then** all filters are removed, URL parameters are cleared, and all terms are shown.

**Global Empty State:**

11. **Given** a filter combination returns no results across all categories, **When** no terms match, **Then** I see a friendly empty state: "No terms match these filters" with a prominent "Clear filters" button.

**Category Hiding Under Filters:**

12. **Given** filters are active, **When** a category has zero terms matching the active filters, **Then** that category section is hidden entirely (not shown with an empty state — it's noise when filtering).

**Active Filter Indicators:**

13. **Given** filters are active, **When** I view the filter bar, **Then** each active filter is visually highlighted (e.g., filled/checked state). The total active filter count is visible.

## Dev Notes

### Architecture Patterns to Follow

- **Filter state in URL**: Use `useSearch` from wouter + `URLSearchParams` for filter state. Status is comma-separated (multi-select): `?status=canonical,in-review`. Visibility is single value: `&visibility=client-safe`. When no filters are active, no query params appear.
- **Client-side filtering**: All terms are already fetched via `GET /api/terms` in Story 3.1. Apply filters client-side using `Array.filter()` on the terms array. No new API endpoints or server-side filtering needed.
- **Integration with Story 3.1**: Story 3.1 renders category sections with term grids. This story adds a filter bar above those sections and modifies the term grouping logic to respect active filters. The category section hiding logic (Story 3.1 AC 9) is activated by these filters.
- **Status filter as toggle buttons**: Multi-select for status works best as a row of toggle buttons (each independently clickable). Alternatively, use a Popover with checkboxes. Toggle buttons are more discoverable on desktop.
- **Visibility filter as Select/Radio**: Single-select for visibility uses a Select dropdown or inline radio group. "All" is the default (no filter).
- **URL sync pattern**: Read filters from URL on mount (for shareable links). Update URL on filter change using `useLocation` from wouter. Use `replace: true` to avoid polluting browser history with every filter change.

### UI/UX Deliverables

**Filter Bar (added to `client/src/pages/Browse.tsx`):**
- Horizontal bar above category sections
- Left side: Status toggles (Canonical, Draft, In Review, Deprecated) — each is a button that toggles on/off
- Right side: Visibility dropdown (All, Internal, Client-Safe, Public)
- "Clear filters" button (appears only when filters are active)
- Active filter count badge
- Desktop: horizontal inline layout
- Mobile: collapsible "Filters" section with active count badge

**Filter Integration:**
- Terms are filtered before grouping into categories
- Category term counts update dynamically
- Categories with zero filtered terms are hidden
- Global empty state when no terms match any category

### Anti-Patterns & Hard Constraints

- **DO NOT** create new API endpoints for filtered data. All filtering is client-side on the existing `GET /api/terms` data.
- **DO NOT** use React state alone for filters. Filters MUST be reflected in the URL for shareability (AC 8, 9).
- **DO NOT** use `useNavigate` or `history.pushState` for every filter change — use `replace: true` to avoid back-button pollution.
- **DO NOT** show empty category sections when filters are active. Only show empty state for categories with zero terms when NO filters are active (that's Story 3.1's AC 8).
- **DO NOT** add a "Search within browse" feature. Browse uses filters, not search. The global search (header) remains the search mechanism.

### Gotchas & Integration Warnings

- **Status values are capitalized in the data model**: The `Term.status` field uses "Canonical", "In Review", "Draft", "Deprecated" (capitalized). The URL params should use lowercase for cleaner URLs (`canonical`, `in-review`, `draft`, `deprecated`). Map between them when reading/writing URL params.
- **Visibility values are also capitalized**: "Internal", "Client-Safe", "Public" in the data model. Use lowercase in URL params (`internal`, `client-safe`, `public`).
- **"All" visibility means no filter**: When visibility is "All" (or not set), don't filter by visibility at all. Don't include `visibility=all` in the URL — just omit the parameter.
- **Multi-select status empty means "show all"**: When no statuses are selected, show all statuses. Don't include `status=` in the URL when all or none are selected.
- **Browser history pollution**: Without `replace: true`, each filter toggle would create a new history entry. Users would need to click back many times to leave the page. Always use `replace`.
- **Story 3.1 must be complete first**: This story adds filters to the browse page layout built in Story 3.1. The category sections, sidebar, and responsive layout must already exist.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Browse.tsx` | MODIFY | Add filter bar, URL-driven filter state, client-side filtering logic, mobile collapsible filters |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `wouter` — `useSearch` and `useLocation` for URL param management
- `tailwindcss` — styling
- All shadcn/ui components (Select, Button, Badge, Collapsible)

**No new packages needed.**

**No environment variables needed.**

**Story dependency:** Story 3.1 must be implemented first.

### References

- Epic 3 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 3, Story 3.2
- UX Design Spec (filters, status filter): `_bmad-output/planning-artifacts/ux-design-specification.md` → Journey 2 Step 5, Filter Patterns UX11
- Architecture AR11 (Responsive Strategy): `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md` → AD-14
- Existing browse page (after Story 3.1): `client/src/pages/Browse.tsx`
- Term status/visibility types: `client/src/lib/api.ts` → `Term` interface
