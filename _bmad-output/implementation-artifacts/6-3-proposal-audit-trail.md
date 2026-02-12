# Story 6.3: Proposal Audit Trail

Status: done

## Story

As an approver or admin,
I want to see the full history of decisions made on a proposal,
so that I can understand who reviewed it and what feedback was given.

## Acceptance Criteria

**Audit Trail Display:**

1. **Given** I am viewing a proposal that has been reviewed (approved, rejected, or had changes requested), **When** I look at the proposal detail page, **Then** I see an audit trail section showing all actions taken: submission, any change requests with feedback text, and the final decision (approved/rejected) with timestamp and reviewer name for each event.

**Multi-Round History:**

2. **Given** a proposal went through multiple rounds (submitted → changes requested → resubmitted → approved), **When** I view the audit trail, **Then** I see each event in chronological order with timestamps, actor names, and any comments/feedback associated with each event.

**Fresh Proposal:**

3. **Given** I view a freshly submitted proposal (no decisions yet), **When** I look at the audit trail, **Then** I see a single entry: "Submitted by {name} on {date}".

**Accessibility:**

4. **Given** I am using a screen reader, **When** I interact with the audit trail, **Then** each event entry has a descriptive label including the event type, actor, and timestamp, and the audit trail section has an accessible heading.

## Dev Notes

### Architecture Patterns to Follow

- **New `proposalEvents` table**: Create a dedicated `proposalEvents` table in `shared/schema.ts` (NOT a JSON column). Columns: `id` (UUID PK), `proposalId` (FK to proposals), `eventType` (enum), `actorId` (text — actor name, since auth is not wired), `timestamp` (defaultNow), `comment` (text, nullable). Source: Epic 6.3 dev notes.
- **Event types enum**: Define `proposalEventTypeEnum` in `shared/schema.ts` with values: `"submitted"`, `"changes_requested"`, `"resubmitted"`, `"approved"`, `"rejected"`, `"withdrawn"`. Include `"withdrawn"` for Story 6.4's withdraw flow. Source: Epic 6.3 dev notes, Epic 6.4 AC.
- **Schema-first types**: Follow the existing pattern in `shared/schema.ts` — define table with `pgTable()`, create insert schema with `createInsertSchema().omit({ id: true })`, export both `ProposalEvent` (select) and `InsertProposalEvent` (insert) types. Source: Architecture AD-3.
- **Storage interface**: Add methods to `IStorage` in `server/storage.ts`:
  - `createProposalEvent(event: InsertProposalEvent): Promise<ProposalEvent>` — insert a new event
  - `getProposalEvents(proposalId: string): Promise<ProposalEvent[]>` — get all events for a proposal, ordered by `asc(timestamp)`
- **API integration**: Include events in the `GET /api/proposals/:id` response as an `events` array. Modify the route handler to fetch events alongside the proposal data. Source: Epic 6.3 dev notes.
- **Event recording**: Modify the existing approve, reject, and request-changes endpoints in `server/routes.ts` to create `proposalEvents` entries alongside their existing operations. Also modify `POST /api/proposals` (create proposal) to record a "submitted" event when a new proposal is created. Source: Architecture Pattern 4.
- **UUID primary keys**: Use `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)` consistent with all other tables. Source: AD-8.
- **`data-testid` attributes**: `data-testid="audit-trail-section"` on the container, `data-testid="audit-event-{index}"` on each event entry. Source: project-context.md, Epic 6.3 dev notes.

### UI/UX Deliverables

- **Audit trail section** (within `ReviewQueue.tsx` proposal detail panel): A chronological list of events displayed in the proposal detail view.
  - Each event shows: event type icon/label, actor name, timestamp (relative + absolute on hover), and comment/feedback text (if present)
  - Event types displayed as human-readable labels:
    - `submitted` → "Submitted by {name}"
    - `changes_requested` → "Changes requested by {name}" + feedback text
    - `resubmitted` → "Resubmitted by {name}"
    - `approved` → "Approved by {name}" + optional comment
    - `rejected` → "Rejected by {name}" + reason text
    - `withdrawn` → "Withdrawn by {name}"
  - Events ordered chronologically (oldest first)
  - Visual timeline styling: vertical line connecting events, event type icons with semantic colors (green for approved, red for rejected, amber for changes_requested, blue for submitted/resubmitted)
- **Placement**: Below the proposal fields and above the action buttons in the review detail panel. The audit trail provides context before the reviewer makes a decision.
- **UI states**: Loading (skeleton while events fetch), Empty (single "Submitted" entry for new proposals).

### Anti-Patterns & Hard Constraints

- **DO NOT** store audit events as a JSON column on the proposals table — use a dedicated `proposalEvents` table for proper querying, indexing, and relational integrity. Source: Epic 6.3 dev notes.
- **DO NOT** use the existing `termVersions` table for proposal audit events — `termVersions` tracks term snapshots (definition/field changes), while `proposalEvents` tracks the proposal review workflow (submitted/approved/rejected/etc.). These are different concerns.
- **DO NOT** remove or modify the existing `reviewComment` field on the proposals table — it stores the most recent reviewer comment and is used by the existing review UI. The `proposalEvents` table provides the full history.
- **DO NOT** create a separate page for the audit trail — it's a section within the proposal detail view on the review page.
- **DO NOT** modify the existing approve/reject/request-changes endpoint return signatures — add event creation as a side effect within those endpoints.
- **DO NOT** use `react-router` — use `wouter` exclusively. Source: project-context.md.
- **DO NOT** use `heroicons` or `react-icons` — use `lucide-react` for icons. Source: project-context.md.

### Gotchas & Integration Warnings

- **Backfilling existing proposals**: Existing proposals in the database (from seed data and Epic 5 testing) won't have `proposalEvents` entries. The UI should handle proposals with an empty events array gracefully — either show no audit trail or show a "Submitted by {submittedBy} on {submittedAt}" entry derived from the proposal's own fields as a fallback.
- **`actorId` is a name string, not a user ID**: Since auth is not wired (AD-10), the `actorId` field stores the actor's display name (e.g., "Current User", "Current Approver") consistent with the `submittedBy` pattern from Epic 5. When auth is implemented, this can be updated to store actual user IDs with a join to the users table for display names.
- **Event creation inside transactions**: When adding event creation to the approve endpoint, ensure it's inside the existing transaction scope so the event is only recorded if the approval succeeds. If the approval fails (e.g., 409 conflict), no event should be recorded.
- **Schema migration**: Adding the `proposalEvents` table requires running `npm run db:push` (drizzle-kit push) after modifying `shared/schema.ts`. This is a non-destructive migration (adding a new table). Source: Architecture Schema Change Protocol.
- **GET /api/proposals/:id response change**: Adding an `events` array to the single-proposal response may affect the TypeScript types. Update the `Proposal` interface in `client/src/lib/api.ts` to include `events?: ProposalEvent[]` (optional for backward compatibility).
- **Event ordering**: Events should be ordered by `timestamp` ascending (chronological). Use `asc(proposalEvents.timestamp)` in the storage method.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `shared/schema.ts` | MODIFY | Add `proposalEventTypeEnum`, `proposalEvents` table, insert schema, and exported types |
| `server/storage.ts` | MODIFY | Add `createProposalEvent()` and `getProposalEvents()` to IStorage interface and DatabaseStorage implementation |
| `server/routes.ts` | MODIFY | Add event creation to `POST /api/proposals` (submitted), `POST /api/proposals/:id/approve` (approved), `POST /api/proposals/:id/reject` (rejected), `POST /api/proposals/:id/request-changes` (changes_requested). Include events in `GET /api/proposals/:id` response |
| `client/src/lib/api.ts` | MODIFY | Add `ProposalEvent` interface, update `Proposal` interface to include optional `events` array |
| `client/src/pages/ReviewQueue.tsx` | MODIFY | Add audit trail section to proposal detail panel, rendering events chronologically with actor names, timestamps, and comments |

### Dependencies & Environment Variables

- **No new packages needed** — all required libraries already installed
- **No new environment variables needed**
- **Database migration required** — run `npm run db:push` after adding `proposalEvents` table to schema
- **Depends on Stories 6.1 and 6.2** — 6.3 extends the proposal detail view established in 6.1/6.2 with the audit trail section

### References

- [Source: _bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md#Epic 6 Story 6.3] — Full acceptance criteria and dev notes
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-3] — Schema-first shared types pattern
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-8] — UUID primary keys
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-9] — Automatic version history (separate from proposal events)
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#Schema Change Protocol] — Steps for adding new tables
- [Source: _bmad-output/planning-artifacts/prd-katalyst-lexicon-2026-02-06.md#FR23] — Maintain full audit trail of all proposal decisions
- [Source: _bmad-output/project-context.md] — Critical implementation rules, Drizzle patterns, schema conventions
- [Source: shared/schema.ts] — Existing proposals table, termVersions table, enum patterns
- [Source: server/storage.ts] — IStorage interface pattern, DatabaseStorage implementation
- [Source: server/routes.ts] — Existing proposal endpoints to extend with event recording
- [Source: _bmad-output/implementation-artifacts/6-1-proposal-review-queue.md] — Story 6.1 context
- [Source: _bmad-output/implementation-artifacts/6-2-proposal-review-and-decision.md] — Story 6.2 context (approval/rejection/request-changes flows)

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
Created proposalEvents table in shared/schema.ts with proposalEventTypeEnum (submitted, changes_requested, resubmitted, approved, rejected, withdrawn). Added createProposalEvent() and getProposalEvents() to IStorage interface and DatabaseStorage. Modified all proposal action endpoints (create, approve, reject, request-changes) to record audit events. GET /api/proposals/:id now includes events array in response. Added audit trail UI section to ReviewQueue detail panel with chronological timeline, color-coded event types, actor names, timestamps, and comments. Fallback handles proposals without events by deriving a "Submitted" entry from proposal fields.

### File List
- shared/schema.ts (MODIFIED — added proposalEventTypeEnum, proposalEvents table, insertProposalEventSchema, types)
- server/storage.ts (MODIFIED — added createProposalEvent, getProposalEvents to interface and implementation)
- server/routes.ts (MODIFIED — record events on create/approve/reject/request-changes, include events in GET :id)
- client/src/lib/api.ts (MODIFIED — added ProposalEvent interface, events field on Proposal, "withdrawn" status)
- client/src/pages/ReviewQueue.tsx (MODIFIED — added audit trail section with timeline UI, proposalDetail query)
