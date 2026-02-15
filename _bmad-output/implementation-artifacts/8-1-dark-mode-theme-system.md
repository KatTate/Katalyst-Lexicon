# Story 8.1: Dark Mode and Theme System

Status: review

## Story

As a user who prefers dark mode,
I want the application to respect my system theme preference and provide a manual toggle,
so that I can use the lexicon comfortably in low-light environments.

## Acceptance Criteria

**Given** my operating system is set to dark mode
**When** I visit the application for the first time (no stored preference)
**Then** the application renders in dark mode automatically

**Given** my operating system is set to light mode
**When** I visit the application for the first time (no stored preference)
**Then** the application renders in light mode

**Given** I am using the application on desktop
**When** I look at the top-right area of the header (sidebar)
**Then** I see a theme toggle button showing a Sun icon (in dark mode) or Moon icon (in light mode)

**Given** I am using the application on mobile
**When** I look at the mobile header bar
**Then** I see a theme toggle button showing a Sun icon (in dark mode) or Moon icon (in light mode)

**Given** I click the theme toggle
**When** the theme switches from light to dark (or vice versa)
**Then** all pages, components, and text update to the new theme
**And** the transition is smooth (CSS transition on background-color and color)
**And** if `prefers-reduced-motion: reduce` is enabled, the transition is instant (no animation)
**And** my preference is saved to localStorage and persists across sessions and page reloads

**Given** I previously chose dark mode via the toggle
**When** I visit the application in a new session
**Then** the application renders in dark mode regardless of my OS setting (localStorage overrides system preference)

**Given** I am in dark mode
**When** I view status badges (Canonical/green, Deprecated/amber, Draft/gray, In Review/blue)
**Then** all badges maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
**And** each status remains visually distinguishable

**Given** I am in dark mode
**When** I view cards, forms, toasts, dialogs, and all UI components
**Then** all components render with proper dark mode styling using the defined CSS custom properties
**And** text is legible with adequate contrast against dark backgrounds

**Given** I am in dark mode viewing a principle with markdown body content
**When** the body includes code blocks, blockquotes, links, or headings
**Then** all markdown-rendered elements have proper dark mode styling and remain legible

**Given** I am in dark mode
**When** I view category color swatches or tags
**Then** category colors remain distinguishable against the dark background

## Dev Notes

### Architecture Patterns to Follow

- **CSS custom properties for theming** — The project already defines light/dark token values in `client/src/index.css` via `:root` and `.dark` selectors. All semantic colors (`--background`, `--foreground`, `--card`, `--primary`, etc.) swap via these HSL variables. The theme toggle only needs to add/remove the `dark` class on the `<html>` element.
- **Tailwind v4 dark variant** — Already configured via `@custom-variant dark (&:is(.dark *));` in `client/src/index.css`. Use `dark:` prefix in Tailwind classes only when component-level overrides are needed beyond what the CSS variables handle.
- **Lucide React icons** — Use `Sun` and `Moon` icons from `lucide-react` (the project's icon library). Do NOT use heroicons or react-icons.
- **`cn()` utility** — Use for className merging: `cn("base-class", conditional && "extra")`.
- **`data-testid` required** — The theme toggle button must have `data-testid="button-theme-toggle"`.
- **Wouter for routing** — Do NOT use react-router.
- **Component file conventions** — PascalCase for React component files. The toggle can be a small component inlined into Layout.tsx or a separate `ThemeToggle.tsx` in `client/src/components/`.

### UI/UX Deliverables

- **Theme toggle button** — Icon button (Sun/Moon) in the sidebar header area (desktop) and in the mobile header bar. Should match the existing button sizing and styling patterns (ghost variant, `min-h-[44px] min-w-[44px]` for mobile touch targets per AR17).
- **Desktop placement** — In the sidebar, near the logo/brand area at the top, or in the sidebar footer near the user profile section. The sidebar header (`p-6 border-b`) is a natural location next to the "Internal V1.0" text area.
- **Mobile placement** — In the mobile header bar (`lg:hidden flex items-center`), alongside the search icon and hamburger menu buttons.
- **Visual states** — Sun icon when in dark mode (click to switch to light), Moon icon when in light mode (click to switch to dark). The button should use the `ghost` variant to match existing header buttons.
- **Transition** — Smooth color transition on `background-color` and `color` properties (~200ms), disabled when `prefers-reduced-motion: reduce` is active (AR16).

### Anti-Patterns & Hard Constraints

- **Do NOT use per-component `dark:` overrides as the primary strategy** — The CSS custom property system is already set up in `index.css`. Most components will automatically theme correctly because they use semantic Tailwind classes (`bg-background`, `text-foreground`, `bg-card`, etc.). Only add `dark:` overrides for edge cases where the CSS variables don't cover a specific need.
- **Do NOT install any new theme libraries** (e.g., `next-themes`) — The project doesn't use Next.js. Implement a lightweight theme hook/provider using localStorage + `prefers-color-scheme` media query.
- **Do NOT use `react-router`** — This project uses Wouter.
- **Do NOT use `@tailwind` directives** — This is Tailwind v4 using `@import "tailwindcss"` and `@theme inline`.
- **Do NOT hardcode hex colors** — Use the existing Katalyst brand tokens (`kat-green`, `kat-charcoal`, etc.) and semantic tokens (`text-foreground`, `bg-background`, etc.).
- **Do NOT reference `client/src/lib/mockData.ts`** — It's legacy with inconsistent field naming.
- **Do NOT break the existing `.dark` CSS block** in `index.css` — It already has correct HSL values for all semantic tokens. Preserve it as-is.
- **Do NOT add flash of wrong theme (FOWT)** — The theme class must be applied to `<html>` before React hydrates. Use an inline script in `client/index.html` to read localStorage and apply the `dark` class synchronously.

### Gotchas & Integration Warnings

- **Heading colors** — The `@layer base` rule in `index.css` applies `text-kat-black` to all headings (`h1`–`h6`). In dark mode, `--color-kat-black` is `hsl(27 6% 23%)` which is dark and will be invisible on a dark background. This MUST be fixed with a dark mode override: headings should use `text-foreground` in dark mode, or the base rule should be updated to use a semantic token instead of `text-kat-black`.
- **`.text-intro`, `.text-supporting`, `.text-metadata` utility classes** — These use `text-kat-charcoal` which is also a dark color. They need dark mode overrides or should be refactored to use semantic tokens.
- **StatusBadge component** — Currently uses hardcoded background/text color combinations for each status variant. Verify these remain accessible (contrast ratio ≥ 4.5:1) in dark mode. May need `dark:` overrides for badge background colors.
- **Markdown rendering in principles** — If rendered via `dangerouslySetInnerHTML` or a markdown library, code blocks and blockquotes may use hardcoded light-mode colors. Add CSS rules for `.dark` to style `pre`, `code`, `blockquote`, `a` elements within markdown content.
- **Category color swatches** — Categories have hex colors stored in the database. These colors are user-defined and may not have sufficient contrast on dark backgrounds. Consider adding a subtle border or background container around color swatches in dark mode.
- **Flash of unstyled content** — Without the inline script in `index.html`, the page will flash light mode before React loads and applies the dark class. The inline script pattern is essential.
- **Framer Motion animations** — The project uses Framer Motion. Animations should respect `prefers-reduced-motion` via the `useReducedMotion()` hook or CSS media query.
- **shadcn/ui components** — Most shadcn components (`Dialog`, `Popover`, `Sheet`, `Toast`, etc.) already support dark mode through CSS variables. No changes needed for these unless custom styling was applied.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/index.html` | MODIFY | Add inline script before `<div id="root">` to apply `dark` class from localStorage synchronously, preventing FOWT |
| `client/src/index.css` | MODIFY | Fix heading dark mode (replace `text-kat-black` with semantic token or add dark override), fix `.text-intro`/`.text-supporting`/`.text-metadata` for dark mode, add markdown content dark mode styles |
| `client/src/components/Layout.tsx` | MODIFY | Add theme toggle button in sidebar header and mobile header bar |
| `client/src/hooks/use-theme.ts` | CREATE | Custom hook: reads localStorage + `prefers-color-scheme`, toggles `dark` class on `<html>`, persists preference |
| `client/src/components/StatusBadge.tsx` | MODIFY | Audit and fix badge color contrast in dark mode if needed |

### Testing Expectations

- **Visual verification via Playwright** — Dark mode toggle should be testable by clicking the toggle button and verifying CSS class changes on `<html>`.
- **Key ACs to automate:** Toggle persists across page reload (localStorage); system preference detection on first visit; all major pages render without contrast issues in dark mode.
- **Test framework** — Vitest exists for API tests; Playwright (via Replit run_test) for e2e/visual tests.
- **Existing test files** — `tests/api/` directory contains API tests; this story is purely frontend so no API tests needed.

### Dependencies & Environment Variables

- **No new packages required** — All needed tools are already installed (Lucide icons, Tailwind v4, React).
- **No environment variables needed** — Theme preference stored in localStorage (client-side only).

### References

- [Epics: Story 8.1 acceptance criteria and dev notes] — `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md`, Epic 8 section
- [Project Context: Technology stack, framework rules, anti-patterns] — `_bmad-output/project-context.md`
- [CSS Theme Tokens: `:root` and `.dark` definitions] — `client/src/index.css`
- [Layout Component: Current header structure] — `client/src/components/Layout.tsx`
- [AR13-AR17, UX16: Architecture and UX requirements] — Epics file, Requirements Inventory section

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (via Replit Agent)

### Completion Notes

Implemented dark mode theme system with system preference detection, manual toggle, localStorage persistence, and FOWT prevention. Fixed heading and text utility classes that used hardcoded brand colors (text-kat-black, text-kat-charcoal) to use semantic tokens (text-foreground, text-muted-foreground) so they automatically adapt in dark mode. Added smooth CSS transitions (200ms) with prefers-reduced-motion respect. Added dark mode styles for markdown content (code blocks, blockquotes, links, headings). Fixed StatusBadge contrast for Draft (dark:text-yellow-300) and In Review (dark:text-kat-mystical) statuses.

### File List

- `client/index.html` — MODIFIED: Added inline script before #root to apply dark class from localStorage synchronously
- `client/src/hooks/use-theme.ts` — CREATED: Custom hook for theme management (localStorage + prefers-color-scheme + toggle)
- `client/src/index.css` — MODIFIED: Fixed heading colors (text-kat-black → text-foreground), fixed text-intro/supporting/metadata utility classes, added CSS transitions with reduced-motion, added dark mode markdown content styles
- `client/src/components/Layout.tsx` — MODIFIED: Added theme toggle button (Sun/Moon) in sidebar header and mobile header bar
- `client/src/components/StatusBadge.tsx` — MODIFIED: Added dark mode text color overrides for Draft and In Review statuses

### Testing Summary

- **Test approach**: End-to-end Playwright testing via run_test tool
- **ACs covered**: System preference detection on first visit, toggle switching between light/dark, localStorage persistence across reload, desktop sidebar toggle visibility, mobile header toggle visibility, all pages rendering correctly in dark mode (browse with term cards/status badges, principles), smooth transitions
- **Result**: All 19 test steps passed
- **LSP Status**: Clean — no errors or warnings in any modified files
- **Visual Verification**: Screenshots verified across homepage, browse, principles pages in both light and dark modes, and mobile viewport
