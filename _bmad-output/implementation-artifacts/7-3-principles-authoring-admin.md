# Story 7.3: Principles Authoring (Admin)

Status: done

## Story

As an admin,
I want to create, edit, and archive organizational principles and link them to terms,
so that the team can reference the thinking behind our vocabulary.

## Acceptance Criteria

1. **Given** I am an admin on the principles management page, **When** I click "Create Principle", **Then** I see a form with fields: Title, Summary, Body (markdown editor), Status (Draft/Published), Visibility (Internal/Client-Safe/Public), and Tags.

2. **Given** I am editing a principle's body, **When** I type markdown syntax, **Then** I can preview the rendered output before saving by toggling between Edit and Preview modes.

3. **Given** I save a new or edited principle, **When** the save succeeds, **Then** I see a success toast and the principle appears in the principles list.

4. **Given** I want to link a principle to terms, **When** I edit a principle, **Then** I see a "Related Terms" section with a searchable term input, and as I type a term name, a dropdown shows matching terms from the search API, and I can click a result to add it as a linked term, and linked terms appear as removable chips below the input, and I can click the "x" on a chip to remove a link.

5. **Given** I want to archive a principle, **When** I click "Archive", **Then** I see a confirmation dialog, and confirming changes the status to "Archived", and the principle remains viewable but displays the archived banner.

6. **Given** I am not an admin, **When** I try to access the principles authoring page, **Then** I see a "Permission denied" message.

7. **Given** I view the principles list in admin mode, **When** the page loads, **Then** I see all principles (including Drafts and Archived) with their status, visibility, linked term count, and last updated date.

8. **Given** I create a principle with a title that generates a slug already in use, **When** I save, **Then** the system auto-generates a unique slug by appending a suffix (e.g., "our-values-2") and the principle saves successfully.

## Dev Notes

### Architecture Patterns to Follow

- **Storage interface pattern**: All database operations go through `IStorage` in `server/storage.ts`. Principle CRUD methods already exist: `createPrinciple`, `updatePrinciple`, `deletePrinciple`, `linkPrincipleToTerm`, `unlinkPrincipleFromTerm`.
- **API routes already exist**: `POST /api/principles`, `PATCH /api/principles/:id`, `DELETE /api/principles/:id`, `POST /api/principles/:id/terms`, `DELETE /api/principles/:principleId/terms/:termId` — all already protected with `requirePermission("admin")`.
- **API client**: `api.principles.*` and `api.terms.search()` in `client/src/lib/api.ts`.
- **TanStack Query**: Query keys: `["/api/principles"]`, `["/api/principles/${id}/terms"]`, `["/api/terms/search?q=${query}"]`.
- **Wouter routing**: Register new page at `/admin/principles` or `/manage-principles` in `App.tsx`.
- **Markdown rendering**: The existing `PrincipleDetail.tsx` page already renders markdown bodies. Reuse the same rendering approach for preview.
- **Slug generation**: Principles have a `slug` field. Auto-generate from title on create (e.g., "Our Core Values" → "our-core-values").

### UI/UX Deliverables

- **Principles Admin Page** (new page, e.g., `ManagePrinciples.tsx` at `/manage-principles`):
  - **Principles list**: Table/card list showing all principles with: title, status badge (Draft/Published/Archived), visibility badge, linked term count, last updated (relative time), and action buttons (Edit, Archive).
  - **Create/Edit form** (dialog or inline):
    - Title (text input)
    - Summary (textarea, 2-3 lines)
    - Body (textarea with markdown — toggle between "Edit" and "Preview" modes)
    - Status (Select: Draft, Published)
    - Visibility (Select: Internal, Client-Safe, Public)
    - Tags (comma-separated input or chip input)
    - Related Terms section (see term linker below)
  - **Markdown preview toggle**: Two buttons/tabs — "Edit" shows textarea, "Preview" renders markdown body using the same renderer as PrincipleDetail.tsx.
  - **Term linker**: Type-to-search input that queries `GET /api/terms/search?q=`. Results shown in a dropdown. Clicking a result calls `POST /api/principles/:id/terms` with `{ termId }`. Linked terms displayed as removable chips. Clicking "x" on chip calls `DELETE /api/principles/:principleId/terms/:termId`.
  - **Archive confirmation**: AlertDialog with AR15 (Enter does NOT confirm).
  - **Permission denied**: Check `useAuth()` + `canAdmin()` — show permission denied for non-admins.
  - `data-testid` on: create button (`button-create-principle`), form fields (`input-principle-title`, `input-principle-summary`, `input-principle-body`, `select-principle-status`, `select-principle-visibility`), markdown preview toggle (`button-preview-toggle`), term search input (`input-term-search`), term chips (`chip-term-{termId}`), remove-chip buttons (`button-remove-term-{termId}`), archive button (`button-archive-{id}`), principle rows (`row-principle-{id}`).

### Anti-Patterns & Hard Constraints

- **DO NOT create new API routes** — all necessary principle CRUD and term linking routes already exist in `server/routes.ts` with proper auth middleware.
- **DO NOT duplicate markdown rendering** — reuse the same approach as `PrincipleDetail.tsx` for preview.
- **DO NOT use a rich-text editor (WYSIWYG)** — use plain textarea with markdown preview toggle. Keep it simple.
- **DO NOT use react-router** — use Wouter.
- **DO NOT forget slug generation** — the `slug` field is required and must be unique. Auto-generate from title.
- **DO NOT modify the public-facing principles pages** (`BrowsePrinciples.tsx`, `PrincipleDetail.tsx`) — this story creates an admin-only authoring page.

### Gotchas & Integration Warnings

- **Principle schema fields**: `title` (required), `slug` (required, unique), `summary` (required), `body` (required), `status` (Draft/Published/Archived), `visibility` (Internal/Client-Safe/Public), `owner` (required), `tags` (text array), `sortOrder` (integer).
- **Slug uniqueness**: Must validate slug uniqueness before saving. If the auto-generated slug already exists, append a suffix (e.g., "-2").
- **Term linker requires saved principle**: You can only link terms to a principle that already has an ID. For the create flow, save the principle first, then enable the term linker in edit mode. Alternatively, save the principle on create, then redirect to edit mode where term linking is available.
- **Markdown rendering**: Check if `PrincipleDetail.tsx` uses a library (e.g., `react-markdown`) or dangerouslySetInnerHTML. Reuse the same approach. If no library is used, the body might be rendered as plain text — in that case, install `react-markdown` or use a simple markdown-to-HTML converter.
- **`insertPrincipleSchema` omits `id`, `createdAt`, `updatedAt`** — these are auto-generated. The `owner` field must be set server-side from `req.dbUser`.
- **The existing principle routes don't set `owner` from auth** — the `POST /api/principles` route uses `insertPrincipleSchema.parse(req.body)` which expects `owner` in the body. Consider setting `owner` server-side like proposals do with `submittedBy`.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/pages/ManagePrinciples.tsx` | CREATE | Admin principles authoring page with CRUD, markdown preview, and term linker |
| `client/src/App.tsx` | MODIFY | Register new route `/manage-principles` → `ManagePrinciples` |
| `client/src/components/Layout.tsx` | MODIFY | Add "Manage Principles" nav link for admin users (alongside existing admin nav items) |
| `server/routes.ts` | MODIFY | Set `owner` field server-side from `req.dbUser` in `POST /api/principles` (instead of expecting it from client body) |

### Testing Expectations

- **E2E (Playwright)**: Test create principle form, markdown preview toggle, term linking via search, archive flow.
- **Critical ACs for test coverage**: AC1 (create form fields), AC4 (term linking with search/chips), AC5 (archive).
- Existing test framework: Vitest for API, Playwright for E2E.

### Dependencies & Environment Variables

- **Check if `react-markdown` is already installed** — if not, may need to install for markdown preview. Check `PrincipleDetail.tsx` to see how markdown bodies are currently rendered.
- No new environment variables needed.

### References

- Epic 7, Story 7.3 acceptance criteria: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` (lines 1250-1291)
- Principle schema: `shared/schema.ts` (principles table, principleTermLinks table)
- Existing principle routes: `server/routes.ts` (lines 577-680)
- API client: `client/src/lib/api.ts` (api.principles.*, api.terms.search)
- Public principles pages: `client/src/pages/BrowsePrinciples.tsx`, `client/src/pages/PrincipleDetail.tsx`

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
Implemented admin-only principles authoring page with full CRUD, markdown preview, term linking via search, and archive flow. Key decisions:
- Fixed POST /api/principles to set `owner` from `req.dbUser` server-side (was previously expected in body)
- Added slug uniqueness enforcement in the POST route — auto-appends numeric suffix if slug exists
- Term linking only available in Edit mode (principle must be saved first to have an ID)
- Archive uses AlertDialog with Cancel button auto-focused (Enter does NOT confirm per dev notes)
- Reused same ReactMarkdown + rehype-sanitize setup as PrincipleDetail.tsx for markdown preview
- Used Tabs component for Edit/Preview toggle on markdown body

### File List
- `client/src/pages/ManagePrinciples.tsx` — CREATE — Admin principles authoring page with CRUD, markdown preview, and term linker
- `client/src/App.tsx` — MODIFY — Added route `/manage-principles` → ManagePrinciples
- `client/src/components/Layout.tsx` — MODIFY — Added "Manage Principles" nav link in admin section
- `client/src/lib/api.ts` — MODIFY — Added `linkTerm` and `unlinkTerm` methods to `api.principles`
- `server/routes.ts` — MODIFY — Set `owner` from `req.dbUser` in POST /api/principles, added slug uniqueness loop

### Testing Summary
- **Approach**: E2E Playwright test covering the full create → preview → save → edit/link term → archive workflow
- **ACs covered**: AC1 (create form fields), AC2 (markdown preview), AC3 (save success), AC4 (term linking with search/chips), AC5 (archive with confirmation), AC6 (permission denied for non-admins), AC7 (principles list with all fields), AC8 (slug uniqueness handled server-side)
- **All tests passing**: Yes
- **LSP Status**: Clean — no errors or warnings

### Code Review (2026-02-15)
- **Reviewer**: Claude 4.6 Opus (Replit Agent)
- **All 8 ACs**: SATISFIED
- **Issues found**: 1 MEDIUM
- **Issues fixed**:
  - M1: Added `document.title = "Manage Principles — Katalyst Lexicon"` via useEffect (AR14 compliance)
- **AR15 compliance**: Already correct — AlertDialogCancel has `autoFocus` on archive dialog
- **Permission model**: Uses `canAdmin()` from `shared/permissions.ts`
- **Term linker**: Properly filters already-linked terms from search results, invalidates both principle-specific and list queries on link/unlink
- **Markdown preview**: Reuses same ReactMarkdown + rehype-sanitize setup as PrincipleDetail.tsx
