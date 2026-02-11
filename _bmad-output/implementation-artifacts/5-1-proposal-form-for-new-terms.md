# Story 5.1: Proposal Form for New Terms

Status: ready-for-dev

## Story

As a team member who encounters a term the team uses that isn't in the lexicon,
I want to propose a new term through a guided form with progressive disclosure, duplicate detection, and pre-fill from governance bridges,
So that I can contribute new vocabulary without friction and feel confident my proposal will be reviewed.

## Acceptance Criteria

**Form Layout & Progressive Disclosure:**

1. **Given** I navigate to the proposal form page (via "+ Propose Term" in sidebar navigation, "Propose this term" CTA from search empty state, or "Propose a term" CTA from an empty category on the browse page — route: `/propose`), **When** the page loads, **Then** I see a form with required fields always visible: Term Name, Category (dropdown), Definition, and Why It Exists. An "Add more detail" collapsible section contains optional fields: When to Use, When Not to Use, Good Examples, Bad Examples, and Synonyms. The form heading reads "Propose a New Term" and the form uses conversational librarian-voice labels (e.g., "What's the term?", "What does this term mean?", "Why does this term exist?").

2. **Given** I click the "Add more detail" toggle, **When** the collapsible expands, **Then** I see the optional fields (When to Use, When Not to Use, Good Examples, Bad Examples, Synonyms) and the toggle text changes to indicate the section is expanded. The collapsible is closed by default to keep the contribution barrier low.

**Duplicate Detection:**

3. **Given** I type a term name and leave the field (blur), **When** similar existing terms are found, **Then** I see an inline amber warning below the name field: "Heads up — a similar term already exists" with a link to the existing term. Only exact name matches and "name starts with" matches (search ranking tiers 1-2) trigger the warning. Definition/synonym matches (tiers 3-4) do not trigger it to avoid false positives.

4. **Given** I type a term name with fewer than 2 characters, **When** I blur the field, **Then** no duplicate check is triggered.

5. **Given** no similar terms exist for my entered name, **When** I blur the name field, **Then** no duplicate warning is shown.

**Form Validation:**

6. **Given** required fields are all empty, **When** I view the submit button, **Then** it appears disabled with reduced opacity.

7. **Given** I fill out all required fields correctly, **When** I view the submit button, **Then** it becomes enabled (green, primary style).

8. **Given** I leave a required field empty, **When** I try to submit, **Then** I see inline validation errors on the empty fields and the form does not submit.

9. **Given** I fill in a field correctly, **When** I tab away from the field (blur), **Then** I see a green checkmark next to the field indicating it's valid.

**Submission:**

10. **Given** I fill out all required fields and click "Submit Proposal", **When** the submission succeeds, **Then** the proposal is created with status "pending" and I see a success toast (4-second auto-dismiss): "Your proposal has been submitted for review" and I am navigated back to the home page.

11. **Given** submission fails (server error), **When** the error occurs, **Then** I see a persistent error toast (does not auto-dismiss): "Something went wrong. Please try again." and my form data is preserved so I don't lose my work.

**Examples & Synonyms Inputs:**

12. **Given** I want to add good or bad usage examples, **When** I type in the example input and click the add button (or press Enter), **Then** the example appears as a list item below with a green checkmark (good) or red X (bad) indicator and a remove button. I can add multiple examples.

13. **Given** I want to add synonyms, **When** I type a synonym and click the add button (or press Enter), **Then** the synonym appears as a chip/badge with a remove button. I can add multiple synonyms.

**URL Pre-fill:**

14. **Given** I arrived at the proposal page via "Propose this term" from a search empty state, **When** the page loads, **Then** the Term Name field is pre-filled with the search query from the URL parameter (`?name={query}`).

15. **Given** I arrived via a "Propose a term" CTA from an empty category, **When** the page loads, **Then** the Category dropdown is pre-filled with that category from the URL parameter (`?category={categoryName}`).

16. **Given** I arrived with both URL parameters (`?name=Sprint&category=Planning%20%26%20Execution`), **When** the page loads, **Then** both the Term Name and Category fields are pre-filled.

**Unsaved Changes Guard:**

17. **Given** I have entered data into the form, **When** I navigate away without submitting (clicking a link, pressing back, etc.), **Then** I see a confirmation dialog: "You have unsaved changes. Leave anyway?" and I can choose to stay or leave.

**Accessibility:**

18. **Given** I am using a screen reader, **When** I interact with the form, **Then** all fields have associated labels, required fields are marked with `aria-required`, validation errors are announced via `aria-describedby` linked to error messages, and success/error toasts are announced via `aria-live` regions.

## Dev Notes

### Architecture Patterns to Follow

- **Storage interface pattern**: All database operations go through `IStorage` interface in `server/storage.ts`. The existing `createProposal()` method handles the database insert. Source: Architecture AD-2.
- **Schema-first types**: The `proposals` table and `insertProposalSchema` are already defined in `shared/schema.ts`. Use the existing Zod schema for request validation. Source: Architecture AD-3.
- **API route pattern**: `POST /api/proposals` route already exists in `server/routes.ts` and validates with `insertProposalSchema.parse(req.body)`. Source: Pattern 1.
- **TanStack Query**: Use existing `api.proposals.create()` from `client/src/lib/api.ts` for the mutation. Invalidate `["/api/proposals"]` on success. Source: Pattern 2.
- **React Hook Form + Zod resolver**: Consistent with existing form implementations in the codebase. Source: Pattern 3.
- **Wouter routing**: Use `useLocation` and `useSearch` from `wouter` for navigation and URL parameter parsing. Source: AD-4.
- **shadcn/ui components**: Use existing `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`, `Input`, `Textarea`, `Select`, `Button`, `Badge`, `Collapsible` from `@/components/ui/`. Source: AD-7.
- **Toast notifications**: Use `useToast()` hook. Success toasts auto-dismiss (4s default). Error toasts should use `variant: "destructive"` and remain persistent (set `duration: Infinity` or large value). Source: UX9.
- **Button hierarchy**: Primary green "Submit Proposal" button (`variant="default"`), disabled until required fields valid. Source: UX13.
- **Conversational form labels**: Use librarian voice: "What's the term?", "What does this term mean?", "Why does this term exist?", "When should someone use this?", "When should someone NOT use this?". Source: UX4, Voice Principle.
- **Freshness and data-testid**: All interactive elements and meaningful display elements must have `data-testid` attributes. Source: NFR6, project-context.md.
- **Brand colors**: Use `kat-green` for valid fields, `kat-warning` for duplicate detection amber. Never hardcode hex values — use Katalyst brand tokens. Source: project-context.md.

### UI/UX Deliverables

- **Proposal Form page** (`client/src/pages/ProposeTerm.tsx`): Major refactor of the existing page to add:
  - Progressive disclosure: `Collapsible` component wrapping optional fields (When to Use, When Not to Use, Good Examples, Bad Examples, Synonyms) with "Add more detail" toggle
  - Conversational librarian-voice form labels replacing the current generic labels
  - Inline validation with green checkmark on blur for valid fields
  - Disabled submit button until all required fields pass validation
  - Duplicate detection warning on term name blur
  - Unsaved changes confirmation dialog on navigation
  - URL parameter pre-fill for `?category=` parameter (currently only `?name=` is supported)
- **Form states**: Loading (submit button spinner — already implemented), Error (inline field validation + persistent toast), Success (4s auto-dismiss toast + navigation to home)
- **Duplicate detection UI**: Amber warning banner below the term name field with a link to the existing term. Uses the existing search API `GET /api/terms/search?q={name}`.

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate ProposalForm component file — keep the form within `ProposeTerm.tsx` as it currently is. The component is page-specific and the epics reference `ProposalForm` as a logical component, not a separate file.
- **DO NOT** modify `shared/schema.ts` — the `proposals` table and schemas are already complete for new term proposals. Story 5.2 (edit proposals) may need schema changes, but 5.1 does not.
- **DO NOT** modify `server/routes.ts` or `server/storage.ts` — the `POST /api/proposals` endpoint and `createProposal()` storage method already work correctly for new term proposals.
- **DO NOT** reference `client/src/lib/mockData.ts` — it uses snake_case field names inconsistent with the API. Source: project-context.md.
- **DO NOT** use `react-router` — use `wouter` exclusively. Source: project-context.md.
- **DO NOT** use `@tailwind` directives — this is Tailwind v4 with `@import "tailwindcss"` and `@theme inline`. Source: project-context.md.
- **DO NOT** use `heroicons` or `react-icons` — use `lucide-react` for icons. Source: project-context.md.
- **DO NOT** add hover animations or transitions without respecting `prefers-reduced-motion`. Source: AR16.

### Gotchas & Integration Warnings

- **Existing ProposeTerm.tsx has edit mode logic**: The current component handles both new and edit modes via the `?editTermId=` URL parameter. Story 5.1 focuses on the NEW term flow only. The edit mode enhancements are Story 5.2. Be careful not to break the existing edit mode while refactoring for 5.1.
- **Form field naming mismatch**: The current form uses `why_exists`, `used_when`, `not_used_when` (snake_case) internally, then maps to `whyExists`, `usedWhen`, `notUsedWhen` (camelCase) in the mutation function before sending to the API. This mapping is correct and must be preserved.
- **Category pre-fill uses category name, not ID**: The URL parameter `?category=` passes the category name (e.g., `Planning & Execution`), which is the value used in the Select dropdown (categories are referenced by name in the proposals table, not by ID).
- **Duplicate detection timing**: Trigger on blur of the name field, NOT on every keystroke. Use the existing search API `GET /api/terms/search?q={name}`. Only surface results where the term name is an exact match or starts-with match (tiers 1-2 from the SQL scoring). Filter out results that only match on definition/synonym content.
- **Toast duration**: The existing `useToast` hook may not support custom durations out of the box. Check the shadcn/ui toast implementation — it may need a `duration` parameter to support persistent error toasts.
- **Unsaved changes guard**: The `beforeunload` event handles browser navigation (closing tab, refreshing), but wouter internal navigation needs a separate guard. Consider using wouter's navigation hooks or React state to detect internal navigation and show a confirmation dialog.
- **Collapsible component**: Check if `@/components/ui/collapsible.tsx` exists. If not, it needs to be added from shadcn/ui before implementing progressive disclosure.
- **The submit currently uses `submittedBy: "Current User"` hardcoded** — this is expected since auth is not wired yet (AD-10 note). Do not change this.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/ProposeTerm.tsx` | MODIFY | Major refactor: add progressive disclosure (Collapsible for optional fields), conversational labels, inline validation with checkmarks, duplicate detection on name blur, unsaved changes guard, URL category pre-fill, disabled submit button until valid |
| `client/src/components/ui/collapsible.tsx` | CREATE (if missing) | shadcn/ui Collapsible component needed for progressive disclosure |

### Dependencies & Environment Variables

- **No new packages needed** — all required libraries are already installed: `react-hook-form`, `@hookform/resolvers`, `zod`, `@tanstack/react-query`, `wouter`, `lucide-react`, `@radix-ui/react-collapsible`
- **Check for `@radix-ui/react-collapsible`** — needed for the shadcn/ui Collapsible component. If not in `package.json`, install it.
- **No new environment variables needed**

### References

- [Source: _bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md#Epic 5 Story 5.1] — Full acceptance criteria and dev notes for the proposal form
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-11 through AD-16] — UX-driven architecture decisions including ProposalForm, empty states, button hierarchy
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey 4] — Propose New Term user journey flow
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns] — Progressive disclosure, conversational labels, inline validation, duplicate detection
- [Source: _bmad-output/project-context.md] — Critical implementation rules, technology stack, anti-patterns
- [Source: shared/schema.ts] — Existing proposals table definition and insert schema
- [Source: client/src/pages/ProposeTerm.tsx] — Existing proposal form implementation to refactor
- [Source: client/src/lib/api.ts] — Existing API client with `api.proposals.create()`, `api.terms.search()`

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

### File List
