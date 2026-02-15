# Story 1.2: SearchHero Keyboard Navigation

Status: done

## Story

As a keyboard user or power user,
I want to navigate search results using keyboard shortcuts,
So that I can find and select terms without using a mouse.

## Acceptance Criteria

**Arrow Key Navigation:**

1. **Given** the search input is focused and results are visible, **When** I press the Down Arrow key, **Then** the first result is highlighted with a visible focus indicator (background highlight or focus ring) **And** subsequent Down Arrow presses move the highlight down through results.

2. **Given** a result is highlighted, **When** I press the Up Arrow key, **Then** the highlight moves to the previous result. **And** if I press Up Arrow on the first result, the highlight is removed and focus returns to the input (no wrapping).

3. **Given** the last result is highlighted, **When** I press Down Arrow, **Then** the highlight does not wrap — it stays on the last result.

**Enter to Select:**

4. **Given** a result is highlighted, **When** I press Enter, **Then** I navigate to that term's detail page (`/term/{id}`).

5. **Given** the search input is focused but no result is highlighted, **When** I press Enter, **Then** nothing happens (no navigation, no form submission).

**Tab Behavior:**

6. **Given** results are visible, **When** I press Tab, **Then** the dropdown closes without selecting any result **And** focus moves to the next focusable element on the page.

**Escape Behavior:**

7. **Given** results are visible, **When** I press Escape, **Then** the dropdown closes, the active highlight is cleared, and focus remains on the search input.

**Reopen with Down Arrow:**

8. **Given** the search input is focused and has 2+ characters typed but the dropdown was closed (e.g., by Escape or Tab), **When** I press Down Arrow, **Then** the dropdown reopens (showing cached results if available) and the first result is highlighted.

**aria-activedescendant:**

9. **Given** a result is highlighted via keyboard, **When** I look at the search input element, **Then** it has `aria-activedescendant` set to the DOM id of the currently highlighted result's `role="option"` element. **And** when no result is highlighted, `aria-activedescendant` is not set (or is empty).

**Visual Indicator:**

10. **Given** a result is highlighted via keyboard navigation, **When** I look at the highlighted result, **Then** it has a visually distinct background (e.g., `bg-primary/10` or `bg-muted`) that is different from the hover state but equally visible.

**Scroll Into View:**

11. **Given** the dropdown has more results than fit in the visible area, **When** I arrow-key down to a result that is below the visible fold, **Then** the dropdown automatically scrolls to keep the highlighted result visible.

## Dev Notes

### Architecture Patterns to Follow

- **Highlight state**: Use a `highlightedIndex` state variable (integer, -1 means "none highlighted"). This is managed entirely in SearchHero.tsx — no new components needed. The index maps to `searchResults[highlightedIndex]`.
- **aria-activedescendant**: Each `role="option"` element needs a stable DOM `id` attribute (e.g., `search-option-{term.id}`). When `highlightedIndex >= 0`, set `aria-activedescendant` on the input to that id. When `highlightedIndex === -1`, omit the attribute. Source: Architecture AD-11, AD-15.
- **Keyboard handler**: Extend the existing `handleKeyDown` function in SearchHero.tsx. Currently it only handles Escape. Add cases for ArrowDown, ArrowUp, Enter, and Tab. Use `e.preventDefault()` for ArrowDown/ArrowUp to prevent cursor movement in the input, and for Enter to prevent form submission.
- **Reset highlight on new results**: When `searchResults` changes (new query results arrive), reset `highlightedIndex` to -1. This prevents stale highlighting when the result list changes.
- **scrollIntoView**: When `highlightedIndex` changes, call `element.scrollIntoView({ block: "nearest" })` on the highlighted option element to ensure it's visible within the scrollable dropdown.
- **No focus movement**: The combobox pattern keeps DOM focus on the input at all times. The highlighted result is indicated only via `aria-activedescendant` and visual styling — focus does NOT move to the option elements. This is the standard WAI-ARIA combobox pattern.

### Brownfield Context (Story 1.1 Integration Points)

The SearchHero component from Story 1.1 already has:
- `handleKeyDown` with Escape handling → **extend** this function
- `role="combobox"`, `aria-expanded`, `aria-controls`, `aria-haspopup`, `aria-autocomplete` → **add** `aria-activedescendant`
- Result items with `role="option"` and `aria-selected={false}` → **update** `aria-selected` to reflect highlighted state, **add** `id` attribute
- `showDropdown` state and `isOpen` state → **reuse** for reopen logic
- Click handler `handleResultClick` → **reuse** for Enter-to-select

### Party Mode Finding Carry-Forward

**Finding 1 from Story 1.1 (Low):** `aria-controls` references unmounted listbox when dropdown is closed. Fix by conditionally applying `aria-controls` only when `showDropdown` is true.

**Finding 2 from Story 1.1 (Medium):** Full TermCard chrome in dropdown creates card-in-card nesting. This story should address it by adding a `variant` prop to TermCard (`"card"` for grid display, `"inline"` for dropdown display) that reduces padding, removes border/shadow, and strips the outer Link wrapper when used inside the dropdown. This prevents the card-in-card visual issue AND the nested-link HTML validity problem (the dropdown option wrapper handles the click, so the TermCard shouldn't also be a `<Link>`).

### UI/UX Deliverables

**SearchHero.tsx modifications:**
- Add `highlightedIndex` state
- Extend `handleKeyDown` with ArrowDown, ArrowUp, Enter, Tab cases
- Add `aria-activedescendant` to Input when result is highlighted
- Conditionally apply `aria-controls` only when dropdown is open
- Update each option element: add `id` attribute, update `aria-selected` based on `highlightedIndex`
- Add highlight styling to the active option: `bg-primary/10 border-l-2 border-primary` or similar
- Add `scrollIntoView` effect when `highlightedIndex` changes
- Reset `highlightedIndex` to -1 when `searchResults` changes

**TermCard.tsx modifications (Finding 2 fix):**
- Add `variant` prop: `"card"` (default, existing behavior) | `"inline"` (for dropdown)
- `"inline"` variant: removes outer `<Link>` wrapper, removes border/shadow/bg-card, uses tighter padding, keeps all content (name, category, definition, freshness, version, synonyms, highlighting)
- The dropdown option `<div role="option">` handles the click/navigation instead of the TermCard's `<Link>`

### Anti-Patterns & Hard Constraints

- **DO NOT** move DOM focus to option elements. The combobox pattern keeps focus on the input. Use `aria-activedescendant` only.
- **DO NOT** add a separate keyboard navigation hook or component. All keyboard logic lives in `handleKeyDown` within SearchHero.tsx. Keep it simple.
- **DO NOT** wrap the results in an actual wrapping/cycling navigation (Down on last → first). Stop at boundaries per AC2/AC3.
- **DO NOT** change the debounce, staleTime, or search API behavior. Those are Story 1.1 concerns and are stable.
- **DO NOT** install any new packages. All keyboard handling is native DOM events.
- **DO NOT** remove or change any existing `data-testid` attributes. Only add new ones where needed.

### Gotchas & Integration Warnings

- **Tab default behavior is correct**: When Tab is pressed, the browser naturally moves focus to the next focusable element. The only thing we need to do is close the dropdown. We do NOT need to `preventDefault()` on Tab — let the browser handle focus movement.
- **Enter on empty highlighted state**: When `highlightedIndex === -1` and Enter is pressed, do nothing. Do NOT navigate or submit. Only navigate when a result is actively highlighted.
- **Nested links in dropdown**: The current TermCard wraps content in a `<Link>`. Inside the dropdown, the option `<div>` also handles clicks. This creates nested interactive elements (link inside button-like div). The `variant="inline"` prop fixes this by removing the `<Link>` wrapper.
- **Highlight reset timing**: Reset `highlightedIndex` in a `useEffect` watching `searchResults`, not `debouncedQuery`. This ensures the reset happens after new results arrive, not when the query changes but before results load.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/SearchHero.tsx` | MODIFY | Add keyboard navigation (ArrowDown/Up, Enter, Tab), aria-activedescendant, highlight state, scrollIntoView, conditional aria-controls |
| `client/src/components/TermCard.tsx` | MODIFY | Add `variant` prop ("card" \| "inline"), inline variant removes Link wrapper and card chrome |

### Dependencies & Environment Variables

**No new packages needed.**
**No environment variables needed.**
**Depends on:** Story 1.1 (complete) — SearchHero, TermCard, useDebounce, highlightMatch all in place.

### Testing Guidance

**Keyboard interaction tests (E2E):**
1. Type a query → results appear → press Down Arrow → first result highlighted → verify `aria-activedescendant` set
2. Press Down Arrow multiple times → highlight moves down → press Up Arrow → highlight moves up
3. Press Enter on highlighted result → navigates to term detail page
4. Press Tab → dropdown closes → focus on next element
5. Press Escape → dropdown closes → focus stays on input
6. Type query → Escape to close → press Down Arrow → dropdown reopens
7. Arrow down past visible results → dropdown scrolls to show highlighted result

### References

- Epic 1 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 1, Story 1.2
- Architecture AD-11 (keyboard behavior): `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md` → AD-11
- Architecture AD-15 (ARIA implementation): `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md` → AD-15
- UX Design Spec (keyboard navigation): `_bmad-output/planning-artifacts/ux-design-specification.md` → Accessibility section
- Story 1.1 implementation: `client/src/components/SearchHero.tsx`, `client/src/components/TermCard.tsx`
- Party Mode Review findings: Finding 1 (aria-controls), Finding 2 (card-in-card nesting)

## Dev Agent Record

### Agent Model Used
Claude 4.6 Opus (Replit Agent)

### Completion Notes
- All 11 ACs verified via architect review and E2E testing (all 30 test steps passed)
- Party Mode Finding 1 (conditional aria-controls) fixed
- Party Mode Finding 2 (card-in-card nesting) fixed via TermCard variant="inline" prop
- No regressions to Story 1.1 functionality (search, debounce, click nav, empty state, skeleton)
- WAI-ARIA combobox pattern fully compliant (focus on input, aria-activedescendant tracking)
- No new packages added

### File List
- client/src/components/SearchHero.tsx (modified)
- client/src/components/TermCard.tsx (modified)
