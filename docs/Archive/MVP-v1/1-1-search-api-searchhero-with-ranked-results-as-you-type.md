# Story 1.1: Search API + SearchHero with Ranked Results-as-You-Type

Status: done

## Story

As a user looking up a term,
I want to type into a prominent search input and see ranked, highlighted results appear instantly,
So that I find the right term in seconds without submitting a form or navigating away.

## Acceptance Criteria

**Search Input & Hero:**

1. **Given** I land on the home page, **When** the page loads, **Then** I see a large, centered search input as the dominant element on the page with placeholder text guiding me (e.g., "Search terms, definitions, synonyms...").

2. **Given** I type fewer than 2 characters, **When** I have typed only 1 character, **Then** no search is triggered and no dropdown appears.

3. **Given** I type "sco" into the search input, **When** 200ms passes after my last keystroke, **Then** a dropdown appears below the input showing matching terms as cards. Each card shows: term name, category tag, status badge, definition preview (2-line truncation), and freshness signal ("Updated 3 days ago", "v4").

**Ranking:**

4. **Given** results are returned for "sco", **When** a term named exactly "Scope" exists, **Then** it appears first (exact name match ranked highest). Terms whose names start with "sco" appear next. Terms where "sco" appears in the definition, synonyms, or examples appear last.

**Highlighting:**

5. **Given** results are displayed, **When** I look at any result card, **Then** the matching text "sco" is highlighted in bold wherever it appears — in the term name, definition preview, or synonym list.

**Empty State:**

6. **Given** I type a query with no matches, **When** the dropdown appears, **Then** I see a friendly empty state: "This term hasn't been added yet" and a "Propose this term" button is shown with my search query pre-filled as the term name (links to `/propose?name={searchQuery}`).

**Loading State:**

7. **Given** search results are loading, **When** I see the dropdown area, **Then** skeleton card placeholders are shown (not a full-page spinner).

**Interaction:**

8. **Given** I click on a search result card, **When** the result is selected, **Then** I navigate to that term's detail page (`/term/{id}`).

9. **Given** I clear the search input (backspace to empty or click clear), **When** the input becomes empty, **Then** the dropdown closes and I return to the default home page state (recently updated terms visible).

**Status Badges:**

10. **Given** a term has status "Canonical", **When** I view its status badge on any card, **Then** I see a green badge with a checkmark icon and the text "Canonical".

11. **Given** a term has status "Deprecated", **When** I view its status badge, **Then** I see an amber badge with a warning icon and visually muted card styling.

12. **Given** a term has status "Draft", **When** I view its status badge, **Then** I see a gray badge with the text "Draft".

13. **Given** a term has status "In Review", **When** I view its status badge, **Then** I see a blue badge with the text "In Review".

**Accessibility:**

14. **Given** I am using a screen reader, **When** I interact with the search, **Then** the combobox has proper ARIA attributes (`role="combobox"`, `aria-expanded`, `aria-activedescendant`) and result count is announced via `aria-live="polite"` and all interactive elements have accessible labels.

**Freshness Signal (TermCard enhancement):**

15. **Given** a term was updated 3 days ago and is at version 4, **When** I view its TermCard, **Then** I see a freshness signal like "Updated 3 days ago" (relative time) and a version badge like "v4".

**Recently Updated (default home state):**

16. **Given** I am on the home page with no active search, **When** the page loads, **Then** I see a "Recently Updated" section below the search hero showing the most recently modified terms as TermCards, ordered by `updatedAt` descending. Limit to 6 terms displayed.

17. **Given** the Recently Updated section is visible, **When** I click a TermCard, **Then** I navigate to that term's detail page.

**Result Limit:**

18. **Given** a search query matches more than 10 terms, **When** results appear, **Then** only the top 10 ranked results are shown in the dropdown.

## Dev Notes

### Architecture Patterns to Follow

- **Search API scoring**: The existing `storage.searchTerms()` method in `server/storage.ts` currently uses simple `ILIKE` with no ranking. Replace with SQL `CASE WHEN` scoring: `CASE WHEN LOWER(name) = LOWER(query) THEN 1 WHEN LOWER(name) LIKE LOWER(query) || '%' THEN 2 WHEN LOWER(name) LIKE '%' || LOWER(query) || '%' THEN 3 ELSE 4 END`. Order by this score ascending, limit 10 results. The scoring column should be included in the returned data so the client knows the tier (or just rely on order). Case-insensitive via `LOWER()`. Source: Architecture AD-11.
- **Synonyms array search in SQL**: The `synonyms` column is `text[].array()`. The existing code uses `array_to_string(synonyms, ' ') ILIKE pattern` which works. Keep this approach. Same for `examplesGood` and `examplesBad`.
- **Debounce**: Replace the current `useEffect` + `setTimeout` debounce in `Home.tsx` with a proper `useDebounce` custom hook. Set delay to 200ms (currently 300ms). Source: Architecture AD-11, Pattern 6.
- **TanStack Query for search**: The existing query setup uses `queryFn: () => api.terms.search(debouncedSearch)` which is correct. Add `staleTime: 30_000` override for search queries specifically (global staleTime is `Infinity`, search needs 30s). Source: AR3.
- **Client-side highlighting**: The API returns plain text. The SearchHero/TermCard components bold the matched substring using string matching. Implement a `highlightMatch(text: string, query: string)` utility that wraps matched substrings in `<mark>` or `<strong>` tags. Case-insensitive matching.
- **WAI-ARIA combobox**: The search input must implement the combobox pattern. Use `role="combobox"`, `aria-expanded`, `aria-controls` (pointing to the listbox), `aria-activedescendant` (tracking highlighted result). The results list uses `role="listbox"`, each result `role="option"`. Source: AR1.
- **Component composition**: SearchHero composes on top of existing shadcn/ui primitives (Input, Card, Popover or custom dropdown). StatusBadge and TermCard already exist and should be enhanced, not replaced.
- **API route**: `GET /api/terms/search?q={query}` already exists in `server/routes.ts`. The route handler already validates `query.trim().length < 2`. Keep this. The change is in the storage layer (ranking) and adding `LIMIT 10`.
- **data-testid convention**: Follow existing pattern. Key testids: `data-testid="search-hero"` on the search container, `data-testid="search-input"` on the input, `data-testid="search-results"` on the dropdown listbox, `data-testid="search-result-{id}"` on each result, `data-testid="search-empty-state"` on the empty state, `data-testid="badge-status-{status}"` on status badges, `data-testid="term-card-{id}"` on TermCards (already exists).

### UI/UX Deliverables

**Home Page (`client/src/pages/Home.tsx`):**
- SearchHero as dominant hero element — large centered search input
- Dropdown below input showing ranked TermCards when search is active
- Skeleton cards during loading
- Empty state with "Propose this term" CTA when no results
- "Recently Updated" section below search hero when search is inactive (6 TermCards, ordered by updatedAt desc)
- Result count indicator in the dropdown

**TermCard enhancements (`client/src/components/TermCard.tsx`):**
- Add freshness signal: relative time from `updatedAt` (e.g., "Updated 3 days ago")
- Add version badge: "v{version}" small badge
- Support optional `highlightQuery` prop for client-side text highlighting

**StatusBadge enhancements (`client/src/components/StatusBadge.tsx`):**
- Add icons to each status variant: Canonical = checkmark, Deprecated = warning triangle, Draft = pencil/edit, In Review = clock/eye
- Ensure `data-testid="badge-status-{status}"` on each badge

**SearchHero component (`client/src/components/SearchHero.tsx`):**
- New component implementing WAI-ARIA combobox pattern
- Manages search state, debounce, dropdown visibility
- Renders search input + floating results dropdown
- Contains the `aria-live` region for result count announcements
- Handles all keyboard navigation (Story 1.2 will refine, but basic arrow/enter/escape should work)

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate search results page. Results appear in the dropdown, not as a page navigation.
- **DO NOT** use the `Command` component from shadcn/ui for the combobox. It's designed for command palettes, not search comboboxes. Build the combobox from Input + Popover/custom dropdown + listbox pattern.
- **DO NOT** duplicate the TermCard component. Enhance the existing one with optional props (`highlightQuery`, freshness display). One TermCard for all contexts.
- **DO NOT** change the existing `data-testid="input-search"` on the current Input — rename it to `data-testid="search-input"` as part of this story to match the new convention.
- **DO NOT** re-fetch all terms for "Recently Updated" — use the existing `GET /api/terms` endpoint which already returns terms ordered by `updatedAt` desc. Slice to 6 on the client.
- **DO NOT** remove the existing "Contribute to the Lexicon" CTA section on the home page. Keep it below "Recently Updated".
- **DO NOT** add GIN indexes in this story. The current dataset is <1000 terms. Indexing is a future optimization.
- **DO NOT** install new packages for relative time formatting. Use a simple utility function (e.g., `formatRelativeTime(date)`) that calculates "X minutes/hours/days ago" without a library.

### Gotchas & Integration Warnings

- **Existing debounce is 300ms, target is 200ms**: The current Home.tsx uses `setTimeout` at 300ms. Replace with `useDebounce` hook at 200ms.
- **queryClient global staleTime is Infinity**: The global `staleTime: Infinity` in `queryClient.ts` means search queries would cache forever. Override with `staleTime: 30_000` on the search query specifically.
- **StatusBadge currently has no icons**: The existing StatusBadge only shows text + color. Adding icons (checkmark, warning, etc.) is part of this story's AC.
- **TermCard currently has no freshness signal**: The existing TermCard shows name, category, definition, synonyms, and status badge. It does NOT show relative time or version badge. Both must be added.
- **The existing Home.tsx loads ALL terms for "Recently Updated"**: This is fine for now (< 1000 terms). The recently-updated section slices the first 3. Change to 6 per AC 16.
- **Keyboard navigation overlap with Story 1.2**: This story should implement basic keyboard support (at minimum: click to select, Escape to close). Story 1.2 handles full arrow key navigation, `aria-activedescendant`, Tab behavior. Don't over-engineer keyboard nav here — just make clicking and Escape work.
- **Mobile Spotlight is Story 1.3**: Do NOT implement the full-screen Sheet overlay for mobile in this story. The combobox dropdown should work on mobile as-is (responsive). Story 1.3 handles the mobile-specific Spotlight pattern.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `server/storage.ts` | MODIFY | Replace `searchTerms()` with SQL CASE WHEN ranked scoring, add LIMIT 10 |
| `client/src/pages/Home.tsx` | MODIFY | Replace inline search with SearchHero component, update Recently Updated to show 6 cards |
| `client/src/components/SearchHero.tsx` | CREATE | New WAI-ARIA combobox search component with dropdown results |
| `client/src/components/TermCard.tsx` | MODIFY | Add freshness signal (relative time), version badge, optional `highlightQuery` prop |
| `client/src/components/StatusBadge.tsx` | MODIFY | Add icons per status variant, add `data-testid="badge-status-{status}"` |
| `client/src/hooks/useDebounce.ts` | CREATE | Custom debounce hook (200ms default) |
| `client/src/lib/utils.ts` | MODIFY | Add `formatRelativeTime()` and `highlightMatch()` utility functions |

### Dependencies & Environment Variables

**Packages already installed (DO NOT reinstall):**
- `@tanstack/react-query` — server state management
- `wouter` — routing
- `lucide-react` — icons (CheckCircle, AlertTriangle, Pencil, Clock, etc.)
- `tailwindcss` — styling
- All shadcn/ui components already available

**No new packages needed.**

**No environment variables needed.**

### References

- Epic 1 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 1, Story 1.1
- Architecture AD-11 (Search-First UI): `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md` → AD-11
- UX Design Spec (SearchHero, TermCard, search interaction): `_bmad-output/planning-artifacts/ux-design-specification.md` → Component Library section, Journey 1
- Brownfield Assessment: `_bmad-output/planning-artifacts/brownfield-assessment.md`
- Existing search implementation: `server/storage.ts` → `searchTerms()`, `server/routes.ts` → `/api/terms/search`
- Existing components: `client/src/components/TermCard.tsx`, `client/src/components/StatusBadge.tsx`
- Existing home page: `client/src/pages/Home.tsx`

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus

### Completion Notes
All 18 ACs implemented and verified via E2E tests. Key changes:
- Backend: SQL CASE WHEN ranked scoring (4 tiers) with LIMIT 10, replacing simple ILIKE
- Frontend: New SearchHero component with WAI-ARIA combobox, 200ms debounce, staleTime 30s override
- StatusBadge: Added icons (CheckCircle2, AlertTriangle, Pencil, Clock) per status variant
- TermCard: Added freshness signal (formatRelativeTime), version badge (v{n}), optional highlightQuery prop
- Home.tsx: Integrated SearchHero, expanded Recently Updated from 3 to 6 cards, preserved Contribute CTA
- Utilities: useDebounce hook, formatRelativeTime(), highlightMatch()

Minor note: StatusBadge data-testid duplicates across cards in same view (non-blocking, can namespace per-item later)

### File List
- server/storage.ts (MODIFIED - searchTerms with ranked scoring)
- client/src/components/SearchHero.tsx (CREATED)
- client/src/components/StatusBadge.tsx (MODIFIED - icons + data-testid)
- client/src/components/TermCard.tsx (MODIFIED - freshness, version, highlighting)
- client/src/pages/Home.tsx (MODIFIED - SearchHero integration, 6 recent cards)
- client/src/hooks/useDebounce.ts (CREATED)
- client/src/lib/utils.ts (MODIFIED - formatRelativeTime, highlightMatch)
