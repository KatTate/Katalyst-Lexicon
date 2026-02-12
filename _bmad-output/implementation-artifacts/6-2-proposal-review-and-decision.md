# Story 6.2: Proposal Review and Decision

Status: review

## Story

As an approver reviewing a proposal,
I want to see the full proposed term details and choose to approve, reject, or request changes,
so that I can make an informed decision and provide feedback to the contributor.

## Acceptance Criteria

**Proposal Detail Display:**

1. **Given** I am viewing a proposal review page, **When** the page loads, **Then** I see all proposed term fields: name, definition, category, why it exists, usage guidance (when to use, when not to use), examples (good and bad), and synonyms. I also see the submitter's name, submission date, and the proposal type indicator (New or Edit).

**Edit Proposal Diff View:**

2. **Given** the proposal is an edit (type "Edit"), **When** I view the review page, **Then** I see each field with an inline diff showing changes: removed text displayed with strikethrough styling and added text displayed with highlight styling. Unchanged fields appear normally without diff markup.

**Approve Flow:**

3. **Given** I want to approve the proposal, **When** I click the "Approve" button, **Then** I see a confirmation dialog: "Approve this proposal? This will create/update the term." The Enter key does NOT confirm the dialog (AR15 — destructive action protection). I must click the "Confirm Approve" button to proceed.

4. **Given** I confirm approval, **When** the approval processes, **Then** the corresponding term is created (for new proposals) or updated (for edit proposals) with the proposed values, a version history entry is created with the change notes, the proposal status changes to "Approved", an audit event is recorded, I see a success toast: "Proposal approved — term has been published", and I am returned to the review queue.

**Race Condition Protection:**

5. **Given** the proposal has already been approved, rejected, or had changes requested by another reviewer, **When** I click Approve (or Reject or Request Changes), **Then** I see an error message: "This proposal has already been reviewed" and the page refreshes to show the current proposal status.

**Reject Flow:**

6. **Given** I want to reject the proposal, **When** I click the "Reject" button, **Then** a text area appears asking for a rejection reason (required). I must enter a reason before the rejection can be confirmed.

7. **Given** I confirm the rejection with a reason, **When** the rejection processes, **Then** the proposal status changes to "Rejected" with my reason saved, an audit event is recorded, I see a toast: "Proposal rejected", and I am returned to the review queue.

**Request Changes Flow:**

8. **Given** I want to request changes, **When** I click "Request Changes", **Then** a text area appears for feedback (required). I must enter feedback before submitting.

9. **Given** I submit a change request with feedback, **When** the request processes, **Then** the proposal status changes to "Changes Requested" with my feedback saved, an audit event is recorded, I see a toast: "Feedback sent to the proposer", and I am returned to the review queue.

**Accessibility:**

10. **Given** I am using a screen reader, **When** I interact with the review actions, **Then** the confirmation dialog is announced with its purpose, focus is trapped within the dialog until I dismiss or confirm it, and the decision outcome toast is announced via `aria-live` region.

## Dev Notes

### Architecture Patterns to Follow

- **Existing ReviewQueue.tsx**: The review detail panel already exists in `ReviewQueue.tsx` with a right-panel detail view showing proposal fields, diff view for edits, and action buttons (Approve & Publish, Request Changes, Reject). Story 6.2 refines this to match the epic ACs exactly — adding the confirmation dialog for approval, ensuring the reject/request-changes flows require reasons/feedback, handling 409 race conditions, and using the correct toast messages. Source: Architecture Pattern 4.
- **Existing API endpoints**: All three decision endpoints exist:
  - `POST /api/proposals/:id/approve` — already wraps in a transaction that validates proposal is "pending", creates/updates term, creates version history, updates status. Returns 409 if proposal no longer pending. Source: server/routes.ts lines 218-263.
  - `POST /api/proposals/:id/reject` with `{ comment }` body. Source: server/routes.ts lines 265-278.
  - `POST /api/proposals/:id/request-changes` with `{ comment }` body. Source: server/routes.ts lines 280-293.
- **Client API methods**: `api.proposals.approve(id, comment?, approvedBy?)`, `api.proposals.reject(id, comment?)`, `api.proposals.requestChanges(id, comment?)` already exist in `client/src/lib/api.ts`. Source: api.ts lines 116-126.
- **Transaction safety**: The approve endpoint in `server/routes.ts` already performs the multi-step operation (validate status → create/update term → create version → update proposal status). Verify it uses `db.transaction()` for atomicity. If not, wrap it in a transaction. The architecture doc flags this as a known gap: "No database transactions — Proposal approval is not atomic (multi-table)". Source: Architecture Known Gaps.
- **Confirmation dialog**: Use shadcn/ui `AlertDialog` component. Set `autoFocus` on the Cancel button so Enter does NOT trigger confirmation (AR15). Source: UX Modal & Dialog Patterns, Epic 6 AC.
- **Button hierarchy**: Approve = primary green (`bg-kat-green text-white`), Request Changes = secondary outlined, Reject = destructive (behind confirmation). Source: UX Pattern 10, UX13.
- **Toast notifications**: Success toasts auto-dismiss (4s). Error toasts persist (`variant: "destructive"`). Source: UX Pattern 9.
- **TanStack Query mutations**: Use `useMutation` for approve/reject/request-changes. On success, invalidate `["/api/proposals"]` and `["/api/terms"]` query keys. Source: AD-5.
- **Edit diff display**: The existing ReviewQueue.tsx already has `DiffField` and `DiffArrayField` helper components for showing inline diffs. Verify they show strikethrough for removed text and highlight for added text per the AC. Source: ReviewQueue.tsx.
- **`data-testid` attributes**: Required on approve button (`approve-button`), reject button (`reject-button`), request-changes button (`request-changes-button`), confirmation dialog (`approval-confirmation-dialog`), reason/feedback textarea (`review-comment-textarea`), proposal fields, and diff highlights. Source: project-context.md, NFR6.

### UI/UX Deliverables

- **Proposal review detail panel** (within `ReviewQueue.tsx`): Refinement of existing detail view to ensure:
  - All proposed fields displayed: name, definition, category, whyExists, usedWhen, notUsedWhen, examplesGood, examplesBad, synonyms
  - Submitter name, submission date, proposal type (New/Edit) clearly visible
  - For edit proposals: inline diff with strikethrough (removed) and highlight (added)
- **Approval confirmation dialog**: AlertDialog with title "Approve this proposal?", description "This will create/update the term.", Cancel button (autoFocused), and "Confirm Approve" button. Enter key does NOT confirm.
- **Rejection flow**: Click "Reject" → textarea appears for reason (required). Cannot submit without reason. Confirm triggers rejection.
- **Request Changes flow**: Click "Request Changes" → textarea appears for feedback (required). Cannot submit without feedback. Confirm triggers request-changes.
- **Race condition error**: If server returns 409, display error message "This proposal has already been reviewed" and refetch proposal data to show current status.
- **Button styling**: Approve = green primary, Request Changes = outlined secondary, Reject = destructive red.
- **Navigation after decision**: Return to review queue on successful approve/reject/request-changes.
- **Toast messages**: "Proposal approved — term has been published" (success), "Proposal rejected" (success), "Feedback sent to the proposer" (success), "This proposal has already been reviewed" (error on 409).

### Anti-Patterns & Hard Constraints

- **DO NOT** skip the confirmation dialog for approval — the epic explicitly requires it with AR15 protection (Enter does NOT confirm). This deviates from the general UX pattern of "no confirmation for positive actions" but is justified because approval atomically creates/updates a term.
- **DO NOT** allow rejection or request-changes without a reason/feedback — both require text input.
- **DO NOT** create separate page components for the review detail — it lives within `ReviewQueue.tsx` as the detail panel.
- **DO NOT** modify `shared/schema.ts` — no schema changes needed for review decisions. The `reviewComment` field on the proposals table already stores reviewer feedback.
- **DO NOT** use `react-router` — use `wouter` exclusively. Source: project-context.md.
- **DO NOT** use `heroicons` or `react-icons` — use `lucide-react` for icons. Source: project-context.md.
- **DO NOT** hardcode hex colors — use Katalyst brand tokens. Source: project-context.md.

### Gotchas & Integration Warnings

- **409 Conflict handling**: The approve endpoint already returns 409 when the proposal is no longer "pending". Verify the client-side mutation error handler checks for 409 status and shows the race condition error message. The existing mutations may only show generic error toasts.
- **Approval atomicity**: Verify that `server/routes.ts` wraps the approve flow in `db.transaction()`. The current implementation may perform multiple storage calls sequentially without a transaction, which could leave the database in an inconsistent state if one step fails. This is flagged as a known architectural gap.
- **Term creation on approval**: When approving a "new" proposal, the route creates a term with `status: "Canonical"`. When approving an "edit" proposal, it updates the existing term. Both operations automatically create `TermVersion` entries via `storage.createTerm()` / `storage.updateTerm()`. Verify the change note from the proposal's `changesSummary` is passed through to the version history.
- **Comment field mapping**: The reject and request-changes endpoints accept `{ comment }` in the body. This is stored in the proposal's `reviewComment` field. The approve endpoint accepts `{ comment, approvedBy }`. Verify the client sends the right field names.
- **Diff view for edits**: The edit diff requires fetching the original term data alongside the proposal data to show what changed. The existing implementation may already do this. If not, an additional `GET /api/terms/:id` call is needed when viewing an edit proposal.
- **Existing tab structure**: The current ReviewQueue.tsx has All/Pending/Review/Changes tabs. Story 6.1 and 6.2 together should ensure this tab structure works correctly. The "Pending" tab corresponds to the main review queue. The other tabs show proposals in other states (approved, rejected, changes requested) which is useful for reviewers to track their decisions.
- **Auth not wired**: The `approvedBy` field is sent as a string parameter. Currently this would need to be a hardcoded value like "Current Approver" until auth is implemented. Consistent with the `submittedBy: "Current User"` pattern from Epic 5.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/ReviewQueue.tsx` | MODIFY | Add AlertDialog for approval confirmation (Enter does NOT confirm), require reason for reject and feedback for request-changes, handle 409 race condition error, update toast messages to match spec, verify diff view styling, add `data-testid` attributes |
| `server/routes.ts` | MODIFY | Wrap approve endpoint in `db.transaction()` for atomicity if not already transactional; verify 409 handling |
| `client/src/lib/api.ts` | MODIFY (if needed) | Verify approve/reject/request-changes API methods pass correct parameters |

### Dependencies & Environment Variables

- **No new packages needed** — `AlertDialog` component already available from shadcn/ui in `@/components/ui/alert-dialog.tsx`.
- **No new environment variables needed**
- **No new API endpoints needed** — all three decision endpoints already exist
- **Depends on Story 6.1** — Story 6.2 builds on the review queue established in 6.1

### References

- [Source: _bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md#Epic 6 Story 6.2] — Full acceptance criteria and dev notes
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#Pattern 4] — Proposal approval flow (state machine)
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-9] — Automatic version history on term create/update
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#Known Gaps] — "No database transactions" for approval atomicity
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey 5] — Review and Approve user journey
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Modal & Dialog Patterns] — Confirmation dialog: Enter does NOT confirm
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Button Hierarchy] — Approve green, Request Changes outlined, Reject destructive
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Feedback Patterns] — Toast patterns, success auto-dismiss, error persistent
- [Source: _bmad-output/project-context.md] — Critical implementation rules, anti-patterns, AR15/AR20 references
- [Source: client/src/pages/ReviewQueue.tsx] — Existing review queue with detail panel and actions
- [Source: server/routes.ts] — Existing approve/reject/request-changes endpoints
- [Source: client/src/lib/api.ts] — Existing API client methods
- [Source: _bmad-output/implementation-artifacts/6-1-proposal-review-queue.md] — Story 6.1 context (queue display, ordering, permissions)
- [Source: _bmad-output/implementation-artifacts/5-1-proposal-form-for-new-terms.md] — Epic 5 toast and validation patterns
- [Source: _bmad-output/implementation-artifacts/epic-5-retro-2026-02-12.md] — Epic 5 lessons learned

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
Added AlertDialog confirmation for approval with AR15 protection (Enter does NOT confirm, Cancel autoFocused). Reject and Request Changes now require comment text — validation toast shown if empty. All three decision endpoints now return 409 Conflict when proposal has already been reviewed (race condition protection). Approve endpoint wrapped in db.transaction() for atomicity. Toast messages updated to match spec: "Proposal approved — term has been published", "Proposal rejected", "Feedback sent to the proposer". Client-side 409 error handler shows "This proposal has already been reviewed" and refreshes data.

### File List
- server/routes.ts (MODIFIED — approve wrapped in transaction, 409 protection on approve/reject/request-changes)
- client/src/pages/ReviewQueue.tsx (MODIFIED — AlertDialog for approval, required comments for reject/request-changes, 409 error handling, updated toast messages, data-testid updates)
