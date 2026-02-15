# Story 1.4: Home Page with Recently Updated Terms

Status: done

## Story

As a user landing on the home page,
I want to see recently updated terms below the search bar,
So that I can discover what's changed without searching and get a sense the lexicon is actively maintained.

## Acceptance Criteria Verification

| AC | Requirement | Status | Evidence |
|----|-------------|--------|----------|
| AC1 | SearchHero at top, "Recently Updated" section below | MET | Home.tsx: `<SearchHero />` at line 22, "Recently Updated" section at line 30 |
| AC2 | Up to 6 TermCards in responsive grid (1/2/3 cols), sorted by updatedAt desc | MET | Home.tsx: `.sort()` by updatedAt desc, `.slice(0, 6)`, `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` |
| AC3 | Empty state with message and "Propose the first term" CTA | MET | Home.tsx: lines 47-52, "No terms have been added yet" + "Be the first to propose a term" button linking to `/propose` |

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
- All 3 ACs were already implemented during Story 1.1 development
- Verified via E2E test: all 8 test steps passed (SearchHero presence, grid with 6 cards, responsive layout, card navigation, Contribute CTA, View All button)
- Empty state copy uses "No terms have been added yet" instead of the epic's suggestion "The lexicon is just getting started" — the epic says "a message like" so exact wording is flexible
- No code changes required — this story was pre-built as part of the SearchHero integration

### File List
- client/src/pages/Home.tsx (no changes — already complete)
