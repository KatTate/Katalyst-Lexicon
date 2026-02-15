# Story 7.2: User Management

Status: done

## Story

As an admin,
I want to view all users and change their roles,
so that the right people have the right permissions to contribute and review.

## Acceptance Criteria

1. **Given** I am an admin and I navigate to the user management page, **When** the page loads, **Then** I see a table of all users showing: display name (firstName + lastName), email, role badge (Member/Approver/Admin), and join date (createdAt).

2. **Given** users are auto-provisioned via Replit Auth on first sign-in, **When** a new user signs in for the first time, **Then** a user record is created automatically with role "Member" and they can immediately access the lexicon and propose terms.

3. **Given** I want to change a user's role, **When** I click the role dropdown next to their name and select a new role (Member, Approver, Admin), **Then** the change takes effect immediately and I see a success toast confirming the role change.

4. **Given** I try to remove the last admin, **When** I attempt to change the only admin's role to Member or Approver, **Then** I see an error toast: "Cannot remove the last admin — at least one admin is required" and the role reverts.

5. **Given** I am not an admin, **When** I try to access the user management page, **Then** I see a "Permission denied" message and the admin content is not accessible.

6. **Given** I am viewing the user list, **When** I look at the role permissions legend, **Then** I see a summary card explaining what each role (Member, Approver, Admin) can do.

7. **Given** I view the user table, **When** there are users in the system, **Then** I see each user's avatar initials (derived from firstName/lastName), and users are sorted by join date (most recent first).

## Dev Notes

### Architecture Patterns to Follow

- **Storage interface pattern**: All database operations go through `IStorage` in `server/storage.ts`. Route handlers are thin — validate input, call storage, return response.
- **Wouter routing**: Use `Link` and `useLocation` from `wouter`, NOT react-router. Register new routes in `client/src/App.tsx`.
- **TanStack Query**: Query keys follow `["/api/resource"]` convention. Mutations invalidate related queries. `staleTime: Infinity` is the global default.
- **API client**: Use `api.*` methods from `client/src/lib/api.ts`, NOT raw fetch.
- **Auth middleware**: `requirePermission("admin")` and `requireRole("Admin")` from `server/middleware/auth.ts`. User identity available via `req.dbUser` after middleware.
- **Type sharing**: Types defined in `shared/schema.ts` (Drizzle) and `client/src/lib/api.ts` (client interfaces).
- **Page structure**: Wrap page content in `<Layout>` component. All interactive elements need `data-testid`.
- **shadcn/ui**: Import UI primitives from `@/components/ui/*`.

### UI/UX Deliverables

- **User Management Page** (`/admin/users` or refactored within existing `/settings` page as the "Users & Roles" tab):
  - The existing `Settings.tsx` already has a "Users & Roles" tab with user list, role dropdowns, invite dialog, and delete confirmation. This page needs to be **refactored** to work with the real auth model (Replit Auth auto-provisioning), NOT replaced from scratch.
  - **Remove the "Invite User" dialog** — users are auto-provisioned on first sign-in via Replit Auth. There is no manual invite flow.
  - **Fix user display**: The current code references `user.name` and `user.status` which are from the OLD schema. The new auth schema (Story 7.5) uses `firstName`, `lastName`, `email`, `profileImageUrl`, `role`, `createdAt`, `updatedAt`. Update all references.
  - **Remove "Resend Invite"** menu option — no invite system exists.
  - User table rows: Avatar initials (from firstName/lastName), full name, email, role badge, role dropdown (Select), join date, overflow menu.
  - Role change: Select dropdown with Member/Approver/Admin options. On change, call `PATCH /api/users/:id` with `{ role: newRole }`.
  - Role permissions legend card: 3-card grid showing Member/Approver/Admin capabilities.
  - Permission denied state: Show when non-admin accesses the page.
  - Loading state with spinner.
  - `data-testid` on: user table (`user-table`), each user row (`user-row-{id}`), role dropdown (`select-role-{id}`), permission-denied message (`permission-denied`).

### Anti-Patterns & Hard Constraints

- **DO NOT create a manual "Create User" or "Invite User" flow** — users are auto-provisioned via Replit Auth OIDC on first sign-in. The existing invite dialog must be removed.
- **DO NOT use `user.name` or `user.status`** — these fields no longer exist. The auth schema uses `firstName`, `lastName`, `email`, `role`.
- **DO NOT duplicate permission logic** — use `canAdmin()` from `shared/permissions.ts` for both server and client checks.
- **DO NOT use react-router** — use Wouter.
- **DO NOT put business logic in routes** — last-admin check belongs in storage layer or route handler validation, not in frontend.
- **DO NOT remove the existing Settings.tsx tabs** (Permissions, Notifications, Visibility) — only fix the Users & Roles tab.

### Gotchas & Integration Warnings

- **Old schema mismatch**: The current `Settings.tsx` uses `user.name` (string) and `user.status` ("active"|"invited"). Story 7.5 replaced this with `firstName`/`lastName`/`role`. The User type in `client/src/lib/api.ts` has already been updated to the new schema, but the JSX in `Settings.tsx` still references old fields.
- **Last-admin protection**: Must be enforced server-side. Before updating a user's role away from Admin, count remaining admins. If count would drop to 0, return 400 error.
- **Auth auto-provisioning**: The Replit Auth integration in `server/replit_integrations/auth/` handles user creation on first OIDC callback. The first user gets Admin role, subsequent users get Member. This is already wired in Story 7.5.
- **TanStack Query staleTime: Infinity**: After mutating (role change), the UI won't auto-refetch. Must call `queryClient.invalidateQueries()` after mutations.
- **Delete user consideration**: Keep the delete functionality but add a guard — cannot delete yourself and cannot delete the last admin.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Settings.tsx` | MODIFY | Fix Users & Roles tab: remove invite dialog, fix user.name → firstName/lastName, remove user.status references, add last-admin error handling, remove "Resend Invite" option |
| `server/routes.ts` | MODIFY | Add last-admin check to `PATCH /api/users/:id` — count admins before allowing role change away from Admin |
| `client/src/lib/api.ts` | VERIFY | User interface already updated to new schema (firstName/lastName/role). Verify `api.users.update()` signature matches. |

### Testing Expectations

- **E2E (Playwright via run_test)**: Test user table renders with correct fields, role dropdown changes role, last-admin protection shows error.
- **Critical ACs for test coverage**: AC4 (last-admin protection), AC5 (permission denied for non-admin).
- Existing test framework: Vitest for API tests (`tests/api/`), Playwright for E2E.

### Dependencies & Environment Variables

- No new packages needed — all dependencies already installed.
- No new environment variables needed — Replit Auth already configured.
- Depends on Story 7.5 (auth foundation) being complete — it is in "review" status.

### References

- Epic 7, Story 7.2 acceptance criteria: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` (lines 1200-1247)
- Auth schema: `shared/models/auth.ts`
- Auth middleware: `server/middleware/auth.ts`
- Permissions: `shared/permissions.ts`
- Architecture patterns: `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md` (AD-2, Pattern 1, Pattern 3)
- Current Settings.tsx implementation: `client/src/pages/Settings.tsx` (Users & Roles tab, lines 152-345)

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
Implemented User Management story by refactoring the existing Settings.tsx Users & Roles tab and adding server-side protections:

- **Server-side last-admin protection**: Added validation to `PATCH /api/users/:id` that counts admins before allowing role change away from Admin. Returns 400 with descriptive error message. Same protection added to `DELETE /api/users/:id` along with self-deletion prevention.
- **Settings.tsx refactored**: Removed invite dialog, invite state, create user mutation, and "Resend Invite" menu option. Fixed all `user.name` references to use `firstName`/`lastName` via helper functions. Removed `user.status` references. Added `useAuth()` hook and `canAdmin()` check for permission-denied state. Users sorted by `createdAt` descending. Avatar initials derived from firstName/lastName.
- **Error handling**: Added `parseApiError()` helper to extract server error messages from API responses for proper toast display (e.g., last-admin error shows exact server message).
- **Permission denied**: Non-admin users see a ShieldAlert icon with "Permission Denied" message instead of the settings content.

### File List
- `server/routes.ts` — MODIFIED: Added last-admin protection to PATCH and DELETE /api/users/:id routes
- `client/src/pages/Settings.tsx` — MODIFIED: Full refactor of Users & Roles tab (removed invite flow, fixed schema references, added auth check, sort by join date, avatar initials)
- `_bmad-output/implementation-artifacts/7-2-user-management.md` — MODIFIED: Story status updates
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — MODIFIED: Sprint status updates

### Testing Summary
- **Test approach**: E2E testing via Playwright (run_test tool)
- **ACs covered**:
  - AC1: User table displays name, email, role badge, join date — verified visually via E2E
  - AC2: Auto-provisioning via Replit Auth — verified (new OIDC login creates user with Member role)
  - AC3: Role dropdown changes role — verified via API PATCH test
  - AC4: Last-admin protection — verified: PATCH returns 400 with correct error message when demoting sole admin
  - AC5: Permission denied for non-admin — verified: Member user sees "Permission Denied" with data-testid
  - AC6: Role permissions legend — verified: 3 role cards visible
  - AC7: Avatar initials and sort by join date — verified via E2E rendering check
- **All tests passing**: Yes
- **LSP Status**: Clean — no errors

### Code Review (2026-02-15)
- **Reviewer**: Claude 4.6 Opus (Replit Agent)
- **All 7 ACs**: SATISFIED
- **Issues found**: 2 MEDIUM
- **Issues fixed**:
  - M1: Added `document.title = "System Settings — Katalyst Lexicon"` via useEffect (AR14 compliance)
  - M2: Added `autoFocus` to AlertDialogCancel on delete user dialog (AR15 compliance — prevents Enter from confirming deletion)
- **Server-side verified**: Last-admin protection on PATCH and DELETE, self-deletion prevention on DELETE
- **Permission model**: Uses `canAdmin()` from `shared/permissions.ts` — no hardcoded role checks
