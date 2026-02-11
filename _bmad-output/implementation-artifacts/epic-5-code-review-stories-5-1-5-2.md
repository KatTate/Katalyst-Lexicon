# Epic 5: Propose & Contribute — Code Review

Date: 2026-02-11
Reviewer: Claude 4.6 Opus (Architect Agent)
Stories Reviewed: 5.1, 5.2
Git Range: 7ea74b2..29075e5

## Review Summary

Epic 5 implementation is clean across both stories (34 combined ACs). Code quality is high with zero bugs found — a first for this project. All acceptance criteria are met, all Dev Notes constraints are complied with, and the single-file approach keeps coordination overhead minimal. Seven LOW severity findings identified (3 new, 4 carry-forward from prior epics), none blocking.

## Git vs Story Discrepancies

**Files changed in git but NOT in any Story File List:**
1. `client/public/opengraph.jpg` — Modified (binary, incidental asset update)
2. `replit.md` — Modified (project documentation, process artifact not implementation)

**Files in Story File Lists but NOT changed in git:**
- None. Both stories list `client/src/pages/ProposeTerm.tsx` as the only implementation file, and it was modified.

**Files changed in git and in Story File Lists (verified):**
1. `client/src/pages/ProposeTerm.tsx` — Stories 5.1 + 5.2 ✓

**Discrepancy Count: 2** (all LOW severity — asset/process, no implementation impact)

## Acceptance Criteria Verification

### Story 5.1: Proposal Form for New Terms (18 ACs)

| AC | Feature | Verdict | Evidence |
|----|---------|---------|----------|
| AC1 | Required fields visible (name, category, definition, why exists), optional behind "Add more detail" collapsible, conversational labels | **SATISFIED** | `ProposeTerm.tsx`: Required fields rendered at top level with labels "What's the term?", "Which category does it belong to?", "What does this term mean?", "Why does this term exist?". Optional fields inside `<Collapsible>` component (`detailOpen` state, default `false`). Toggle text "Add more detail" / "Less detail". |
| AC2 | Collapsible toggle expands/collapses optional fields | **SATISFIED** | `CollapsibleTrigger` with `data-testid="button-toggle-details"`, `CollapsibleContent` wraps usage guidance, examples, synonyms. Toggle text switches between "Add more detail" and "Less detail" via `detailOpen` state. E2E verified. |
| AC3 | Duplicate detection on name blur with amber warning | **SATISFIED** | `checkDuplicates()` called on name field `onBlur`. Uses `api.terms.search(name)`. Warning rendered with `data-testid="warning-duplicate"`, amber styling (`bg-amber-50 border-amber-200`), link to existing term. Filters for exact match or starts-with match. |
| AC4 | No duplicate check for < 2 chars | **SATISFIED** | `checkDuplicates()` line: `if (name.length < 2) { setDuplicateWarning(null); return; }`. Short-circuits before API call. |
| AC5 | No warning when no duplicates found | **SATISFIED** | `checkDuplicates()`: `else { setDuplicateWarning(null); }` when no match found. Warning only renders when `shouldShowDuplicate` is truthy. |
| AC6 | Submit button disabled when required fields empty | **SATISFIED** | `disabled={createProposal.isPending \|\| (!isEditMode && !requiredFieldsFilled)}`. `requiredFieldsFilled` checks name >= 2 chars, category present, definition >= 10 chars, why_exists >= 5 chars. Also has `aria-disabled` for accessibility. |
| AC7 | Submit button enabled when required fields filled | **SATISFIED** | `requiredFieldsFilled` computed from `watchedValues` (real-time via `form.watch()`). Button enables when all thresholds met. E2E verified. |
| AC8 | Inline validation errors on empty required fields at submit | **SATISFIED** | `zodResolver(formSchema)` with `mode: "onBlur"` triggers validation. `FormMessage` renders inline errors. Zod schema enforces: name min(2), definition min(10), why_exists min(5), category required. |
| AC9 | Green checkmark on valid field blur | **SATISFIED** | `isFieldValid()` checks `touchedFields.has(fieldName) && !error && value.length > 0`. Green `<Check>` icon rendered with `data-testid="icon-valid-{fieldName}"`. Triggered on blur via `markTouched()`. E2E verified. |
| AC10 | Successful submission creates proposal, shows toast, navigates home | **SATISFIED** | `createProposal` mutation calls `api.proposals.create()` with status "pending". Success handler: `toast({ title: "Proposal Submitted", description: "Your proposal has been submitted for review.", duration: 4000 })`. Navigation: `setTimeout(() => setLocation("/"), 1500)`. |
| AC11 | Failed submission shows persistent error toast, preserves form data | **SATISFIED** | `onError`: `toast({ title: "Something went wrong", description: "Something went wrong. Please try again.", variant: "destructive", duration: 1000000 })`. No form reset on error — data preserved. |
| AC12 | Good/bad examples: add via input + button/Enter, display as list items with indicators | **SATISFIED** | `addGoodExample()` / `addBadExample()` functions. `onKeyDown` handler for Enter. Good examples: green styling with `<Check>` icon. Bad examples: red styling with `<X>` icon. Remove buttons with `data-testid`. |
| AC13 | Synonyms: add as chips/badges with remove | **SATISFIED** | `addSynonym()` function. Synonyms rendered as `<Badge variant="secondary">` with `<X>` remove button. `data-testid="button-remove-synonym-{i}"`. |
| AC14 | URL pre-fill: name from `?name=` | **SATISFIED** | `const prefillName = searchParams.get("name")`. Used in `defaultValues: { name: prefillName \|\| "" }`. |
| AC15 | URL pre-fill: category from `?category=` | **SATISFIED** | `const prefillCategory = searchParams.get("category")`. Used in `defaultValues: { category: prefillCategory \|\| "" }`. |
| AC16 | URL pre-fill: both name and category | **SATISFIED** | Both `prefillName` and `prefillCategory` parsed independently from URL params. Combined pre-fill works by construction. |
| AC17 | Unsaved changes guard: confirmation dialog on navigation | **SATISFIED** | `navigateWithGuard()` checks `formDirtyRef.current`. If dirty, shows `<AlertDialog>` with "You have unsaved changes. Leave anyway?" and Stay/Leave buttons. `beforeunload` event handler for browser navigation. E2E verified (dialog appeared, "Stay" preserved form). |
| AC18 | Accessibility: labels, aria-required, aria-describedby, aria-live | **SATISFIED** | `aria-required="true"` on required fields. `<div aria-live="polite">` for duplicate warning and no-changes announcements. `data-testid` on all interactive elements. `FormLabel` provides associated labels via `htmlFor`. |

**Story 5.1: All 18 ACs SATISFIED**

### Story 5.2: Propose Edits to Existing Terms (16 ACs)

| AC | Feature | Verdict | Evidence |
|----|---------|---------|----------|
| AC1 | "Suggest an Edit" navigates to `/propose?editTermId={id}`, form loads in edit mode | **SATISFIED** | `isEditMode = !!editTermId`. Entry point exists in TermDetail.tsx (pre-existing). `editTermId` parsed from URL params. |
| AC2 | All fields pre-filled with term data, heading "Suggest changes to: {name}" | **SATISFIED** | `useEffect` with `editTerm && !prefilled` guard calls `form.reset()` with term data. Heading: `isEditMode ? \`Suggest changes to: ${editTerm?.name \|\| "..."}\` : "Propose a New Term"`. Arrays pre-filled: `setExamplesGood(editTerm.examplesGood \|\| [])`, etc. |
| AC3 | Loading indicator while term data loads | **SATISFIED** | Early return: `if (isEditMode && editTermId && !editTerm && !prefilled)` renders `<Loader2>` spinner with `data-testid="loading-edit-form"`. Prevents interaction with empty fields. |
| AC4 | All fields editable in edit mode (name NOT read-only) | **SATISFIED** | `readOnly={isEditMode}` removed. Name input has no `readOnly` or `bg-muted` conditional. All fields equally editable in both modes. |
| AC5 | "What did you change and why?" field visible in edit mode only | **SATISFIED** | `{isEditMode && (...)}` conditional renders change notes textarea with label "What did you change and why?" in amber-styled container. `data-testid="input-change-note"`. Not rendered for new proposals. |
| AC6 | Submit blocked without change notes, inline error shown | **SATISFIED** | `onSubmit()` checks `if (!values.change_note \|\| values.change_note.trim().length === 0) { setChangeNoteError(true); return; }`. Error rendered: `<p id="change-note-error" data-testid="error-change-note">Please explain what you changed and why.</p>`. E2E verified. |
| AC7 | Submit blocked when no changes detected, "No changes detected" message | **SATISFIED** | `hasFormChanges` computed via `useMemo`: checks `form.formState.isDirty` + JSON.stringify array comparison. `onSubmit()` checks `if (!hasFormChanges) { setNoChangesError(true); return; }`. `<Alert data-testid="alert-no-changes">` renders "No changes detected — please modify at least one field." |
| AC8 | Submit enabled when fields modified + change notes filled | **SATISFIED** | Submit button not explicitly disabled in edit mode (per architect review — form-level validation in onSubmit handles gating). When changes exist and change notes filled, mutation fires successfully. |
| AC9 | Revert to original values treated as unchanged | **SATISFIED** | `hasFormChanges` uses `form.formState.isDirty` which react-hook-form computes by comparing current values against `defaultValues` set via `form.reset()`. Reverting to original values clears `isDirty`. Array comparison via JSON.stringify also detects reversion. |
| AC10 | Duplicate detection suppressed when name unchanged | **SATISFIED** | `shouldShowDuplicate` computed via `useMemo`: if `isEditMode && editTerm && currentName.toLowerCase() === editTerm.name.toLowerCase()`, returns `false`. Duplicate warning hidden. |
| AC11 | Duplicate detection runs normally when name changed in edit mode | **SATISFIED** | `onBlur` handler: `if (isEditMode && editTerm && nameValue.toLowerCase() === editTerm.name.toLowerCase()) { setDuplicateWarning(null); } else { checkDuplicates(nameValue); }`. When name differs, normal detection fires. |
| AC12 | Edit submission: type "edit", termId set, changesSummary from notes, success toast, navigate to term | **SATISFIED** | Mutation: `type: isEditMode ? "edit" : "new"`, `termId: isEditMode ? editTermId : undefined`, `changesSummary: isEditMode ? (values.change_note \|\| ...)`. Success toast: "Your edit suggestion has been submitted for review." (duration: 4000). Navigation: `setLocation(\`/term/${editTermId}\`)`. |
| AC13 | Failed edit submission: persistent error toast, data preserved | **SATISFIED** | Same `onError` handler as new proposals: `variant: "destructive"`, `duration: 1000000`. No form reset on error. |
| AC14 | Unsaved changes guard in edit mode | **SATISFIED** | `formDirtyRef.current` updated via `useEffect` that checks `form.formState.isDirty` + array changes (compared against `editTerm` originals). Same `navigateWithGuard()` and `<AlertDialog>` as new proposals. |
| AC15 | Auto-expand collapsible when optional fields have content | **SATISFIED** | In `useEffect` (editTerm pre-fill): `if (hasOptionalContent) { setDetailOpen(true); }`. Checks `editTerm.usedWhen`, `editTerm.notUsedWhen`, `examplesGood.length`, `examplesBad.length`, `synonyms.length`. E2E verified. |
| AC16 | Accessibility: heading announces edit mode, change notes aria-required, aria-live | **SATISFIED** | Heading uses dynamic text. Change notes has `aria-required="true"` and `aria-describedby` linked to error. `aria-live` region includes `noChangesError` announcement. `data-testid` on all elements. |

**Story 5.2: All 16 ACs SATISFIED**

## Dev Notes Compliance

### Story 5.1 Constraints

| Constraint | Verdict | Notes |
|------------|---------|-------|
| DO NOT create separate ProposalForm component file | **COMPLIANT** | All logic in ProposeTerm.tsx. No new component files created. |
| DO NOT modify shared/schema.ts | **COMPLIANT** | No schema changes. |
| DO NOT modify server/routes.ts or server/storage.ts | **COMPLIANT** | No server changes. |
| DO NOT reference mockData.ts | **COMPLIANT** | No mock data imports. |
| DO NOT use react-router | **COMPLIANT** | Uses wouter exclusively. |
| DO NOT use heroicons or react-icons | **COMPLIANT** | Uses lucide-react only. |

### Story 5.2 Constraints

| Constraint | Verdict | Notes |
|------------|---------|-------|
| DO NOT create separate edit component | **COMPLIANT** | Edit mode is conditional rendering in ProposeTerm.tsx. |
| DO NOT modify schema, routes, or storage | **COMPLIANT** | No server-side changes. |
| DO NOT lock name field as read-only | **COMPLIANT** | `readOnly` removed. Name is fully editable in edit mode. |
| DO NOT run duplicate detection when name unchanged | **COMPLIANT** | `shouldShowDuplicate` suppresses when name matches original. |
| DO NOT allow submission of unchanged forms | **COMPLIANT** | `hasFormChanges` check in `onSubmit()` blocks unchanged submissions. |

## Findings

### Finding 1: Edit mode submit button not disabled until required fields + change notes valid

- **Severity:** LOW (design choice, not a bug)
- **File:** `client/src/pages/ProposeTerm.tsx`, line 714
- **Description:** In edit mode, the submit button is only disabled while submission is pending (`createProposal.isPending`). It is NOT disabled when change notes are empty or when no changes are detected. Instead, validation is handled in the `onSubmit()` handler, which shows inline errors. For new proposals, the button IS disabled until `requiredFieldsFilled`.
- **Impact:** Users can click submit in edit mode without change notes — they get an immediate inline error. This is a valid UX pattern (form-level validation on submit) but differs from the new proposal pattern (button-level gating).
- **Recommendation:** Consider adding `disabled` condition in edit mode for consistency: `disabled={createProposal.isPending || (isEditMode && (!hasFormChanges || !watchedValues.change_note?.trim()))}`. Not blocking — current behavior is functionally correct.

### Finding 2: Duplicate detection uses client-side name comparison, not search tier filtering

- **Severity:** LOW (acceptable limitation, documented in scratchpad)
- **File:** `client/src/pages/ProposeTerm.tsx`, lines 152-166
- **Description:** AC3 specifies "Only exact name matches and 'name starts with' matches (search ranking tiers 1-2) trigger the warning." The implementation filters client-side: `t.name.toLowerCase() === name.toLowerCase() || t.name.toLowerCase().startsWith(name.toLowerCase())`. This achieves the same result as tier 1-2 filtering since the search API returns results ranked by score, and the client-side filter only matches exact/startsWith patterns.
- **Recommendation:** No action needed. The client-side filter is equivalent to tier 1-2 for the purpose of duplicate detection. The search API doesn't expose tier numbers in the response, so server-side filtering would require API changes.

### Finding 3: `useSearch()` hook extraction — Epic 1 "before Epic 5" guidance superseded

- **Severity:** LOW (carry-forward from Epic 1 Finding 3 — dependency resolved)
- **File:** N/A
- **Description:** Epic 1 recommended extracting a `useSearch()` hook "before Epic 5" because duplicate detection was expected to need the same search UI logic. In practice, duplicate detection is fundamentally different: a single blur-triggered API call with client-side name filtering, vs debounce + keyboard navigation + highlighted index + result rendering. The direct `api.terms.search()` call in `checkDuplicates()` is the correct approach. The Epic 1 "before Epic 5" guidance is **superseded** — the `useSearch()` hook is a DRY improvement for SearchHero/SpotlightSearch (~80 lines of duplicate logic), not a dependency for Epic 5.
- **Recommendation:** Close the "before Epic 5" timeline. Reclassify as "cleanup sprint" DRY improvement for SearchHero/SpotlightSearch deduplication only.

### Finding 4: `formDirtyRef` in edit mode tracks change_note as dirty even before other fields change

- **Severity:** LOW (edge case)
- **File:** `client/src/pages/ProposeTerm.tsx`, lines 88-100
- **Description:** In edit mode, `formDirtyRef.current` is set to `hasText || arraysChanged` where `hasText = form.formState.isDirty || !!(watchedValues.change_note)`. If a user types only a change note without modifying any other field, `formDirtyRef.current` becomes `true`, triggering the unsaved changes guard. However, `hasFormChanges` remains `false` because it doesn't count change_note as a "form change" — it only checks `isDirty` (which tracks changes to default values) and array diffs. This means the unsaved changes dialog can fire even when submission would be blocked.
- **Impact:** Minor UX inconsistency — the unsaved changes guard is slightly overprotective. It prevents accidental loss of typed change notes, which is arguably correct behavior (the user typed something, so warn them).
- **Recommendation:** No action needed. The current behavior is protective rather than permissive, which is the safer UX choice.

### Finding 5: Toast TOAST_REMOVE_DELAY set to 1000000ms globally

- **Severity:** LOW (pre-existing, not introduced by Epic 5)
- **File:** `client/src/hooks/use-toast.ts`, line 9
- **Description:** `TOAST_REMOVE_DELAY = 1000000` (roughly 16 minutes) is the global remove delay for all toasts. Epic 5 uses `duration: 4000` for success toasts and `duration: 1000000` for error toasts. The `duration` prop on the Radix Toast component controls auto-dismiss, while `TOAST_REMOVE_DELAY` controls when the toast is removed from the DOM after being dismissed. This means even dismissed toasts linger in memory for 16 minutes.
- **Recommendation:** No action needed for Epic 5 — this is a pre-existing pattern. Consider reducing `TOAST_REMOVE_DELAY` to 5000ms in a cleanup pass. The success toast `duration: 4000` correctly auto-dismisses after 4 seconds regardless.

### Finding 6: `<a>` vs `<Link>` carry-forward still open

- **Severity:** LOW (carry-forward from Epic 1 Finding 5)
- **Description:** The Epic 1 and Epic 2 retrospectives both flagged that search empty state CTAs use `<a>` instead of wouter `<Link>`. This was deferred to "before Epic 5" but was not addressed. Epic 5 itself doesn't introduce any new `<a>` tags (the duplicate warning link correctly uses wouter `<Link>`), but the existing SearchHero/SpotlightSearch CTAs remain unchanged.
- **Recommendation:** Address in cleanup sprint or next search-related work. Not blocking.

### Finding 7: ProposeTerm missing `document.title` useEffect

- **Severity:** LOW (carry-forward from Epic 2 Finding 4)
- **File:** `client/src/pages/ProposeTerm.tsx`
- **Description:** Unlike other pages (BrowsePrinciples, PrincipleDetail, etc.), ProposeTerm does not set `document.title` via a useEffect. The browser tab shows the default "Katalyst Lexicon" instead of "Propose a New Term — Katalyst Lexicon" or "Suggest changes to: {name} — Katalyst Lexicon".
- **Recommendation:** Add a useEffect similar to other pages: `useEffect(() => { document.title = isEditMode ? \`Suggest changes to: ${editTerm?.name} — Katalyst Lexicon\` : "Propose a New Term — Katalyst Lexicon"; return () => { document.title = "Katalyst Lexicon"; }; }, [isEditMode, editTerm?.name]);`. Queue for cleanup or next touch of ProposeTerm.

## Code Quality Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Code Quality | A | Clean refactor. Well-organized with logical grouping of state, effects, callbacks, and render. Single-file approach per constraints. |
| Architecture | A | Follows all existing patterns: TanStack Query, react-hook-form + Zod, wouter, shadcn/ui components. No new architectural patterns introduced. |
| Security | A | No XSS vectors. No secret exposure. API calls properly parameterized. Form submission uses existing validated POST endpoint. |
| Performance | A | `useMemo` for derived state (`hasFormChanges`, `shouldShowDuplicate`). No unnecessary re-renders. Duplicate detection only on blur (not keystroke). `form.watch()` is efficient for reactive UI. |
| Accessibility | A- | `aria-required` on required fields. `aria-live` region for duplicate/no-changes announcements. `data-testid` on all interactive elements. Missing: `document.title` (Finding 7). |
| Error Handling | A | Inline validation errors via Zod + FormMessage. Custom validation for change notes and no-changes detection. Persistent error toasts. Form data preserved on error. |
| DRY | A | No duplication introduced. Edit mode and new mode share the same form with conditional rendering. Array management (examples, synonyms) uses consistent patterns. |
| Testing | A | E2E Playwright tests verified: new proposal flow (fill fields, toggle collapsible, add example, unsaved changes dialog), edit proposal flow (pre-fill, auto-expand, change note validation, no-changes detection). |

## Platform Intelligence

- **LSP Diagnostics:** 0 errors, 0 warnings in ProposeTerm.tsx
- **Architect Analysis:** Passed. Noted Finding 1 (edit mode submit not disabled) as potential improvement but not blocking.
- **Visual Verification (E2E):** New proposal: heading, disabled submit, field validation with checkmarks, collapsible toggle, good example addition, unsaved changes dialog with Stay/Leave. Edit proposal: heading with term name, pre-filled fields, auto-expanded collapsible, change note validation error on submit without notes.

## Review Outcome

**Issues Found:** 0 HIGH, 0 MEDIUM, 7 LOW (3 new, 4 carry-forward)

All 34 acceptance criteria across 2 stories are SATISFIED. All Dev Notes constraints are COMPLIANT. No carry-forward findings from previous epics were violated.

**Verdict: PASS — Stories 5.1 and 5.2 are confirmed done**

## Recommended Actions

1. **None required before marking done.** All findings are LOW severity with no AC impact.
2. **Future improvement:** Add `document.title` useEffect for ProposeTerm page (Finding 7 — carry-forward from Epic 2).
3. **Future improvement:** Consider adding disabled condition on submit button in edit mode for consistency (Finding 1).
4. **Future cleanup:** Extract `useSearch()` hook for SearchHero/SpotlightSearch DRY (Finding 3 — scoped as DRY, not Epic 5 dependency).
5. **Future cleanup:** Replace `<a>` with `<Link>` in search empty state CTAs (Finding 6 — carry-forward from Epic 1).

## Cross-Story Dependency Verification

| Dependency | Status |
|------------|--------|
| Story 5.1 → 5.2: Progressive disclosure, conversational labels, validation, duplicate detection | ✓ 5.2 builds on 5.1's patterns correctly |
| Epic 1 → 5.1: Search API for duplicate detection | ✓ Uses `api.terms.search()` for duplicate check |
| Epic 2 → 5.2: TermDetail "Suggest an Edit" button navigates to `/propose?editTermId=` | ✓ Entry point pre-existing and functional |
| Epic 2 Finding 4 → 5: ProposeTerm document.title | ⏳ Not addressed — carry forward |
| Epic 1 Finding 3 → 5: useSearch() hook extraction | ⚡ Scoped as DRY improvement, not dependency — correctly NOT used for duplicate detection |
| Epic 1 Finding 5 → 5: `<a>` to `<Link>` in search CTAs | ⏳ Not addressed — carry forward |
