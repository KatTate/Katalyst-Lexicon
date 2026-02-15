# Story 8.4: WCAG 2.1 AA Compliance Audit

Status: review

## Story

As a product team,
I want a formal accessibility audit of the completed application,
so that we can confirm WCAG 2.1 AA compliance and fix any gaps before launch.

## Acceptance Criteria

1. **Given** the application is feature-complete, **When** an accessibility audit is performed using axe-core automated scanning, **Then** every page is tested for: color contrast (4.5:1 normal text, 3:1 large text and UI components), keyboard navigability, screen reader compatibility, focus management, and ARIA attribute correctness.

2. **Given** the audit identifies violations, **When** results are documented, **Then** each issue includes: severity (Critical / Major / Minor), affected component or page, specific WCAG 2.1 criterion violated (e.g., 1.4.3 Contrast), and a recommended fix with enough detail for the dev agent to act on.

3. **Given** the audit is complete, **When** results are reviewed, **Then** all Critical and Major issues are resolved in-place as part of this story, **And** Minor issues are documented as follow-up tasks in the audit report but not required to be fixed before story completion.

4. **Given** the audit covers all key user flows, **When** the following are tested, **Then** each passes automated axe-core scanning AND manual keyboard-navigation checks:
   - **Search flow:** Home page SearchHero combobox — ARIA roles (`role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-live="polite"`), keyboard navigation (Down/Up/Enter/Escape/Tab), focus management
   - **Term detail:** Progressive disclosure TierSections — `aria-expanded` state, focus within expandable sections, breadcrumb navigation
   - **Browse:** Category sidebar, status/visibility filters, term grid — keyboard operability, filter announcements
   - **Proposal form:** Field validation — `aria-describedby` linking errors to fields, `aria-invalid="true"` on invalid fields, progressive disclosure collapsible
   - **Review actions:** Confirmation dialogs — focus trapping, Escape to close, Enter does NOT confirm destructive actions (AR15), focus returns to trigger on close
   - **Navigation:** Skip link functionality (bypasses header/nav), role-filtered navigation items, landmark regions (`<main>`, `<nav>`, `<aside>`)
   - **Mobile Spotlight search:** Full-screen Sheet overlay — focus trapping, Escape to close, focus return

5. **Given** the audit includes a `data-testid` coverage check, **When** all interactive elements (buttons, inputs, links, selects, toggles) and key display elements (term cards, status badges, user data, dynamic content) are examined across all pages, **Then** any elements missing `data-testid` attributes are documented as issues with recommended testid values following the naming convention: interactive `{action}-{target}`, display `{type}-{content}-{id}`.

6. **Given** the audit tests dark mode, **When** all pages are scanned in dark mode, **Then** color contrast violations specific to dark mode are identified and fixed separately from light mode issues.

7. **Given** the audit tests responsive viewports, **When** pages are tested at 375px (mobile), 768px (tablet), and 1280px (desktop), **Then** touch target sizing is verified (minimum 44x44px for all tappable elements on mobile per AR17), and any viewport-specific accessibility issues are documented.

8. **Given** the audit produces a final report, **When** the report is saved to `_bmad-output/implementation-artifacts/accessibility-audit.md`, **Then** it includes: executive summary, methodology, per-page results table, issues found with severity/criterion/fix, issues resolved during this story, and remaining minor issues as follow-up tasks.

## Dev Notes

### Architecture Patterns to Follow

- **axe-core integration pattern** — Use `@axe-core/playwright` (v4.11.1) with `new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()` to scan each page. Run scans in both light and dark mode by toggling the `.dark` class on `<html>`. Run at three viewports: 375px, 768px, 1280px. (Source: Architecture AD-15, UX UX17)
- **Storage interface pattern** — If fixes require backend changes (unlikely for a11y), ALL database operations go through `IStorage` in `server/storage.ts`. Routes remain thin. (Source: project-context.md, AD-2)
- **Tailwind v4 syntax** — Any CSS fixes use `@import "tailwindcss"` and `@theme inline`, NOT `@tailwind` directives. Use Tailwind's existing utility classes (`sr-only`, `focus-visible:ring-2`, etc.) for accessibility fixes. (Source: project-context.md, AD-6)
- **`cn()` utility** — Use for className merging when modifying component styles. (Source: project-context.md)
- **Lucide React icons** — If any a11y fixes require icons (e.g., adding decorative icons with `aria-hidden`), use `lucide-react`. (Source: project-context.md)
- **Component ARIA requirements** — Follow the ARIA Implementation Map from AD-15 exactly:

  | Component | Required ARIA |
  |-----------|---------------|
  | SearchHero | `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-live="polite"` for result count |
  | StatusBadge | `aria-label="Status: {status}"` (never color alone) |
  | TierSection | `aria-expanded="true/false"` on toggle, `aria-controls` linking to content |
  | Layout | Skip link as first focusable, `<main>`, `<nav>`, `<aside>` landmarks |
  | ProposalForm | `aria-describedby` linking errors to fields, `aria-invalid="true"` on invalid |
  | Toasts | `role="status"` or `aria-live="polite"` |
  | Modals/Sheets | Focus trapped inside, Escape to close, focus returns to trigger |

- **`data-testid` naming convention** — Interactive: `{action}-{target}` (e.g., `button-submit`), Display: `{type}-{content}` (e.g., `text-username`), Dynamic: append ID (e.g., `card-term-${termId}`). (Source: project-context.md, NFR6)
- **Existing test infrastructure** — Vitest for API tests in `tests/api/`, Playwright (via Replit run_test) for e2e tests. Story 8.3 added Playwright e2e tests covering Epics 1, 2, 4. (Source: sprint-status.yaml)

### Anti-Patterns & Hard Constraints

- **Do NOT restructure components for audit purposes** — This is a verify + fix story. Make targeted, minimal fixes. Do not refactor component architecture.
- **Do NOT remove existing `data-testid` attributes** — Only add missing ones. Existing testids are used by the Story 8.3 Playwright test suite.
- **Do NOT modify shadcn/ui source files in `client/src/components/ui/`** unless absolutely necessary for a Critical a11y fix (e.g., missing ARIA attribute in a primitive). If a shadcn component needs ARIA, prefer adding it at the usage site (wrapper or prop) rather than modifying the source primitive.
- **Do NOT use `@tailwind` directives** — This is Tailwind v4. (Source: project-context.md)
- **Do NOT use react-router** — This project uses Wouter. (Source: project-context.md)
- **Do NOT break existing reduced-motion CSS** — Story 8.2 added `animation-duration: 0ms !important` and `transition-duration: 0ms` under `@media (prefers-reduced-motion: reduce)` in `index.css`. Do not remove or weaken these rules.
- **Do NOT break existing skip link** — Story 8.2 added a skip link in `Layout.tsx` as the first child element. Do not move or remove it.
- **Do NOT break existing page titles** — Story 8.2 confirmed all 13 pages set `document.title`. Do not change the title format.
- **Do NOT introduce new npm packages beyond `@axe-core/playwright`** — Use built-in browser APIs and existing project tooling for manual checks.
- **`mockData.ts` is LEGACY** — Do NOT reference `client/src/lib/mockData.ts`. It uses snake_case inconsistent with the API. (Source: project-context.md)

### Gotchas & Integration Warnings

- **Dark mode contrast is separate from light mode** — Some color combinations may pass in light mode but fail in dark mode (or vice versa). The audit MUST test both themes. Theme toggle uses `.dark` class on `<html>` element, persisted in localStorage. Toggle is in the header.
- **SearchHero has two render modes** — Desktop uses Popover dropdown; mobile (< 768px) uses Sheet (Spotlight overlay). Both must be audited separately for ARIA compliance and focus management. The component conditionally renders based on `useMediaQuery`.
- **Spotlight/Sheet focus trapping** — shadcn Sheet component should handle focus trapping via Radix Dialog internally, but verify it works correctly in the mobile Spotlight search context.
- **Confirmation dialogs (AR15)** — Enter must NOT confirm destructive actions. The existing implementation uses AlertDialog with autoFocus on Cancel. Verify this pattern is consistent across all confirmation dialogs (delete category, reject proposal, withdraw proposal, etc.).
- **Toast accessibility** — The toast system uses shadcn/ui Toaster. Verify toasts have `role="status"` or use `aria-live="polite"`. Success toasts auto-dismiss after 4 seconds; error toasts persist. Screen readers should announce toast content.
- **Status badges rely on color** — StatusBadge has 4 variants (Canonical/green, Deprecated/amber, Draft/gray, In Review/blue). Verify each has an `aria-label` and is not color-only (NFR7 — colorblind-friendly).
- **Existing `data-testid` coverage is partial** — 20 files have testids but coverage varies. Some pages have thorough coverage (ManageCategories: 22, ProposeTerm: 33), others are lighter. The audit should flag gaps systematically.
- **Form validation pattern** — ProposalForm uses React Hook Form + Zod resolver. Verify that field errors are linked via `aria-describedby` and fields get `aria-invalid` when validation fails. The shadcn Form components may handle some of this automatically via Radix primitives.
- **Mobile touch targets** — AR17 requires 44x44px minimum. Check all buttons, links, and interactive elements at 375px viewport. Common offenders: icon-only buttons in headers, close buttons on modals, filter chips.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `_bmad-output/implementation-artifacts/accessibility-audit.md` | CREATE | Full audit report with methodology, per-page results, issues, and fixes |
| `client/src/components/SearchHero.tsx` | MODIFY (if needed) | Fix ARIA attributes on combobox if audit finds gaps |
| `client/src/components/StatusBadge.tsx` | MODIFY (if needed) | Add `aria-label` if missing, ensure not color-only |
| `client/src/components/TierSection.tsx` | MODIFY (if needed) | Verify `aria-expanded`, `aria-controls` |
| `client/src/components/Layout.tsx` | MODIFY (if needed) | Verify landmark roles, skip link integrity |
| `client/src/components/TermCard.tsx` | MODIFY (if needed) | Add missing `data-testid` or ARIA if found |
| `client/src/components/EmptyState.tsx` | MODIFY (if needed) | Add missing `data-testid` or ARIA if found |
| `client/src/pages/*.tsx` | MODIFY (if needed) | Fix contrast, add missing `data-testid`, fix ARIA on page-level elements |
| `client/src/index.css` | MODIFY (if needed) | Fix contrast values in CSS custom properties if audit finds failures |

### Testing Expectations

- **Primary testing tool** — `@axe-core/playwright` for automated WCAG 2.1 AA scanning of every page
- **Manual keyboard testing** — Navigate through all critical flows using only keyboard (Tab, Shift+Tab, Enter, Escape, Arrow keys). Verify visible focus indicators on all interactive elements.
- **Dark mode testing** — Run full axe-core scan with `.dark` class active on `<html>`
- **Viewport testing** — Run axe-core at 375px, 768px, and 1280px for each page
- **Test framework** — Playwright via Replit `run_test` for e2e validation of fixes. Vitest tests in `tests/api/` should NOT be modified.
- **ACs that need automated coverage** — AC1 (axe-core scan all pages), AC4 (key flow keyboard navigation), AC5 (data-testid coverage), AC6 (dark mode scan), AC7 (viewport/touch target check)
- **After fixes** — Re-run axe-core scans to confirm Critical/Major issues are resolved. Include before/after violation counts in audit report.

### Dependencies & Environment Variables

- **New package:** `@axe-core/playwright` v4.11.1 — install as dev dependency for automated WCAG scanning
- **Existing packages (do NOT reinstall):** React 19.2.0, Tailwind CSS 4.1.14, shadcn/ui (Radix), Wouter 3.3.5, TanStack Query 5.60.5, Lucide React 0.545.0, Framer Motion 12.23.24
- **No environment variables needed** — All changes are frontend-focused a11y fixes

### References

- [Epics: Story 8.4 acceptance criteria and dev notes] — `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md`, Epic 8 section (lines 1512-1549)
- [Architecture: AD-15 Accessibility-First Component Design] — `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md` (lines 604-629)
- [Architecture: AR12-AR17 accessibility requirements] — Epics file, Requirements Inventory section (lines 107-117)
- [Architecture: ARIA Implementation Map] — Architecture doc, AD-15 section
- [UX Spec: WCAG compliance, touch targets, dark mode] — `_bmad-output/planning-artifacts/ux-design-specification.md`
- [Project Context: Technology stack, framework rules, anti-patterns] — `_bmad-output/project-context.md`
- [Story 8.1: Dark mode implementation] — `_bmad-output/implementation-artifacts/8-1-dark-mode-theme-system.md`
- [Story 8.2: Skip link, page titles, reduced motion] — `_bmad-output/implementation-artifacts/8-2-skip-link-page-titles-and-reduced-motion.md`
- [Sprint Status: Story 8.3 in-progress] — `_bmad-output/implementation-artifacts/sprint-status.yaml`
- [@axe-core/playwright v4.11.1 documentation] — https://www.npmjs.com/package/@axe-core/playwright

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Completion Notes

### File List

### Testing Summary
