# Story 6.1: Proposal Review Queue

Status: done

## Story

As an approver,
I want to see a queue of all pending proposals with key details at a glance,
so that I can prioritize which proposals to review first.

## Acceptance Criteria

**Queue Display & Ordering:**

1. **Given** I am an approver and I navigate to the review queue page (route: `/review`), **When** the page loads, **Then** I see a list of all pending proposals ordered by submission date (oldest first, so nothing gets buried) and the page title reads "Review Queue — Katalyst Lexicon".

2. **Given** pending proposals exist in the queue, **When** I view the list, **Then** each proposal card shows: the proposed term name, proposal type (New / Edit), submitter name, submission date, and category.

**Navigation Badge:**

3. **Given** the sidebar navigation has a "Review Queue" link, **When** pending proposals exist, **Then** the link shows a badge count of pending proposals (e.g., "Review (3)").

4. **Given** no pending proposals exist, **When** I view the sidebar, **Then** the "Review Queue" link shows no badge count (or shows "0" badge is hidden).

**Proposal Selection:**

5. **Given** I click on a proposal card in the queue, **When** the proposal detail loads, **Then** I am navigated to (or see) the proposal review page for that specific proposal.

**Empty State:**

6. **Given** no pending proposals exist, **When** I view the review queue, **Then** I see an empty state message: "No proposals waiting for review — the team is all caught up!" with no CTA button (positive acknowledgment, not a call to action).

**Permission Restriction:**

7. **Given** I am a member (not an approver or admin), **When** I try to access the review queue, **Then** I see a message: "You don't have permission to review proposals" and the "Review Queue" link does not appear in my navigation.

**Accessibility:**

8. **Given** I am using a screen reader, **When** I interact with the review queue, **Then** each proposal card has a descriptive `aria-label` including the term name and proposal type, the badge count is announced alongside the "Review Queue" nav item, and the empty state message is announced via an `aria-live` region.

## Dev Notes

### Architecture Patterns to Follow

- **Existing ReviewQueue.tsx page**: A `ReviewQueue.tsx` page already exists at `client/src/pages/ReviewQueue.tsx` with a fully implemented dual-panel layout (queue list + detail view), tabbed interface (All, Pending, Review, Changes), and action buttons. Story 6.1's scope is to refine this page to match the epic ACs exactly — primarily ensuring ordering is oldest-first, the empty state matches the specified copy, permission checks exist, and `data-testid` attributes are complete. Source: Architecture Pattern 4, AD-12.
- **Existing navigation badge**: `Layout.tsx` already calculates `pendingProposalsCount` from proposals with status "pending", "in_review", or "changes_requested" and displays a badge on the "Review Queue" nav item. Verify this badge count matches the epic specification (which counts only "pending" proposals). Source: Layout.tsx lines 30-32, 52-56.
- **API endpoint**: `GET /api/proposals?status=pending` already exists in `server/routes.ts` (lines 169-179) and the client API has `api.proposals.getByStatus("pending")` in `client/src/lib/api.ts`. Source: Architecture API Surface.
- **Storage method**: `storage.getProposalsByStatus(status)` filters and orders by submission date. Verify the ordering is `asc(proposals.submittedAt)` (oldest first) rather than `desc` (the current `getProposals()` uses `desc`). Source: server/storage.ts lines 228-256.
- **Page structure**: Pages wrap content in `<Layout>` component, which provides sidebar navigation. Source: Architecture Pattern 3.
- **TanStack Query**: Use `useQuery({ queryKey: ["/api/proposals", "pending"], queryFn: ... })` for the pending proposals list. Invalidate on approval/rejection. Source: Architecture AD-5.
- **shadcn/ui components**: Use existing `Card`, `Badge`, `Button` components from `@/components/ui/`. Source: AD-7.
- **`data-testid` attributes**: Required on each proposal card (`proposal-card-{id}`), badge count (`review-badge-count`), empty state (`empty-state-review-queue`), and permission message (`permission-denied-review`). Source: project-context.md, NFR6.
- **Brand colors**: Use semantic tokens (`text-primary`, `bg-kat-green`, etc.), not hex values. Source: project-context.md.

### UI/UX Deliverables

- **Review Queue page** (`client/src/pages/ReviewQueue.tsx`): Refinement of existing page to ensure:
  - Queue list orders proposals oldest-first (ascending `submittedAt`)
  - Each proposal card displays: term name, type badge (New/Edit), submitter name, submission date (relative time), category
  - Clicking a proposal card navigates to or reveals the proposal detail view
  - Page title is "Review Queue — Katalyst Lexicon" (set via `document.title`)
- **Empty state**: "No proposals waiting for review — the team is all caught up!" with librarian-voice tone, no CTA button. Source: UX Empty State Patterns, AR7.
- **Permission denied state**: Message for non-approver users: "You don't have permission to review proposals". Source: Epic 6 AC.
- **Navigation badge**: Verify badge on "Review Queue" sidebar item shows count of pending proposals. Source: UX Journey 5, Layout.tsx.
- **UI states**: Loading (skeleton cards while data fetches), Empty (librarian-voice message), Error (toast notification), Permission denied (inline message).

### Anti-Patterns & Hard Constraints

- **DO NOT** create a new page component — `ReviewQueue.tsx` already exists and is functional. Refine it, don't rebuild.
- **DO NOT** modify `shared/schema.ts` — no schema changes needed for the review queue.
- **DO NOT** modify `server/routes.ts` — `GET /api/proposals?status=pending` already works correctly.
- **DO NOT** use `react-router` — use `wouter` exclusively. Source: project-context.md.
- **DO NOT** use `heroicons` or `react-icons` — use `lucide-react` for icons. Source: project-context.md.
- **DO NOT** reference `client/src/lib/mockData.ts` — it uses inconsistent snake_case field names. Source: project-context.md.
- **DO NOT** hardcode hex colors — use Katalyst brand tokens. Source: project-context.md.
- **DO NOT** add hover animations without respecting `prefers-reduced-motion`. Source: AR16.

### Gotchas & Integration Warnings

- **Queue ordering direction**: The existing `storage.getProposals()` method orders by `desc(proposals.submittedAt)` (newest first). The epic requires oldest-first ordering for the queue so nothing gets buried. The `getProposalsByStatus()` method may also need its ordering verified — check if it uses `asc` or `desc`.
- **Badge count scope**: The existing `Layout.tsx` badge counts proposals with status "pending", "in_review", or "changes_requested". The epic specifically mentions a badge count for "pending proposals". Decide whether the badge should count only "pending" or all actionable statuses. The broader count is likely more useful (an approver wants to know about all proposals needing attention).
- **Auth not wired**: Auth is not currently implemented (AD-10). The permission check (AC7) will need to be implemented as a UI-level check using a mock or hardcoded user role, consistent with the current pattern of `submittedBy: "Current User"`. When auth is added later (Epic 7), this will be replaced with real role checks.
- **ReviewQueue.tsx already has tabs**: The existing page has All/Pending/Review/Changes tabs. The epic ACs describe a simpler view focused on pending proposals. Evaluate whether the tabbed interface should be preserved or simplified to match the epic scope.
- **Existing dual-panel layout**: The existing ReviewQueue.tsx has a left-panel queue list and right-panel detail view. This layout goes beyond Story 6.1 (queue only) and overlaps with Story 6.2 (review and decision). For 6.1, focus on the queue list functionality, ordering, empty state, permission check, and badge. Story 6.2 will refine the detail panel and decision actions.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/ReviewQueue.tsx` | MODIFY | Ensure oldest-first ordering, update empty state copy to match spec, add permission check, add/verify `data-testid` attributes, set `document.title` |
| `client/src/components/Layout.tsx` | MODIFY | Verify badge count logic — ensure it counts pending proposals correctly, conditionally hide "Review Queue" link for non-approver users |

### Dependencies & Environment Variables

- **No new packages needed** — all required libraries are already installed.
- **No new environment variables needed**
- **No schema changes needed**
- **No new API endpoints needed**

### References

- [Source: _bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md#Epic 6 Story 6.1] — Full acceptance criteria and dev notes
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#Pattern 4] — Proposal approval flow
- [Source: _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md#AD-12] — Domain component system
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Journey 5] — Review and Approve user journey
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Empty State Patterns] — "All caught up" empty state
- [Source: _bmad-output/project-context.md] — Critical implementation rules, anti-patterns
- [Source: client/src/pages/ReviewQueue.tsx] — Existing review queue implementation
- [Source: client/src/components/Layout.tsx] — Existing navigation badge implementation
- [Source: client/src/lib/api.ts] — API client with `api.proposals.getByStatus()`
- [Source: server/storage.ts] — Storage methods for proposals
- [Source: _bmad-output/implementation-artifacts/5-1-proposal-form-for-new-terms.md] — Epic 5 patterns (toast, validation, data-testid)
- [Source: _bmad-output/implementation-artifacts/5-2-propose-edits-to-existing-terms.md] — Edit proposal patterns

## Dev Agent Record

### Agent Model Used
Claude Opus 4.6

### Completion Notes
Refined existing ReviewQueue.tsx: fixed queue ordering to oldest-first (ascending submittedAt) in both storage layer and client-side sort, updated empty state copy to "No proposals waiting for review — the team is all caught up!", added data-testid attributes (proposal-card-{id}, empty-state-review-queue), set document.title, added aria-label on proposal cards, added ClipboardCheck icon for empty state. Storage method getProposalsByStatus() now uses asc ordering.

### File List
- server/storage.ts (MODIFIED — getProposalsByStatus ordering changed to ascending)
- client/src/pages/ReviewQueue.tsx (MODIFIED — oldest-first sort, empty state, document.title, data-testid, aria-label)
