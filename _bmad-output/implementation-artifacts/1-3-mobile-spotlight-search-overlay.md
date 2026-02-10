# Story 1.3: Mobile Spotlight Search Overlay

Status: in-dev

## Story

As a user on a mobile device,
I want search to open as a full-screen overlay when I tap the search icon,
So that I get maximum space for results and the keyboard appears immediately.

## Acceptance Criteria

**Overlay Trigger:**

1. **Given** I am on any page on a mobile device (viewport < 768px), **When** I tap the search icon in the header, **Then** a full-screen overlay (Sheet) slides up covering the entire screen **And** the search input is auto-focused and the on-screen keyboard appears.

2. **Given** I am on a desktop viewport (>= 768px), **When** I view the header, **Then** no search icon is shown in the header (desktop uses the SearchHero inline on the home page and doesn't need a header search trigger).

**Search Behavior in Overlay:**

3. **Given** I am in the Spotlight overlay and type a search query (2+ characters), **When** results appear, **Then** they fill the available screen space as full-width cards **And** the same ranking, highlighting, and empty state behavior as the desktop dropdown applies.

4. **Given** I am in the Spotlight overlay and type a query with no matches, **When** the empty state appears, **Then** I see the same "This term hasn't been added yet" message and "Propose this term" button as the desktop experience.

**Navigation from Results:**

5. **Given** I am in the Spotlight overlay, **When** I tap a search result, **Then** the overlay closes and I navigate to the term detail page (`/term/{id}`).

**Closing the Overlay:**

6. **Given** I am in the Spotlight overlay, **When** I tap the close button (X icon), **Then** the overlay closes and I return to the page I was on.

7. **Given** I am in the Spotlight overlay, **When** I press Escape, **Then** the overlay closes and I return to the page I was on.

**Touch Targets:**

8. **Given** I am on a mobile device, **When** I interact with any tappable element (search icon, close button, result cards, propose button), **Then** the touch target is at least 44x44px.

**Keyboard Navigation in Overlay:**

9. **Given** I am in the Spotlight overlay with results visible, **When** I use a hardware keyboard (e.g., Bluetooth keyboard on tablet), **Then** the same keyboard navigation from Story 1.2 works (ArrowDown/Up, Enter, Escape, Tab) with aria-activedescendant tracking.

## Dev Notes

### Architecture Patterns to Follow

- **Rendering approach (AD-11, AD-14, Pattern 7):** The SearchHero component renders different sub-trees based on `useIsMobile()`. On mobile, the hero area shows a compact prompt with a search button that opens a Sheet overlay. On desktop (>= 768px), it renders the existing inline search input with dropdown. **No separate MobileSearchHero file.**
- **Sheet component:** Use the existing `client/src/components/ui/sheet.tsx` (Radix Dialog-based). Use `side="bottom"` for the slide-up-from-bottom Spotlight feel. Override the default Sheet sizing to make it full-screen: `className="h-full max-h-full w-full max-w-full rounded-none"`.
- **useIsMobile hook:** Already exists at `client/src/hooks/use-mobile.tsx`. Uses `window.matchMedia("(max-width: 767px)")` — matches the 768px breakpoint exactly.
- **Auto-focus:** When Sheet opens, use `autoFocus` on the search input inside the Sheet, or use a `useEffect` with `inputRef.current?.focus()` after the Sheet's open animation completes. Radix Dialog traps focus by default, which is correct behavior.
- **Same search logic:** The search query, debounce, TanStack Query, ranking, highlighting, TermCard (variant="inline"), empty state, skeleton loading — all reused from the existing SearchHero implementation. No API changes.

### Brownfield Context (Integration Points)

**SearchHero.tsx — currently renders:**
- Hero text ("The Canonical Source of Truth")
- Inline search input with combobox pattern
- Dropdown results with keyboard navigation

**For mobile, SearchHero.tsx should render:**
- Compact hero text (can be shorter or same)
- A search button/icon that opens the Spotlight Sheet
- The Sheet contains: search input (auto-focused), results list (full-width), empty state, skeleton loading
- All search state (`query`, `highlightedIndex`, `debouncedQuery`, `searchResults`) lives in SearchHero — the Sheet just provides the container

**Layout.tsx — mobile header (line 146-151):**
- Currently shows "Katalyst Lexicon" title + hamburger menu button
- Needs: a search icon button added to the right side of the mobile header
- This search icon should open the same Spotlight Sheet
- The header search icon provides "search from any page" on mobile (AC1 says "any page")

**Key decision: Two entry points for mobile search**
1. **Home page:** The SearchHero compact view with search button → opens Sheet
2. **Any other page:** The header search icon → opens Sheet
Both should open the same Sheet overlay. This means the Sheet state management needs to be accessible from both the SearchHero and the Layout header.

**Recommended approach:** Create a `useSpotlightSearch` context or a simple state-lifting pattern. The simplest approach: Add a `SpotlightSearch` component that renders the Sheet and is included in the Layout. The header search icon and the SearchHero button both trigger it via a shared open state. Options:
- **Option A (simplest):** SpotlightSearch is a standalone component rendered in Layout. It manages its own Sheet + search state. The header icon and SearchHero button both open it via a callback prop or context.
- **Option B:** Use React context (`SpotlightContext`) with `open`/`setOpen` to coordinate. This is cleaner if more components need to trigger search.

**Recommended: Option A** — keep it simple. A `SpotlightSearch` component in Layout that exposes an `open` trigger. The Layout header icon calls it directly. The home page SearchHero on mobile shows a button that also calls it.

### Party Mode Finding Carry-Forward

No carry-forward findings from Story 1.2. All previous findings (aria-controls, card-in-card) were resolved.

### UI/UX Deliverables

**New component: `SpotlightSearch.tsx`**
- Full-screen Sheet (side="bottom", full height/width override)
- Contains: search input (auto-focused), results list, empty state, skeleton loading
- Reuses all search logic from SearchHero (query, debounce, TanStack Query, highlighting, keyboard nav)
- Results use TermCard variant="inline" (full-width, no card chrome)
- Close button (Sheet default X) and Escape key close the overlay
- Tapping a result navigates and closes the overlay
- aria-live region for result count announcements
- Touch targets minimum 44x44px on all interactive elements

**SearchHero.tsx modifications:**
- Import `useIsMobile` hook
- On mobile: render a compact hero with a "Search the Lexicon" button that triggers SpotlightSearch
- On desktop: render existing inline search with dropdown (unchanged)
- The desktop path keeps all existing keyboard navigation, aria attributes, etc.

**Layout.tsx modifications:**
- Add search icon (Search from lucide-react) to the mobile header bar (line 146-151)
- Search icon button opens SpotlightSearch overlay
- Render `<SpotlightSearch>` component in Layout
- Search icon only visible on mobile (lg:hidden, same as mobile header)

### Anti-Patterns & Hard Constraints

- **DO NOT** create a separate `MobileSearchHero.tsx` file. The SearchHero component handles both modes internally (AD-14, Pattern 7).
- **DO NOT** duplicate the search API logic. The SpotlightSearch component should use the same `useQuery` + `useDebounce` pattern.
- **DO NOT** change the debounce timing, staleTime, or search API endpoint. Those are Story 1.1 concerns.
- **DO NOT** break desktop behavior. All existing SearchHero functionality (inline search, dropdown, keyboard nav) must continue working unchanged at viewport >= 768px.
- **DO NOT** install new packages. Sheet component and useIsMobile hook already exist.
- **DO NOT** remove or change any existing `data-testid` attributes. Add new ones for mobile-specific elements.

### Gotchas & Integration Warnings

- **Sheet focus trap:** Radix Dialog (which Sheet is built on) automatically traps focus inside the dialog. This is correct for the Spotlight overlay — the user should Tab within the overlay, not escape to the page behind it. However, make sure the search input gets initial focus, not the close button.
- **Sheet close on navigation:** When a user taps a search result, the Sheet must close AND navigate to the term detail page. Call `setOpen(false)` first, then `navigate()`. Or use the Sheet's `onOpenChange` callback.
- **Keyboard in Sheet:** On mobile browsers, opening the keyboard may resize the viewport. The Sheet should handle this gracefully — results should scroll above the keyboard. Using `side="bottom"` with `h-full` and `overflow-y-auto` on the results container handles this.
- **Home page vs. other pages:** On the home page, the SearchHero renders the compact mobile view with a search button. On other pages, only the header search icon triggers the Spotlight. Both open the same Sheet. If the user is on the home page and taps the header search icon, it should work identically to tapping the SearchHero button.
- **SSR/hydration:** `useIsMobile()` returns `false` initially (before `useEffect` runs) because `window` isn't available during SSR. This means desktop layout renders first, then switches to mobile on hydration. This is fine for this app (no SSR), but be aware the initial render shows the desktop variant briefly on mobile — use CSS `md:hidden` / `md:block` classes to prevent flash of wrong content rather than relying solely on the hook for visibility.

### File Change Summary

| File | Action | Notes |
|------|--------|-------|
| `client/src/components/SpotlightSearch.tsx` | CREATE | Full-screen Sheet search overlay with all search logic, results, keyboard nav |
| `client/src/components/SearchHero.tsx` | MODIFY | Add mobile detection, render compact search button on mobile, render existing inline on desktop |
| `client/src/components/Layout.tsx` | MODIFY | Add search icon to mobile header, render SpotlightSearch, manage open state |

### Dependencies & Environment Variables

**No new packages needed.** Sheet component (`client/src/components/ui/sheet.tsx`) and useIsMobile hook (`client/src/hooks/use-mobile.tsx`) already exist.
**No environment variables needed.**
**Depends on:** Story 1.1 (search API, TermCard, StatusBadge) and Story 1.2 (keyboard navigation) — both complete.

### Testing Guidance

**E2E tests at mobile viewport (400x720):**
1. Navigate to home page → verify compact search button visible (not inline input) → tap search button → Sheet opens with auto-focused input
2. Type a query → results appear as full-width cards → tap a result → Sheet closes, navigates to term detail
3. Open Spotlight → type query with no matches → verify empty state with "Propose this term" button
4. Open Spotlight → tap close button (X) → Sheet closes, stay on same page
5. Open Spotlight → press Escape → Sheet closes
6. Navigate to /browse → tap header search icon → Sheet opens → type and search → works correctly

**E2E tests at desktop viewport (1280x720):**
7. Navigate to home page → verify inline search input visible (not a button) → verify no search icon in header
8. Type a query → dropdown appears below input (not a Sheet) → all existing behavior works

### References

- Epic 1 stories and ACs: `_bmad-output/planning-artifacts/epics-katalyst-lexicon-2026-02-06.md` → Epic 1, Story 1.3
- Architecture AD-11 (Spotlight overlay): `_bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md`
- Architecture AD-14 (responsive strategy): Pattern 7 — single component, different sub-trees
- UX Design Spec (mobile layout): `_bmad-output/planning-artifacts/ux-design-specification.md` → Mobile section
- Sheet component: `client/src/components/ui/sheet.tsx`
- useIsMobile hook: `client/src/hooks/use-mobile.tsx`
- SearchHero (desktop): `client/src/components/SearchHero.tsx`
- Layout (mobile header): `client/src/components/Layout.tsx`

## Dev Agent Record

### Agent Model Used

### Completion Notes

### File List
