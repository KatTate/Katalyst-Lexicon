# Story 3.1: Browse Page with Category Sections and Sidebar

Status: done

## Story

As a user exploring the lexicon,
I want to see all terms organized by category on a browse page with a sidebar for quick navigation,
So that I can explore the vocabulary by topic and jump to the category I care about.

## Acceptance Criteria

**Page Layout & Category Grouping:**

1. **Given** I navigate to the browse page, **When** the page loads, **Then** I see a page heading ("Browse Terms") with all terms grouped under their category headings. Each category section shows the category name, color accent (left border), and count of terms.

2. **Given** the page has multiple categories, **When** terms are grouped, **Then** terms within each category are displayed as TermCards in a responsive grid.

**Sidebar (Desktop):**

3. **Given** I am on desktop (1024px+), **When** I view the page, **Then** I see a persistent sidebar on the left listing all categories as quick links with term counts.

4. **Given** the sidebar is visible, **When** I click a category link in the sidebar, **Then** the page scrolls smoothly to that category section. The clicked category is highlighted in the sidebar as the active item.

**Responsive Layout (Tablet):**

5. **Given** I am on a tablet (768-1023px), **When** I view the page, **Then** the sidebar is hidden and categories are listed sequentially in a two-column term grid.

**Responsive Layout (Mobile):**

6. **Given** I am on mobile (< 768px), **When** I view the page, **Then** categories are listed sequentially in a single-column term grid. A "Jump to category" dropdown appears at the top for quick navigation.

7. **Given** I am on mobile, **When** I select a category from the "Jump to category" dropdown, **Then** the page scrolls smoothly to that category section.

**Empty Category State:**

8. **Given** a category has no terms and no filters are active, **When** I view that category section, **Then** I see an empty state: "No terms in this category yet" with a "Propose a term" CTA button that pre-fills the category on the proposal form (links to `/propose?category={categoryName}`).

9. **Given** a category has no matching terms because filters are active (Story 3.2), **When** filters reduce a category to zero results, **Then** that category section is hidden entirely (no empty state shown — filtering an empty category is noise).

**Accessibility:**

10. **Given** I am using a screen reader, **When** I navigate the page, **Then** the sidebar uses `nav` with `aria-label="Categories"`. Category headings provide proper hierarchy (h2) for skip navigation. All interactive elements have accessible labels.

**Page Title:**

11. **Given** I navigate to the browse page, **When** the page loads, **Then** the browser tab title is "Browse — Katalyst Lexicon".

**Category Sort Order:**

12. **Given** categories have a `sortOrder` field, **When** they are displayed in the sidebar and as section headings, **Then** they appear in ascending `sortOrder` order.

## Dev Notes

### Architecture Patterns to Follow

- **Brownfield context**: The browse page already exists at `client/src/pages/Browse.tsx`. It has a category sidebar with link-based filtering (URL param `?category=`) and a flat term grid. This story redesigns it to show ALL categories simultaneously with in-page sections, smooth scrolling, and responsive layout — replacing the current "filter by one category" pattern with "show all categories as sections" pattern.
- **Sidebar quick links**: Use `scroll-margin-top` on category section headings to account for the fixed header offset when scrolling. Implement smooth scroll via `element.scrollIntoView({ behavior: 'smooth' })`. On mobile, use a Select/dropdown component instead of sidebar.
- **Category color accent**: Each category has a `color` field (e.g., `bg-primary`, `bg-kat-basque`). Use this as a left-border accent on section headers: `border-l-4` with the category color class.
- **TermCard reuse**: Reuse the existing `TermCard` component (variant="card") from Epic 1. No changes to TermCard needed.
- **Data fetching**: Use `GET /api/terms` + `GET /api/categories`. Group terms client-side by `term.category` matching `category.name`. Sort categories by `sortOrder`.
- **Responsive strategy** (AR11): Use Tailwind responsive prefixes for layout changes. Desktop: `lg:block` for sidebar. Tablet: `md:grid-cols-2`. Mobile: single column + Select dropdown. Use `useMediaQuery` only if fundamentally different interaction pattern is needed (Jump-to-dropdown on mobile is a different pattern, warranting `useMediaQuery`).
- **No SearchHero on browse**: The browse page uses filter controls (Story 3.2), not a search hero. The global header search remains available.

### UI/UX Deliverables

**Browse Page (`client/src/pages/Browse.tsx`) — Full Rewrite:**
- Page heading: "Browse Terms" (h1)
- Sidebar (desktop): Category list as quick-scroll links, each with name + term count, active state tracking via Intersection Observer or scroll listener
- Mobile: "Jump to category" Select dropdown at top
- Category sections: h2 heading with color accent left border, term count badge, responsive TermCard grid
- Empty category state with "Propose a term" CTA
- Page title: "Browse — Katalyst Lexicon"

**Sidebar Navigation (`nav aria-label="Categories"`):**
- Listed in `sortOrder` ascending
- Each link shows category name + term count
- Active category highlighted based on scroll position (optional: Intersection Observer)
- Sticky positioning so sidebar scrolls with content

### Anti-Patterns & Hard Constraints

- **DO NOT** use the current URL-param-based category filter pattern. Replace with in-page category sections that show ALL categories at once.
- **DO NOT** create a separate MobileBrowse component. Use Tailwind responsive prefixes within the same component, with `useMediaQuery` only for the Jump-to-dropdown vs sidebar toggle.
- **DO NOT** fetch terms per-category with separate API calls. Fetch all terms once and group client-side.
- **DO NOT** hide the sidebar behind a hamburger menu on desktop (1024px+). It must be persistently visible.
- **DO NOT** use anchor-based hash navigation (`#category-name`). Use programmatic `scrollIntoView` for smooth scrolling. Hash navigation causes full page jumps and doesn't account for header offset.

### Gotchas & Integration Warnings

- **Existing Browse.tsx has different architecture**: The current page uses URL-param filtering to show one category at a time. This story fundamentally changes the layout to show all categories as sections. Expect a significant rewrite of Browse.tsx.
- **Category `color` field values**: These are Tailwind class names like `bg-primary`, `bg-kat-basque`, etc. They cannot be used directly as `border-color` — they're background color utilities. You'll need to map them or use a CSS approach (e.g., extracting the color value, or using a small lookup for `border-l-{color}` equivalents). Alternatively, use inline styles or a `style` attribute with the color.
- **Scroll margin for fixed header**: The Layout component has a fixed header. Category section headings need `scroll-margin-top` (e.g., `scroll-mt-20`) to avoid being hidden behind the header when scrolled to.
- **Story 3.2 dependency**: The empty-category hiding logic (AC 9) depends on filters from Story 3.2. Implement the data structure to support filtering, but the actual filter UI is Story 3.2. For now, AC 9 logic can be: "if filters are active AND category has zero terms after filtering, hide the section."
- **Categories with zero terms**: Some categories may have no terms in the database. These should show the empty state (AC 8) when no filters are active.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Browse.tsx` | REWRITE | Full redesign: category sections, sidebar, responsive layout |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-query` — server state management
- `wouter` — routing (useSearch for URL params in Story 3.2)
- `lucide-react` — icons
- `tailwindcss` — styling
- All shadcn/ui components already available (Select for mobile dropdown)

**No new packages needed.**

**No environment variables needed.**

### References

- Epic 3 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 3, Story 3.1
- Architecture AR11 (Responsive Strategy): `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md` → AD-14
- UX Design Spec (Browse layout, sidebar, Journey 2): `_bmad-output/planning-artifacts/ux-design-specification.md` → Journey 2, Layout B
- Existing browse page: `client/src/pages/Browse.tsx`
- Existing TermCard component: `client/src/components/TermCard.tsx`
- Existing categories API: `server/routes.ts` → `GET /api/categories`, `GET /api/terms`
