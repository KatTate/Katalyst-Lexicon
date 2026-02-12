# Story 5.2: Propose Edits to Existing Terms

Status: done

## Story

As a team member who thinks an existing term's definition needs updating,
I want to propose an edit with all current values pre-filled so I only change what needs changing,
So that I can suggest improvements without rewriting the entire entry from scratch.

## Acceptance Criteria

**Entry Point & Navigation:**

1. **Given** I am on a term's detail page, **When** I click "Suggest an Edit" (button with Edit icon in the term header), **Then** I am navigated to the proposal form at `/propose?editTermId={termId}` and the form loads in edit mode.

**Pre-fill & Form Heading:**

2. **Given** the proposal form loads with `?editTermId={id}` in the URL, **When** the term data finishes loading, **Then** all form fields are pre-filled with the term's current values: name, category, definition, why it exists, when to use, when not to use, good examples, bad examples, and synonyms. The form heading reads "Suggest changes to: {term name}" (not "Propose a New Term").

3. **Given** the term data is still loading, **When** I see the form, **Then** I see a loading indicator (spinner) instead of the form fields, so I don't interact with empty fields before data arrives.

4. **Given** the form is in edit mode, **When** the form loads, **Then** all fields are editable (name, category, definition, why it exists, usage guidance, examples, synonyms). The name field is NOT locked/read-only — the user may propose renaming a term.

**Change Notes (Required for Edits):**

5. **Given** the form is in edit mode, **When** I see the form, **Then** an additional required field appears: "What did you change and why?" (change notes textarea). This field does NOT appear for new term proposals.

6. **Given** I try to submit an edit proposal without filling in change notes, **When** I click submit, **Then** I see an inline validation error on the change notes field: "Please explain what you changed and why" and the form does not submit.

**Change Detection:**

7. **Given** I haven't changed any field values from their original pre-filled state AND the change notes field is empty, **When** I click submit, **Then** I see a validation message: "No changes detected — please modify at least one field" and the form does not submit. This prevents submitting an identical copy of the existing term.

8. **Given** I have modified at least one field (react-hook-form's `isDirty` flag is true), **When** I also fill in the change notes field, **Then** the submit button is enabled and I can submit the proposal.

9. **Given** I modify a field and then revert it back to the original value, **When** all fields match the original pre-filled values, **Then** the form is treated as unchanged (no dirty fields) and submit is blocked with the "No changes detected" message.

**Duplicate Detection Suppression:**

10. **Given** the form is in edit mode and duplicate detection fires on the name field, **When** the name has NOT been changed from the original term name, **Then** no duplicate warning is shown — the term would match itself, so the warning is suppressed.

11. **Given** the form is in edit mode, **When** I change the name to something different from the original, **Then** duplicate detection runs normally (same behavior as new proposals — blur-triggered, tiers 1-2 only).

**Submission:**

12. **Given** I have modified at least one field and filled in change notes, **When** I click "Submit Edit for Review", **Then** a proposal is created with `type: "edit"`, `termId` set to the original term's ID, `changesSummary` set to the change notes content, and `status: "pending"`. I see a success toast: "Your edit suggestion has been submitted for review" (4-second auto-dismiss) and I am navigated back to the term's detail page (`/term/{termId}`).

13. **Given** submission fails (server error), **When** the error occurs, **Then** I see a persistent error toast: "Something went wrong. Please try again." and my form data (including all edits and change notes) is preserved.

**Unsaved Changes Guard:**

14. **Given** I have modified any field or typed change notes in edit mode, **When** I navigate away without submitting, **Then** I see the same "unsaved changes" confirmation dialog as for new proposals.

**Progressive Disclosure in Edit Mode:**

15. **Given** the form is in edit mode and the term has existing values for optional fields (when to use, when not to use, examples, synonyms), **When** the form loads, **Then** the "Add more detail" collapsible section is automatically expanded so the user can see and edit all pre-filled optional content. If the original term has no optional field content, the collapsible remains closed (same as new proposal default).

**Accessibility:**

16. **Given** I am using a screen reader in edit mode, **When** the form loads, **Then** the heading announces "Suggest changes to: {term name}", the change notes field has an associated label and `aria-required="true"`, validation errors are announced via `aria-describedby`, and the change detection warning is announced via an `aria-live` region.

## Dev Notes

### Architecture Patterns to Follow

- **Same component, conditional rendering**: Story 5.2 builds on the existing `ProposeTerm.tsx` component. The edit mode is detected via `?editTermId={id}` URL parameter (already implemented). All edit-specific UI is conditionally rendered based on `isEditMode`. Source: Architecture AD-12, Epic 5 dev notes.
- **Term data pre-fill via TanStack Query**: The existing `useQuery` for `editTerm` already fetches the term data when `editTermId` is present. The `useEffect` that calls `form.reset()` with the term data already exists. This is the correct pattern — `form.reset()` sets the `defaultValues` which react-hook-form uses for `isDirty` comparison. Source: Architecture AD-12.
- **Change detection via `isDirty`**: react-hook-form's `formState.isDirty` compares current values against `defaultValues` (set via `form.reset()` with the original term data). This provides built-in change detection without manual field-by-field comparison. For array fields (examples, synonyms) managed via separate state, a manual comparison against the original term data is also needed. Source: Epic 5 dev notes.
- **Proposal creation**: Uses existing `api.proposals.create()` with `type: "edit"` and `termId` set. The `changesSummary` field stores the change notes. No new API endpoints needed. Source: Architecture AD-12.
- **Toast notifications**: Success toast auto-dismisses (4s). Error toast persistent (`variant: "destructive"`). Source: UX9.
- **Navigation after submit**: Edit proposals navigate back to `/term/{termId}` (not home page like new proposals). Source: Epic 5 AC.
- **All Story 5.1 patterns apply**: Conversational labels, progressive disclosure, inline validation, duplicate detection, unsaved changes guard, `data-testid` attributes — all carry over from Story 5.1. Story 5.2 adds edit-specific behavior on top.

### UI/UX Deliverables

- **Edit mode heading**: "Suggest changes to: {term name}" replacing "Propose a New Term" when `editTermId` is present.
- **Change notes field**: Required textarea with label "What did you change and why?", styled in amber accent container (already partially implemented). Validation error: "Please explain what you changed and why". Only visible in edit mode.
- **Change detection guard**: On submit, if `isDirty` is false AND array fields haven't changed, show inline alert: "No changes detected — please modify at least one field". This is a form-level validation, not field-level.
- **Name field editable**: Remove the current `readOnly={isEditMode}` restriction and the `bg-muted` styling on the name input. Users should be able to propose term renames.
- **Duplicate detection suppression**: When in edit mode and the name field value matches `editTerm.name`, skip the duplicate search on blur. Only run duplicate detection if the name has been changed.
- **Progressive disclosure auto-expand**: When in edit mode and the original term has content in any optional field (`usedWhen`, `notUsedWhen`, `examplesGood`, `examplesBad`, `synonyms`), auto-expand the "Add more detail" collapsible on load.
- **Back link**: "Back to term" (links to `/term/{editTermId}`) replacing "Cancel and go back" (links to `/`).
- **Submit button text**: "Submit Edit for Review" (already implemented).

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate edit proposal component or page — all edit logic lives in `ProposeTerm.tsx` with conditional rendering based on `isEditMode`.
- **DO NOT** modify `shared/schema.ts` — the `proposals` table already supports edit proposals with `type: "edit"` and `termId` foreign key. No schema changes needed.
- **DO NOT** modify `server/routes.ts` or `server/storage.ts` — the `POST /api/proposals` endpoint handles both new and edit proposals correctly.
- **DO NOT** lock the name field as read-only in edit mode — users should be able to propose renaming terms.
- **DO NOT** run duplicate detection when the name hasn't changed from the original term name.
- **DO NOT** allow submission of unchanged forms — always enforce change detection.
- **DO NOT** use `react-router` — use `wouter` exclusively.
- **DO NOT** use `heroicons` or `react-icons` — use `lucide-react` for icons.

### Gotchas & Integration Warnings

- **URL parameter naming**: The architecture document references `?termId=xxx&type=edit` but the existing implementation uses `?editTermId=xxx`. The implementation pattern (`editTermId`) is correct and already wired into `TermDetail.tsx`'s "Suggest an Edit" button (`/propose?editTermId=${params?.id}`). Use the existing `editTermId` parameter, not the architecture doc's `termId` + `type` pattern.
- **Form field naming mismatch**: The form uses snake_case internally (`why_exists`, `used_when`, `not_used_when`, `change_note`) and maps to camelCase for the API (`whyExists`, `usedWhen`, `notUsedWhen`, `changesSummary`). This mapping is already implemented in the mutation function and must be preserved.
- **Array fields not tracked by isDirty**: react-hook-form's `isDirty` only tracks fields registered with the form (text inputs). The `examplesGood`, `examplesBad`, and `synonyms` arrays are managed via separate React state (`useState`), NOT form fields. Change detection must also compare these arrays against `editTerm.examplesGood`, `editTerm.examplesBad`, and `editTerm.synonyms`. A simple JSON stringify comparison works.
- **`form.reset()` timing**: The `useEffect` that calls `form.reset()` with term data runs after the query resolves. Until then, `isDirty` is meaningless because `defaultValues` are empty strings. The `prefilled` state flag prevents re-resetting on re-renders. This pattern is correct.
- **Change notes maps to `changesSummary`**: The form field `change_note` maps to the API field `changesSummary` in the mutation. The existing mapping in the mutation function already does this: `changesSummary: isEditMode ? (values.change_note || ...) : ...`.
- **Change notes validation only in edit mode**: The Zod schema has `change_note: z.string().optional()`. For edit mode, add a conditional validation via `superRefine` or check in the `onSubmit` handler to require it only when `isEditMode` is true.
- **Auto-expand collapsible**: The Collapsible component (from Story 5.1) uses an `open` state. Initialize it to `true` in edit mode when optional fields have content. Check `editTerm.usedWhen`, `editTerm.notUsedWhen`, `editTerm.examplesGood?.length`, `editTerm.examplesBad?.length`, `editTerm.synonyms?.length`.
- **Submit currently navigates after 1500ms timeout**: The existing `onSuccess` handler uses `setTimeout(() => setLocation(...), 1500)`. This should be kept for edit mode, navigating to `/term/${editTermId}` (already implemented).
- **The submit uses `submittedBy: "Current User"` hardcoded** — this is expected since auth is not wired yet (AD-10). Do not change this.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/ProposeTerm.tsx` | MODIFY | Add: change detection guard (isDirty + array comparison), required change notes validation in edit mode, unlock name field for edits, duplicate detection suppression when name unchanged, auto-expand collapsible for pre-filled optional fields, change detection error message UI |

### Dependencies & Environment Variables

- **No new packages needed** — all required libraries are already installed.
- **No new environment variables needed**
- **Depends on Story 5.1** — Story 5.2 enhances the edit mode that builds on 5.1's progressive disclosure, conversational labels, inline validation, and duplicate detection. If 5.1 is not yet implemented, 5.2 can still be developed against the existing ProposeTerm.tsx, but the edit-specific features layer on top of 5.1's UI improvements.

### References

- [Source: _bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md#Epic 5 Story 5.2] — Full acceptance criteria and dev notes for edit proposals
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-12] — Governance bridges and "Suggest an edit" data loading pattern
- [Source: _bmad-output/implementation-artifacts/5-1-proposal-form-for-new-terms.md] — Story 5.1 context (progressive disclosure, conversational labels, duplicate detection, validation)
- [Source: client/src/pages/ProposeTerm.tsx] — Existing component with basic edit mode implementation
- [Source: client/src/pages/TermDetail.tsx] — "Suggest an Edit" button entry point (line 157)
- [Source: client/src/lib/api.ts] — API client with `api.proposals.create()`, `api.terms.get()`
- [Source: shared/schema.ts] — Proposals table with `type`, `termId`, `changesSummary` fields

## Dev Agent Record

### Agent Model Used

Claude 4.6 Opus (Replit Agent)

### Completion Notes

Story 5.2 implemented as incremental enhancement to Story 5.1's ProposeTerm.tsx. All 16 ACs satisfied. Key implementation decisions:
- Name field unlocked: removed `readOnly={isEditMode}` and `bg-muted` conditional — users can propose renames
- Change notes: required in edit mode via custom validation in `onSubmit()` (not Zod schema, since it's conditional). Error: "Please explain what you changed and why"
- Change detection: `hasFormChanges` via `useMemo` combining `formState.isDirty` + `JSON.stringify` array comparison against `editTerm` originals. Blocks submission with "No changes detected" alert
- Duplicate suppression: `shouldShowDuplicate` via `useMemo` — suppresses when name matches `editTerm.name` (case-insensitive)
- Auto-expand: Collapsible `setDetailOpen(true)` when edit term has any optional content (usedWhen, notUsedWhen, examplesGood, examplesBad, synonyms)
- Loading state: early return with Loader2 spinner while editTerm query resolves
- Edit-specific UI: heading "Suggest changes to: {name}", back link "Back to term" → `/term/{id}`, submit "Submit Edit for Review", navigation to `/term/{id}` on success
- No new files created, no server changes, no schema changes

### File List

| File | Action | Lines Changed |
|------|--------|---------------|
| `client/src/pages/ProposeTerm.tsx` | MODIFIED | Incremental enhancement on 5.1 — edit mode logic (change detection, change notes, duplicate suppression, auto-expand, loading state). Combined with 5.1: +492/-352 total (stories implemented sequentially in same file). |
