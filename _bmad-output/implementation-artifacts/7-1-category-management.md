# Story 7.1: Category Management

Status: ready-for-dev

## Story

As an admin,
I want to create, edit, reorder, and delete categories with display colors,
so that the lexicon stays organized as the vocabulary grows.

## Acceptance Criteria

1. **Given** I am an admin on the category management page, **When** the page loads, **Then** I see a list of all categories in their current display order, and each category shows: name, color swatch, term count, and sort position.

2. **Given** I click "Add Category", **When** a form appears, **Then** I can enter a name, select a color (hex picker or preset palette), and set the sort position, and clicking "Save" creates the category and it appears in the list.

3. **Given** I click "Edit" on a category, **When** the edit form appears, **Then** all current values are pre-filled (including color), and I can change the name, color, or sort position, and saving updates the category.

4. **Given** I want to reorder categories, **When** I click the up or down arrow buttons next to a category, **Then** the category swaps position with its neighbor, and the display order updates and is reflected on the browse page sidebar.

5. **Given** I click "Delete" on a category that has terms assigned, **When** the confirmation dialog appears, **Then** it warns: "This category has {N} terms. Reassign them before deleting." and Enter does NOT confirm the dialog (AR15), and deletion is blocked until terms are reassigned.

6. **Given** I click "Delete" on a category with no terms, **When** I confirm the deletion, **Then** the category is removed.

7. **Given** I am not an admin, **When** I try to access the category management page, **Then** I see a "Permission denied" message.

## Dev Notes

### Architecture Patterns to Follow

- **Storage interface pattern**: All database operations go through `IStorage` in `server/storage.ts`.
- **Wouter routing**: Current route is `/categories` → `ManageCategories.tsx`. Keep this route.
- **TanStack Query**: Query keys: `["/api/categories"]`, `["/api/terms"]`. Invalidate after mutations.
- **API client**: Use `api.categories.*` from `client/src/lib/api.ts`.
- **Auth middleware**: Category write routes already use `requirePermission("admin")`.
- **Destructive dialog pattern (AR15)**: For delete confirmation, use `AlertDialog` with `autoFocus` on the Cancel button so Enter does NOT confirm. This prevents accidental deletion.

### UI/UX Deliverables

- **Category Management Page** (`/categories`, existing `ManageCategories.tsx`):
  - The existing page already has: category list, add category dialog, inline edit, delete confirmation, term count badges. It needs these **enhancements**:
  - **Color picker**: Add a color field to the create and edit forms. Currently `color` is hardcoded to `"bg-primary"` on create. Replace with a preset color palette (6-8 color swatches) or a hex input. The color swatch should display next to each category in the list (the `h-3 w-3 rounded-full` element already exists but uses the Tailwind class from `category.color`).
  - **Reorder arrows**: Add up/down arrow buttons to each category row. Clicking up swaps `sortOrder` with the previous category. Clicking down swaps with the next. Disable up on first item, down on last. Each reorder calls `PATCH /api/categories/:id` with updated `sortOrder`.
  - **Delete-with-terms guard**: Before allowing deletion, check `getTermCount(category.name)`. If > 0, show the warning message and block the delete action. Currently the dialog just allows deletion regardless.
  - **AR15 compliance**: The existing `AlertDialog` for delete uses `AlertDialogAction` which gets auto-focused by default. Move `autoFocus` to `AlertDialogCancel` so pressing Enter closes the dialog instead of confirming deletion.
  - **Permission denied**: Add `useAuth()` check — if user is not admin, show permission denied instead of page content.
  - `data-testid` on: category list (`category-list`), add button (`button-add-category` — already exists), each category row (`category-row-{id}` — already exists), edit/delete buttons, color picker (`input-category-color`), up/down reorder buttons (`button-reorder-up-{id}`, `button-reorder-down-{id}`).

### Anti-Patterns & Hard Constraints

- **DO NOT replace ManageCategories.tsx from scratch** — enhance the existing implementation. It already has working CRUD with mutations.
- **DO NOT use drag-and-drop for reorder** — use simple up/down arrow buttons. Simpler, fully accessible, sufficient for admin use.
- **DO NOT allow deletion of categories that have terms** — enforce on the client side by checking term count.
- **Store colors as hex values** (e.g., `"#4CAF50"`) in the database `color` field, and render them using `style={{ backgroundColor: color }}`. The current default `"bg-primary"` (a Tailwind class) should be migrated to hex. Do NOT use Tailwind class names as color values going forward.
- **DO NOT use react-router** — use Wouter.
- **DO NOT forget AR15** — Enter must NOT confirm destructive dialogs.

### Gotchas & Integration Warnings

- **Color representation**: The current schema stores `color` as a text field with default `"bg-primary"` (a Tailwind class). For a color picker, you may want to store hex values (e.g., `"#4CAF50"`) and render them with `style={{ backgroundColor: color }}` instead of as Tailwind classes. This requires updating how the color swatch is rendered in both ManageCategories.tsx and the browse sidebar (Layout.tsx).
- **Reorder race condition**: If two admins reorder simultaneously, sort orders could conflict. For MVP, this is acceptable — last write wins.
- **Browse page sidebar**: `Layout.tsx` renders category quick links. Category colors and sort order changes should be reflected there after reorder since the sidebar queries `/api/categories`.
- **TanStack staleTime: Infinity**: After category mutations, must `invalidateQueries` for changes to appear.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/ManageCategories.tsx` | MODIFY | Add color picker to create/edit forms, add reorder up/down arrows, add delete-with-terms guard, AR15 on delete dialog, add permission denied check |
| `server/routes.ts` | VERIFY | Category CRUD routes already exist with `requirePermission("admin")`. May need a dedicated reorder endpoint or use existing PATCH. |
| `client/src/lib/api.ts` | VERIFY | `api.categories.update()` already accepts partial Category data including sortOrder. |

### Testing Expectations

- **E2E (Playwright)**: Test color picker in create form, reorder arrows swap positions, delete blocked when category has terms, delete succeeds when no terms.
- **Critical ACs for test coverage**: AC4 (reorder), AC5 (delete-with-terms guard).
- Existing test framework: Vitest for API tests, Playwright for E2E.

### Dependencies & Environment Variables

- No new packages needed.
- No new environment variables needed.

### References

- Epic 7, Story 7.1 acceptance criteria: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` (lines 1152-1197)
- Architecture AD-15 (destructive dialogs): `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md`
- Current ManageCategories.tsx: `client/src/pages/ManageCategories.tsx` (289 lines)
- Category schema: `shared/schema.ts` (categories table with color and sortOrder fields)

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List

### Testing Summary
