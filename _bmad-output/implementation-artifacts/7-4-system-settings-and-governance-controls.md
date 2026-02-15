# Story 7.4: System Settings and Governance Controls

Status: in-progress

## Story

As an admin,
I want to configure system behavior through settings toggles for governance, notifications, and visibility,
so that I can tailor the lexicon's rules to our team's needs.

## Acceptance Criteria

1. **Given** I am an admin on the settings page, **When** the page loads, **Then** I see settings organized into three sections: Governance, Notifications, and Visibility.

2. **Given** I view the Governance section, **When** I see the toggle controls, **Then** I can toggle: "Require approver signoff for new terms", "Require change notes on edits", "Allow self-approval", and each toggle shows its current state (on/off).

3. **Given** I view the Notifications section, **When** I see the toggle controls, **Then** I can toggle: "Weekly digest", "New proposal alerts", "Changes requested alerts", and a note below the section reads: "Notification delivery is coming soon — these settings will take effect when notifications are enabled."

4. **Given** I view the Visibility section, **When** I see the toggle controls, **Then** I can toggle: "Enable client portal", "Enable public glossary."

5. **Given** I change a setting, **When** I toggle it, **Then** the change saves automatically (no separate save button needed) and I see a brief success toast confirming the change.

6. **Given** I am not an admin, **When** I try to access the settings page, **Then** I see a "Permission denied" message.

## Dev Notes

### Architecture Patterns to Follow

- **Storage interface pattern**: `storage.upsertSetting()` and `storage.getSettings()` already exist in `server/storage.ts`.
- **API routes exist**: `GET /api/settings` (authenticated), `POST /api/settings` (admin), `POST /api/settings/batch` (admin) — already protected with correct middleware.
- **API client**: `api.settings.save(key, value)` and `api.settings.saveBatch()` in `client/src/lib/api.ts`.
- **TanStack Query**: Query key `["/api/settings"]`. Invalidate after mutations.
- **Settings data model**: Key-value pairs in `settings` table with `key` (text, unique) and `value` (boolean).

### UI/UX Deliverables

- **Settings Page** (`/settings`, existing `Settings.tsx`):
  - The existing page already has the correct tab structure (Permissions → Governance, Notifications, Visibility) and all the right toggles. It needs these **refinements**:
  - **Auto-save on toggle** (AC5): Currently the page uses a "Save All Settings" button that batches all changes. Replace this with individual auto-save on each toggle change. When a toggle changes, immediately call `POST /api/settings` with `{ key, value }`. Show a brief success toast for each save. Remove the "Save All Settings" button.
  - **"Coming soon" note on Notifications** (AC3): Add a note below the notifications toggles: "Notification delivery is coming soon — these settings will take effect when notifications are enabled." This is currently missing.
  - **Permission denied** (AC6): Add `useAuth()` + `canAdmin()` check. If user is not admin, show a permission denied message instead of the settings content. This check is currently missing.
  - **Tab rename**: The existing "Permissions" tab label should read "Governance" to match the AC naming. Update `TabsTrigger` value and label.
  - **Keep the Users & Roles tab intact** — User management refinements are handled by Story 7.2. This story only touches the non-user tabs (Governance, Notifications, Visibility). Do NOT modify or break the existing Users tab functionality.
  - `data-testid` on: each settings section (`section-governance`, `section-notifications`, `section-visibility`), each toggle (already exist: `switch-require-approver`, `switch-require-change-note`, `switch-allow-self-approval`, `switch-weekly-digest`, `switch-new-proposal-alerts`, `switch-changes-requested-alerts`, `switch-enable-client-portal`, `switch-enable-public-glossary`), coming-soon note (`text-notifications-coming-soon`), permission denied message (`permission-denied`).

### Anti-Patterns & Hard Constraints

- **DO NOT remove the Users & Roles tab** — it is managed by Story 7.2. Only modify the Governance/Notifications/Visibility tabs.
- **DO NOT batch-save settings** — each toggle should auto-save individually on change. Remove the "Save All Settings" button.
- **DO NOT send notifications** — notification delivery is a future feature. The toggles persist their values but nothing is sent. The "coming soon" note makes this explicit.
- **DO NOT replace Settings.tsx from scratch** — enhance the existing implementation.
- **DO NOT use react-router** — use Wouter.

### Gotchas & Integration Warnings

- **Auto-save debounce**: If a user rapidly toggles the same setting, consider debouncing the save call (200-300ms) to avoid multiple rapid API calls. However, for MVP, immediate save per toggle is acceptable.
- **Optimistic updates**: For a snappy feel, update the local state immediately on toggle, then save in the background. If the save fails, revert the toggle and show an error toast.
- **Settings key names**: The existing toggles use these keys: `require_approver_signoff`, `require_change_note`, `allow_self_approval`, `weekly_digest`, `new_proposal_alerts`, `changes_requested_alerts`, `enable_client_portal`, `enable_public_glossary`. These match the seed data in `server/seed.ts`.
- **TanStack staleTime: Infinity**: After saving a setting, invalidate `["/api/settings"]` to refresh the cache.
- **The existing `localSettings` state pattern**: Currently `Settings.tsx` uses a `localSettings` state object and a ref `settingsInitialized` to track whether settings have been loaded. With auto-save, this pattern may need adjustment — either keep the local state for optimistic updates or switch to using TanStack Query data directly with mutations.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/Settings.tsx` | MODIFY | Convert batch-save to auto-save on toggle, add "coming soon" note to Notifications section, add permission denied check, rename "Permissions" tab to "Governance", remove "Save All" button |

### Testing Expectations

- **E2E (Playwright)**: Test toggle auto-saves (toggle a setting, reload page, verify state persisted), "coming soon" note visible in Notifications, permission denied for non-admin.
- **Critical ACs for test coverage**: AC5 (auto-save on toggle), AC6 (permission denied).
- Existing test framework: Vitest for API, Playwright for E2E.

### Dependencies & Environment Variables

- No new packages needed.
- No new environment variables needed.
- Settings table and seed data already exist.

### References

- Epic 7, Story 7.4 acceptance criteria: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` (lines 1294-1336)
- Settings schema: `shared/schema.ts` (settings table)
- Existing Settings.tsx: `client/src/pages/Settings.tsx` (503 lines)
- Settings routes: `server/routes.ts` (lines 539-575)
- Seed data: `server/seed.ts` (settings seed values)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
