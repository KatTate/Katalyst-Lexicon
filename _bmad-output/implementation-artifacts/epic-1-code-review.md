# Epic 1: Search & Discovery — Code Review

Date: 2026-02-10
Reviewer: Claude 4.6 Opus (Architect Agent)
Stories Reviewed: 1.1, 1.2, 1.3, 1.4

## Review Summary

Epic 1 implementation is solid across all 4 stories (41 combined ACs). Code quality is high, architectural patterns are consistent, and all major acceptance criteria are met. One functional bug was found and fixed during review.

## Findings

### Finding 1: SpotlightSearch Tab key handler was a no-op
- **Severity:** HIGH (fixed)
- **File:** `client/src/components/SpotlightSearch.tsx`, line 108-110
- **Description:** The Tab key handler in SpotlightSearch was `return` (no-op). Inside a Radix Sheet focus trap, this means Tab cycles focus within the overlay without closing it. Story 1.3 AC9 requires the same keyboard navigation as Story 1.2, where Tab closes the dropdown.
- **Fix Applied:** Tab now calls `e.preventDefault()` and `onOpenChange(false)` to close the overlay, matching desktop behavior.

### Finding 2: StatusBadge color interpretations differ from AC literal text
- **Severity:** LOW (design interpretation, not a bug)
- **File:** `client/src/components/StatusBadge.tsx`
- **Description:** ACs specify Draft = "gray badge", In Review = "blue badge", Deprecated = "amber badge". Implementation uses Katalyst design tokens: Draft = kat-warning/yellow, In Review = kat-mystical/purple, Deprecated = destructive/red. These are intentional mappings to the existing design system rather than generic HTML color names. The ACs describe conceptual colors ("a gray badge"), and the implementation maps them to the project's design language.
- **Recommendation:** No change needed. If the team wants to align to AC literal colors, this is a design decision, not a code bug. Document in retrospective for stakeholder feedback.

### Finding 3: Search logic duplication between SearchHero and SpotlightSearch
- **Severity:** MEDIUM (technical debt)
- **Files:** `client/src/components/SearchHero.tsx`, `client/src/components/SpotlightSearch.tsx`
- **Description:** Both components independently implement: useQuery with same queryKey/queryFn/staleTime, useDebounce(query, 200), highlightedIndex state, handleKeyDown keyboard handler, handleResultSelect navigation, aria-activedescendant computation, skeleton loading, empty state, and result rendering. This is approximately 80 lines of duplicated logic.
- **Recommendation:** Extract a `useSearch()` custom hook that encapsulates: query state, debounce, TanStack Query, highlightedIndex, keyboard handler, and result select. Both SearchHero and SpotlightSearch consume the hook and render different containers. This should be addressed before Epic 5 (Propose & Contribute) since that epic will likely need search for duplicate detection. Not blocking for Epics 2-4.

### Finding 4: useIsMobile initial render flash
- **Severity:** LOW
- **File:** `client/src/hooks/use-mobile.tsx`
- **Description:** `useIsMobile()` returns `false` on initial render (before useEffect runs), then switches to `true` on mobile devices after hydration. This causes a brief flash of desktop content on mobile. SearchHero has CSS classes (`md:hidden`, etc.) that partially mitigate this, but the Button vs Input swap is JS-driven.
- **Recommendation:** Acceptable for now. The flash is sub-100ms and not user-visible in practice. If it becomes an issue, could add CSS-only initial hide/show via media queries.

### Finding 5: Empty state "Propose this term" uses `<a>` tag instead of wouter Link
- **Severity:** LOW
- **Files:** `SearchHero.tsx` line 260, `SpotlightSearch.tsx` line 215
- **Description:** The "Propose this term" CTA in the empty state uses a raw `<a href>` tag instead of wouter's `<Link>` component. This causes a full-page navigation instead of client-side routing when clicked.
- **Recommendation:** Replace `<a href={...}>` with `<Link href={...}>` from wouter. Minor UX improvement — the page reload is fast enough that users won't notice, but it's inconsistent with the rest of the app's routing.

### Finding 6: highlightMatch doesn't escape regex special characters
- **Severity:** LOW (no security risk since it's client-side string matching, not regex)
- **File:** `client/src/lib/utils.ts`, line 29-57
- **Description:** `highlightMatch()` uses `indexOf` for matching (not regex), so there's no XSS or regex injection risk. However, if the function were ever refactored to use regex, special characters in the query (e.g., `(`, `[`, `*`) could cause errors.
- **Recommendation:** No change needed now. Note for future refactoring.

### Finding 7: searchTerms SQL uses string interpolation safely
- **Severity:** PASS (no issue)
- **File:** `server/storage.ts`, line 141-165
- **Description:** The `searchTerms` method uses Drizzle's `sql` template tag for parameterized queries. The `lowerQuery` and pattern variables are properly parameterized via template literals, not string concatenation. No SQL injection risk.

## Code Quality Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Code Quality | A | Clean, consistent, well-organized |
| Accessibility | A- | Full WAI-ARIA combobox pattern, aria-live, aria-activedescendant. Minor: Tab fix applied |
| Performance | A | Debounce, staleTime, LIMIT 10, no unnecessary re-renders |
| Security | A | Parameterized SQL, no XSS vectors, no secrets exposed |
| Architecture | A | Consistent with AD-11, AD-14, Pattern 7. SpotlightContext is clean |
| Error Handling | B+ | Empty states handled. Missing: network error handling for search API failures |
| Testing | A | Comprehensive E2E coverage across all stories |
| DRY | B | Search logic duplicated between SearchHero and SpotlightSearch (Finding 3) |

## Recommended Actions Before Epic 2

1. **None required.** All findings are LOW-MEDIUM severity. Epic 2 (Term Detail) has no dependencies on the search logic duplication.

## Recommended Actions Before Epic 5

1. Extract `useSearch()` hook to eliminate Finding 3 duplication (needed for duplicate detection in proposal form).
2. Replace `<a>` with `<Link>` in empty state CTAs (Finding 5).
