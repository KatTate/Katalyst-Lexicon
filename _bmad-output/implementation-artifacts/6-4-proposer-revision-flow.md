# Story 6.4: Proposer Revision Flow

Status: review

## Story

As a proposer who received change feedback from a reviewer,
I want to see the feedback, revise my proposal, and resubmit it,
so that I can address the reviewer's concerns without starting a new proposal from scratch.

## Acceptance Criteria

**Viewing Feedback:**

1. **Given** I am a proposer and my proposal has status "Changes Requested", **When** I view my proposals (via a "My Proposals" section or page), **Then** I see the proposal clearly marked as "Changes Requested" with the reviewer's feedback visible.

2. **Given** I open my proposal that has changes requested, **When** the page loads, **Then** I see the reviewer's feedback prominently displayed at the top in a feedback banner and below it I see my proposal form pre-filled with my previous values, with all fields editable.

**Revision and Resubmission:**

3. **Given** I revise my proposal fields, **When** I click "Resubmit", **Then** the proposal status changes back to "Pending", an audit event is recorded ("Resubmitted by {name}"), I see a success toast: "Your revised proposal has been resubmitted for review", and the proposal returns to the review queue for approvers.

**Change Detection:**

4. **Given** I try to resubmit without making any changes to my proposal fields, **When** I click "Resubmit", **Then** I see a validation message: "Please address the feedback before resubmitting" and the form does not submit.

**Withdraw Proposal:**

5. **Given** I want to abandon my proposal after receiving feedback, **When** I click "Withdraw Proposal", **Then** I see a confirmation dialog: "Withdraw this proposal? This cannot be undone." Confirming changes the status to "Withdrawn" and an audit event is recorded.

**Unsaved Changes Guard:**

6. **Given** I have modified any field in revision mode, **When** I navigate away without resubmitting, **Then** I see the same "unsaved changes" confirmation dialog used in the proposal form (from Story 5.1).

**Accessibility:**

7. **Given** I am using a screen reader, **When** I interact with the revision form, **Then** the feedback banner is announced with its content, the "Resubmit" and "Withdraw" buttons have descriptive labels, the change detection validation message is announced via `aria-live`, and the withdraw confirmation dialog is properly announced with focus trapped.

## Dev Notes

### Architecture Patterns to Follow

- **Reuse ProposalForm in revision mode**: The `ProposeTerm.tsx` component already supports new and edit modes. Add a third mode: "revision" — detected via a URL parameter like `?reviseProposalId={id}`. In revision mode: form heading reads "Revise Your Proposal", feedback banner displayed at top, fields pre-filled with previous proposal values, submit button reads "Resubmit", and navigation back goes to "My Proposals" list. Source: Epic 6.4 dev notes.
- **New API endpoints needed**:
  - `POST /api/proposals/:id/resubmit` — accepts updated proposal body, validates the proposal is in "changes_requested" status, updates all proposal fields, resets status to "pending", records a "resubmitted" audit event. Returns the updated proposal.
  - `POST /api/proposals/:id/withdraw` — validates the proposal is in "changes_requested" or "pending" status, updates status to "withdrawn" (add to status enum if needed), records a "withdrawn" audit event.
- **"My Proposals" access**: Proposers need a way to find their proposals. Add a route `GET /api/proposals?submitterId={userId}` or use the existing `GET /api/proposals` filtered client-side by `submittedBy`. Since auth is not wired, filter by the hardcoded "Current User" name. A "My Proposals" navigation entry or section should be added to the sidebar. Source: Epic 6.4 dev notes.
- **Change detection**: Use react-hook-form's `isDirty` flag which compares current values against `defaultValues` set via `form.reset()` with the original proposal data. For array fields (examples, synonyms) managed via separate state, use the same dual-track approach from Story 5.2 (`JSON.stringify` comparison). Source: Epic 5 retro Lesson 2.
- **Storage interface**: Add methods to `IStorage`:
  - `resubmitProposal(id: string, updates: Partial<InsertProposal>): Promise<Proposal | undefined>` — update proposal fields and reset status to "pending"
  - `withdrawProposal(id: string): Promise<Proposal | undefined>` — update status to "withdrawn"
- **Proposal status enum**: The existing `proposalStatusEnum` has values: `"pending"`, `"in_review"`, `"changes_requested"`, `"approved"`, `"rejected"`. Add `"withdrawn"` to the enum. Source: shared/schema.ts.
- **Toast notifications**: "Your revised proposal has been resubmitted for review" (success, 4s auto-dismiss). Source: UX Pattern 9.
- **Confirmation dialog for withdraw**: Use `AlertDialog` component. Enter does NOT confirm (destructive action). Source: UX Modal & Dialog Patterns.
- **`data-testid` attributes**: Required on feedback banner (`feedback-banner`), resubmit button (`resubmit-button`), withdraw button (`withdraw-button`), confirmation dialog (`withdraw-confirmation-dialog`), change detection message (`no-changes-message`). Source: project-context.md.

### UI/UX Deliverables

- **Proposal revision page** (within `ProposeTerm.tsx` or new component): Revision mode for proposals with "Changes Requested" status:
  - Feedback banner at the top: amber/warning styled container with the reviewer's feedback text, clearly visible before the form fields. Label: "Reviewer feedback" or "Changes were requested"
  - Form pre-filled with all previous proposal values (name, category, definition, whyExists, usedWhen, notUsedWhen, examplesGood, examplesBad, synonyms)
  - All fields editable
  - Heading: "Revise Your Proposal" or "Revise: {term name}"
  - Submit button: "Resubmit" (primary green)
  - "Withdraw Proposal" link/button (destructive, behind confirmation dialog)
  - "Back to My Proposals" navigation
- **"My Proposals" page or section**: A view where proposers can see their own proposals with status indicators:
  - List of proposals submitted by the current user
  - Status badges: Pending (blue), Changes Requested (amber), Approved (green), Rejected (red), Withdrawn (gray)
  - Click on a "Changes Requested" proposal navigates to revision mode
  - Can be a new page (`/my-proposals`) or a section within the existing navigation
- **Withdraw confirmation dialog**: AlertDialog with title "Withdraw this proposal?", description "This cannot be undone.", Cancel button, and "Withdraw" button (destructive). Enter does NOT confirm.
- **UI states**: Loading (spinner while proposal data fetches), Error (toast for failed resubmission/withdrawal), Success (toast + navigation), Change detection error (inline validation message).

### Anti-Patterns & Hard Constraints

- **DO NOT** allow resubmission without changes — enforce change detection comparing against original proposal values.
- **DO NOT** allow withdrawal of already-approved or already-rejected proposals — only proposals in "changes_requested" or "pending" status can be withdrawn.
- **DO NOT** allow resubmission of proposals not in "changes_requested" status — the resubmit endpoint must validate the proposal status.
- **DO NOT** create a completely separate form component — reuse the existing `ProposeTerm.tsx` form patterns (progressive disclosure, conversational labels, inline validation) in revision mode. If the component becomes too complex, a separate `ReviseProposal.tsx` page that composes the same form elements is acceptable.
- **DO NOT** modify the existing new-proposal or edit-proposal flows in `ProposeTerm.tsx` — revision mode is additive, not a refactor of existing functionality.
- **DO NOT** use `react-router` — use `wouter` exclusively. Source: project-context.md.
- **DO NOT** use `heroicons` or `react-icons` — use `lucide-react` for icons. Source: project-context.md.
- **DO NOT** hardcode hex colors — use Katalyst brand tokens. Source: project-context.md.

### Gotchas & Integration Warnings

- **Proposal status enum change**: Adding "withdrawn" to `proposalStatusEnum` in `shared/schema.ts` requires running `npm run db:push`. This is a schema-level enum change — Drizzle Kit should handle adding the new value to the PostgreSQL enum. Verify the push doesn't fail due to enum modification limitations in PostgreSQL (adding values to enums is generally safe, but modifying or removing values is not).
- **Form field mapping in revision mode**: Proposals store fields like `termName`, `definition`, `whyExists` etc. The `ProposeTerm.tsx` form uses snake_case internally (`why_exists`, `used_when`) and maps to camelCase on submission. When pre-filling from a proposal (which has camelCase fields), the mapping needs to go in the opposite direction: `whyExists` → `why_exists` for the form's `defaultValues`. This is the reverse of the existing submission mapping.
- **Change detection for revision**: The `isDirty` approach works differently in revision mode vs edit mode. In edit mode (Story 5.2), `defaultValues` are set from the original term. In revision mode, `defaultValues` should be set from the original proposal values (the values the proposer previously submitted). A field is "changed" if it differs from the proposal's current values.
- **"My Proposals" authentication gap**: Since auth is not wired, filtering proposals by "Current User" matches all proposals submitted with `submittedBy: "Current User"` (which is all proposals from Epic 5). In production, this would be filtered by the authenticated user's ID. For now, the UI should work with the hardcoded name.
- **Audit event recording on resubmit**: The resubmit endpoint should create a "resubmitted" audit event (from Story 6.3's `proposalEvents` table). Ensure Story 6.3 is implemented before 6.4, or add the event recording code that will work once the table exists.
- **Array field pre-fill**: The proposal stores `examplesGood`, `examplesBad`, and `synonyms` as text arrays. The form manages these via separate `useState` arrays (not form fields). Pre-filling requires initializing these state arrays from the proposal data.
- **Unsaved changes guard**: Reuse the `formDirtyRef` pattern from Epic 5 (Story 5.1) — a ref that syncs from watched form values, used in `beforeunload` and navigation guard callbacks to avoid stale closure issues. Source: Epic 5 retro Lesson 3.
- **Feedback display**: The reviewer's feedback is stored in the proposal's `reviewComment` field. For multi-round proposals (requested changes multiple times), the full history comes from `proposalEvents`. Display the most recent `changes_requested` event's comment as the feedback banner, with the full audit trail visible below.
- **Route registration**: If creating new pages (`/my-proposals`, `/revise/:proposalId`), register them in `client/src/App.tsx` with `<Route>` components. Source: Architecture AD-4.
- **Navigation update**: Add "My Proposals" to the sidebar in `Layout.tsx` — likely under a "My Activity" section or alongside "Propose Term". Source: Layout.tsx.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add "withdrawn" to `proposalStatusEnum` |
| `server/storage.ts` | MODIFY | Add `resubmitProposal()` and `withdrawProposal()` methods to IStorage interface and DatabaseStorage |
| `server/routes.ts` | MODIFY | Add `POST /api/proposals/:id/resubmit` and `POST /api/proposals/:id/withdraw` endpoints, both recording audit events |
| `client/src/lib/api.ts` | MODIFY | Add `resubmit(id, data)` and `withdraw(id)` methods to `api.proposals` |
| `client/src/pages/ProposeTerm.tsx` | MODIFY | Add revision mode (detected via `?reviseProposalId={id}`) — feedback banner, pre-fill from proposal, resubmit action, change detection, withdraw button |
| `client/src/pages/MyProposals.tsx` | CREATE | New page listing the current user's proposals with status badges, click-to-revise for "Changes Requested" proposals |
| `client/src/App.tsx` | MODIFY | Register `/my-proposals` and potentially `/revise/:id` routes |
| `client/src/components/Layout.tsx` | MODIFY | Add "My Proposals" navigation link to sidebar |

### Dependencies & Environment Variables

- **No new packages needed** — all required libraries already installed
- **No new environment variables needed**
- **Database migration required** — run `npm run db:push` after adding "withdrawn" to `proposalStatusEnum`
- **Depends on Stories 6.1, 6.2, and 6.3** — Story 6.4 uses the audit trail from 6.3 to record resubmit/withdraw events, and builds on the review queue from 6.1/6.2 which processes resubmitted proposals

### References

- [Source: _bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md#Epic 6 Story 6.4] — Full acceptance criteria and dev notes
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-2] — Storage interface pattern
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-3] — Schema-first shared types
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-4] — Client-side routing with Wouter
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#Schema Change Protocol] — Steps for modifying schemas
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey 5] — Review and Approve flow
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Modal & Dialog Patterns] — Withdraw confirmation (destructive action)
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Form Patterns] — Progressive disclosure, validation patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Toast patterns, inline warnings
- [Source: _bmad-output/project-context.md] — Critical implementation rules, anti-patterns
- [Source: _bmad-output/implementation-artifacts/5-1-proposal-form-for-new-terms.md] — ProposalForm patterns (progressive disclosure, unsaved changes guard, toast)
- [Source: _bmad-output/implementation-artifacts/5-2-propose-edits-to-existing-terms.md] — Edit mode patterns (change detection, pre-fill, isDirty + array comparison)
- [Source: _bmad-output/implementation-artifacts/epic-5-retro-2026-02-12.md] — Lessons: dual-track change detection, ref-based dirty tracking, sequential story stacking
- [Source: _bmad-output/implementation-artifacts/6-1-proposal-review-queue.md] — Story 6.1 context
- [Source: _bmad-output/implementation-artifacts/6-2-proposal-review-and-decision.md] — Story 6.2 context (approval/rejection/request-changes)
- [Source: _bmad-output/implementation-artifacts/6-3-proposal-audit-trail.md] — Story 6.3 context (proposalEvents table, event recording)
- [Source: client/src/pages/ProposeTerm.tsx] — Existing proposal form with new + edit modes
- [Source: client/src/lib/api.ts] — Existing API client methods
- [Source: shared/schema.ts] — Existing proposalStatusEnum to extend

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
Added "withdrawn" to proposalStatusEnum. Created POST /api/proposals/:id/resubmit (validates changes_requested status, updates fields, resets to pending, records resubmitted event) and POST /api/proposals/:id/withdraw (validates status, sets withdrawn, records event). Created MyProposals page showing user's proposals with status badges, feedback display, revise button for changes_requested, withdraw button with confirmation dialog (Enter does NOT confirm). Added revision mode to ProposeTerm via ?reviseProposalId= URL param — fetches proposal, pre-fills form, shows feedback banner, resubmit button with change detection ("Please address the feedback before resubmitting"), navigates to /my-proposals on success. Added "My Proposals" to sidebar navigation and /my-proposals route to App.tsx.

### File List
- shared/schema.ts (MODIFIED — added "withdrawn" to proposalStatusEnum)
- server/routes.ts (MODIFIED — added resubmit and withdraw endpoints with audit events)
- client/src/lib/api.ts (MODIFIED — added resubmit and withdraw API methods)
- client/src/pages/MyProposals.tsx (CREATED — My Proposals page with proposal list, status badges, feedback, withdraw)
- client/src/pages/ProposeTerm.tsx (MODIFIED — revision mode: proposal query, pre-fill, feedback banner, resubmit mutation, change detection)
- client/src/App.tsx (MODIFIED — registered /my-proposals route)
- client/src/components/Layout.tsx (MODIFIED — added My Proposals nav item with FileEdit icon)
- client/src/pages/ReviewQueue.tsx (MODIFIED — added "withdrawn" to StatusBadge styles/labels)
