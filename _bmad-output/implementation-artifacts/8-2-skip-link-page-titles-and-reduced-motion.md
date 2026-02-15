# Story 8.2: Skip Link, Page Titles, and Reduced Motion

Status: done

## Story

As a user relying on assistive technology or keyboard navigation,
I want skip navigation, meaningful page titles, and motion-safe animations,
so that I can navigate efficiently and comfortably.

## Acceptance Criteria

1. **Given** I am using keyboard navigation, **When** I press Tab as the first action on any page, **Then** a "Skip to main content" link becomes visible as the first focusable element, **And** pressing Enter on it moves focus to the main content area, bypassing the header and navigation.

2. **Given** the "Skip to main content" link is not focused, **When** I look at the page, **Then** the link is visually hidden (not visible to sighted users but accessible to screen readers).

3. **Given** I navigate to any page in the application, **When** the page loads, **Then** the browser tab title updates to "{Page Name} — Katalyst Lexicon". Examples:
   - Home page: "Katalyst Lexicon" (just the app name, no prefix)
   - Browse page: "Browse — Katalyst Lexicon"
   - Term detail page: "Scope — Katalyst Lexicon" (uses term name)
   - Principle detail page: "API-First Design — Katalyst Lexicon" (uses principle title)
   - Review Queue: "Review Queue — Katalyst Lexicon"
   - Propose page: "Propose a New Term — Katalyst Lexicon"
   - Settings page: "System Settings — Katalyst Lexicon"
   - Manage Categories: "Manage Categories — Katalyst Lexicon"
   - Manage Principles: "Manage Principles — Katalyst Lexicon"
   - My Proposals: "My Proposals — Katalyst Lexicon"
   - 404 page: "Page Not Found — Katalyst Lexicon"

4. **Given** I navigate away from a page, **When** the new page loads, **Then** the title updates to reflect the new page (no stale titles from previous page remain).

5. **Given** I have `prefers-reduced-motion: reduce` enabled in my OS settings, **When** I use the application, **Then** all CSS transitions, CSS animations, and Framer Motion animations are disabled or replaced with instant state changes.

6. **Given** I have `prefers-reduced-motion: reduce` enabled, **When** I interact with shadcn/ui components (dialogs, popovers, dropdowns, sheets, tooltips, menus), **Then** their open/close animations are instant (no slide, fade, or zoom effects).

7. **Given** I have `prefers-reduced-motion: reduce` enabled, **When** I toggle the theme, **Then** the theme change is instant with no transition.

## Dev Notes

### Architecture Patterns to Follow

- **Wouter for routing** — Use `useLocation` from `wouter` for route awareness. Do NOT use react-router. (Source: project-context.md, Framework-Specific Rules)
- **Tailwind v4 syntax** — Use `@import "tailwindcss"` and `@theme inline`, NOT `@tailwind` directives. Use `motion-safe:` and `motion-reduce:` variants where applicable. (Source: project-context.md, Tailwind CSS v4.1.14)
- **`cn()` utility** — Use for className merging. (Source: project-context.md)
- **Lucide React icons** — If any icons needed, use from `lucide-react`. (Source: project-context.md)
- **`data-testid` required** — The skip link must have `data-testid="skip-link"`. (Source: epics file, Story 8.2 dev notes)
- **Component file conventions** — PascalCase for React component files, camelCase for hooks/utilities. (Source: project-context.md)
- **Existing page title pattern** — 10 of 13 pages already set `document.title` via `useEffect` in each page component. Follow this same inline pattern for the 3 missing pages rather than creating a hook that would require refactoring all existing pages. (Source: codebase analysis)
- **CSS custom properties** — Theme transitions and dark mode styling use CSS variables defined in `client/src/index.css` `:root` and `.dark` selectors. (Source: project-context.md, Story 8.1)

### UI/UX Deliverables

- **Skip link** — Visually hidden anchor element positioned as the first child inside Layout.tsx (before the sidebar/header). On `:focus`, it becomes visible at the top-left of the viewport with high-contrast styling (e.g., white text on primary-colored background). Links to `#main-content` — requires adding `id="main-content"` to the `<main>` element in Layout.tsx.
- **No new screens or pages** — This story modifies existing components only.
- **No visual changes to existing UI** — Skip link is invisible unless focused; page titles are in the browser tab only; reduced motion changes remove animations but don't alter layout.

### Anti-Patterns & Hard Constraints

- **Do NOT create a `useDocumentTitle` hook and refactor all pages** — 10 pages already set `document.title` via inline `useEffect`. Only add titles to the 3 missing pages (`Home.tsx`, `not-found.tsx`, `DesignSystem.tsx`) using the same pattern. Refactoring all pages to use a hook is unnecessary churn for a Size S story.
- **Do NOT use react-router** — This project uses Wouter.
- **Do NOT use `@tailwind` directives** — This is Tailwind v4.
- **Do NOT remove animations entirely** — Only disable them when `prefers-reduced-motion: reduce` is active. Users without this preference should keep all existing animations.
- **Do NOT modify shadcn/ui component source files individually** — Use a global CSS approach to disable animations for reduced motion, targeting the Tailwind animation utilities (`animate-in`, `animate-out`, `fade-in-*`, `zoom-in-*`, `slide-in-*`, etc.) used by shadcn components.
- **Do NOT break existing transitions** — The Story 8.1 CSS in `index.css` already handles `transition-duration: 0ms` under `prefers-reduced-motion: reduce`. Extend this, don't replace it.

### Gotchas & Integration Warnings

- **Existing reduced motion CSS** — `client/src/index.css` already has a `@media (prefers-reduced-motion: reduce)` rule that zeros out `transition-duration` for `body, body *`. This handles CSS transitions but does NOT handle CSS keyframe animations (the `animate-in`/`animate-out` classes from shadcn/ui) or Framer Motion's JavaScript-driven animations.
- **shadcn/ui animation classes** — Many shadcn components use Tailwind animation utilities like `animate-in`, `animate-out`, `fade-in-0`, `zoom-in-95`, `slide-in-from-*`. These use CSS `@keyframes` and `animation` properties, which are NOT affected by the existing `transition-duration: 0ms` rule. Need to add `animation-duration: 0ms !important` to the reduced motion media query.
- **Framer Motion** — The project uses Framer Motion (v12.23.24). If any Framer Motion `motion.*` components are used in custom code (not just shadcn), they may need the `useReducedMotion()` hook. Current codebase analysis shows Framer Motion is imported but not extensively used in custom components — the main concern is shadcn component animations.
- **TierSection already handles reduced motion** — `client/src/components/TierSection.tsx` already uses `motion-reduce:transition-none` Tailwind classes. This is correct and should not be modified.
- **Home page title** — The home page should just be "Katalyst Lexicon" (no prefix), matching the convention that the landing page is the app name itself.
- **DesignSystem.tsx** — This is likely an internal/dev page. Set its title to "Design System — Katalyst Lexicon".
- **`<main>` element needs an `id`** — Currently `<main className="flex-1 flex flex-col min-w-0 bg-background relative">` in Layout.tsx (line 213). Must add `id="main-content"` and `tabIndex={-1}` (to allow programmatic focus when skip link is clicked).

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/Layout.tsx` | MODIFY | Add skip link as first child element, add `id="main-content"` and `tabIndex={-1}` to `<main>` element |
| `client/src/index.css` | MODIFY | Extend `prefers-reduced-motion` media query to also zero out `animation-duration` for CSS keyframe animations (shadcn/ui), add skip link focus styles |
| `client/src/pages/Home.tsx` | MODIFY | Add `document.title = "Katalyst Lexicon"` via useEffect (just the app name for home) |
| `client/src/pages/not-found.tsx` | MODIFY | Add `document.title = "Page Not Found — Katalyst Lexicon"` via useEffect |
| `client/src/pages/DesignSystem.tsx` | MODIFY | Add `document.title = "Design System — Katalyst Lexicon"` via useEffect |

### Testing Expectations

- **Skip link testing** — Verify via Playwright that pressing Tab on page load reveals the skip link, and pressing Enter skips focus to main content area.
- **Page title testing** — Verify via Playwright that navigating to each page updates `document.title` correctly.
- **Reduced motion** — Verify CSS changes compile correctly; visual motion testing is subjective but the CSS rules can be inspected. Playwright can emulate `prefers-reduced-motion: reduce` and verify that animation/transition durations are zero.
- **Key ACs to automate**: AC1 (skip link visible on Tab), AC3 (page titles for key pages), AC5-6 (reduced motion disabling animations).
- **Test framework** — Vitest for API tests in `tests/api/`, Playwright (via Replit run_test) for e2e/visual tests.

### Dependencies & Environment Variables

- **No new packages required** — All tools are already installed (React, Tailwind v4, Lucide, Wouter).
- **No environment variables needed** — All changes are frontend-only.

### References

- [Epics: Story 8.2 acceptance criteria and dev notes] — `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md`, Epic 8 section
- [Architecture: AR13 (skip link), AR14 (page titles), AR16 (reduced motion)] — Epics file, Requirements Inventory section
- [Project Context: Technology stack, framework rules, anti-patterns] — `_bmad-output/project-context.md`
- [Story 8.1: Dark mode implementation and learnings] — `_bmad-output/implementation-artifacts/8-1-dark-mode-theme-system.md`
- [Layout Component: Current structure with `<main>` element] — `client/src/components/Layout.tsx`
- [CSS Theme and Reduced Motion: Existing rules] — `client/src/index.css`
- [TierSection: Existing motion-reduce pattern] — `client/src/components/TierSection.tsx`

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (via Replit Agent)

### Completion Notes

Implemented all 3 features for accessibility story 8.2:
1. **Skip link**: Added visually-hidden anchor as first child in Layout.tsx. Uses Tailwind `sr-only` with `focus:not-sr-only` to reveal on focus. Links to `#main-content` with `id` and `tabIndex={-1}` on `<main>`. Also added skip link and main-content target to not-found.tsx (which doesn't use Layout).
2. **Page titles**: Added `document.title` via `useEffect` to 3 missing pages (Home, not-found, DesignSystem). All 13 pages now set titles following the `{PageName} — Katalyst Lexicon` pattern, with Home using just "Katalyst Lexicon". All pages include cleanup functions.
3. **Reduced motion**: Extended existing `@media (prefers-reduced-motion: reduce)` in index.css to target decorative animation classes (animate-in, animate-out, fade-in/out, zoom-in/out, slide-in/out, spin-in/out) while preserving functional animations like loading spinners (animate-spin). All CSS transitions still zeroed out globally.

Key decisions:
- Used Tailwind utility classes for skip link styling (sr-only/focus:not-sr-only) rather than custom CSS
- Followed existing inline `useEffect` pattern for page titles per dev notes anti-pattern constraint
- Used targeted selectors for animation-duration in reduced-motion query to avoid freezing functional loading spinners
- Added skip link to not-found.tsx separately since it doesn't use Layout
- Replaced hardcoded gray colors in not-found.tsx with semantic theme tokens for dark mode compatibility

### Code Review Record

**Reviewed by:** Claude 4.6 Opus (adversarial BMAD code review)
**Date:** 2026-02-15
**Findings:** 1 HIGH, 2 MEDIUM, 3 LOW
**Resolution:** All HIGH and MEDIUM issues fixed in-session

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| H1 | HIGH | Blanket `animation-duration: 0ms` on `body *` froze 25+ loading spinners under reduced motion | Fixed: targeted only decorative animation classes |
| M1 | MEDIUM | not-found.tsx used hardcoded gray colors (`bg-gray-50`, `text-gray-900`) instead of theme tokens | Fixed: replaced with `bg-background`, `text-foreground`, `text-muted-foreground`, `text-destructive` |
| M2 | MEDIUM | not-found.tsx didn't use Layout, so skip link was absent on 404 page (AC1 gap) | Fixed: added skip link and `main-content` target directly |
| L1 | LOW | Home.tsx lacked useEffect cleanup function (inconsistent with other pages) | Fixed: added cleanup |
| L2 | LOW | `client/public/opengraph.jpg` changed in git but not in File List | Fixed: added to File List |
| L3 | LOW | Framer Motion compliance unverified per AC5 | Accepted: no `motion.*` components are used in codebase; FM v12 respects OS preference natively |

### File List

- `client/src/components/Layout.tsx` — MODIFIED: Added skip link anchor, added `id="main-content"` and `tabIndex={-1}` to `<main>`
- `client/src/index.css` — MODIFIED: Extended `prefers-reduced-motion` media query with targeted decorative animation selectors
- `client/src/pages/Home.tsx` — MODIFIED: Added `document.title = "Katalyst Lexicon"` via useEffect with cleanup
- `client/src/pages/not-found.tsx` — MODIFIED: Added page title, skip link, main-content target; replaced hardcoded colors with theme tokens
- `client/src/pages/DesignSystem.tsx` — MODIFIED: Added `document.title = "Design System — Katalyst Lexicon"` via useEffect
- `client/public/opengraph.jpg` — MODIFIED: Updated Open Graph image

### Testing Summary

- **Test approach**: Playwright e2e testing via Replit run_test
- **ACs covered**: AC1 (skip link visible on Tab, Enter moves focus — including 404 page), AC2 (skip link visually hidden when not focused), AC3 (page titles for 9+ pages verified), AC4 (title updates on navigation), AC5-6 (reduced motion disables decorative animations while preserving spinners), AC7 (theme toggle instant under reduced motion — covered by CSS rule)
- **All tests passing**: Yes
- **LSP Status**: Clean — no errors or warnings in any modified files
- **Visual Verification**: Playwright screenshots confirmed skip link behavior and page rendering
