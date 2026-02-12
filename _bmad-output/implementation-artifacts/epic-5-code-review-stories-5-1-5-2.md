# Code Review — Epic 5: Stories 5.1 & 5.2

**Date:** 2026-02-12
**Reviewer:** Claude 4.6 Opus (Adversarial CR Persona)
**Stories:** 5-1-proposal-form-for-new-terms, 5-2-propose-edits-to-existing-terms
**Verdict:** PASS — all findings LOW, 2 fixed inline

## Git vs Story File List

| Source | File | In Git? | In Story? | Note |
|--------|------|---------|-----------|------|
| Story 5.1 | `client/src/pages/ProposeTerm.tsx` | Yes (+492/-352) | Yes (MODIFY) | None |
| Story 5.1 | `client/src/components/ui/collapsible.tsx` | No changes | Listed "CREATE (if missing)" | Already existed |
| Git only | `client/public/opengraph.jpg` | Yes (binary) | Not listed | Incidental asset |
| Git only | `replit.md` | Yes (-159 lines) | Not listed | Process doc |

**Discrepancies: 2** (both LOW — non-implementation files)

## Platform Intelligence Scans

- **LSP Diagnostics:** 0 errors, 0 warnings
- **Debt Markers (TODO/FIXME/HACK):** 0 found
- **E2E Visual Verification:** 23/23 test steps PASSED

## Findings Summary

| # | Severity | Description | Resolution |
|---|----------|-------------|------------|
| 1 | LOW | Edit mode submit button not disabled until required fields valid | **FIXED** — removed `!isEditMode &&` guard, now `!requiredFieldsFilled` applies to both modes |
| 2 | LOW | Duplicate detection uses client-side name comparison | Accepted — equivalent to server-side tier 1-2 filtering |
| 3 | LOW | `useSearch()` hook extraction (Epic 1 carry-forward) | Superseded for duplicate detection; still valid as DRY for SearchHero/SpotlightSearch |
| 4 | LOW | `formDirtyRef` slightly overprotective in edit mode | Accepted — protective > permissive |
| 5 | LOW | Toast TOAST_REMOVE_DELAY 1000000ms globally | Pre-existing — not introduced by Epic 5 |
| 6 | LOW | `<a>` vs `<Link>` in search CTAs | Epic 1 carry-forward — not introduced by Epic 5 |
| 7 | LOW | ProposeTerm missing `document.title` | **FIXED** — added `useEffect` setting title per mode |

## Acceptance Criteria Verification

### Story 5.1 (18 ACs) — All SATISFIED

- AC1-2: Progressive disclosure with Collapsible, conversational labels
- AC3-5: Duplicate detection on blur, 2-char threshold, startsWith matching
- AC6-9: Submit button disabled until valid, inline validation with green checkmarks
- AC10-11: Submission with correct toast durations, error preservation
- AC12-13: Array inputs (examples, synonyms) with add/remove
- AC14-16: URL pre-fill for name and category
- AC17: Unsaved changes guard (beforeunload + AlertDialog)
- AC18: Accessibility (aria-required, aria-describedby, aria-live)

### Story 5.2 (16 ACs) — All SATISFIED

- AC1: Entry point via "Suggest an Edit" button
- AC2-4: Pre-fill from term data, loading state, name field editable
- AC5-6: Change notes required in edit mode with validation
- AC7-9: Change detection (isDirty + JSON.stringify array comparison)
- AC10-11: Duplicate detection suppression when name unchanged
- AC12-13: Submission with correct type/termId/changesSummary, navigation to term page
- AC14: Unsaved changes guard in edit mode
- AC15: Auto-expand collapsible when optional fields have content
- AC16: Accessibility in edit mode

## Carry-Forward Items (for future sprints)

1. Extract `useSearch()` hook for DRY across SearchHero/SpotlightSearch (Epic 1 debt)
2. Reduce global `TOAST_REMOVE_DELAY` from 1000000ms (pre-existing)
3. Replace `<a>` with `<Link>` in search empty state CTAs (Epic 1 debt)
