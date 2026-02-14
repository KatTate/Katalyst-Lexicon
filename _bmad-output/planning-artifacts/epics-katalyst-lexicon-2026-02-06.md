---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'epics'
date: 2026-02-10
author: User
status: complete
---

# Katalyst Lexicon - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Katalyst Lexicon, decomposing the requirements from the PRD, Architecture (including UX-driven decisions AD-11 through AD-16), and UX Design Specification into implementable stories. This is a brownfield project with base CRUD features built — stories focus on UX refinement, search architecture, governance workflows, and accessibility compliance.

## Requirements Inventory

### Functional Requirements

FR1: Any user can view a list of all terms in the system
FR2: Any user can view the full detail of a term including definition, usage guidance, examples, synonyms, and metadata
FR3: Any user can view terms filtered by category
FR4: Any user can view terms filtered by status (Draft, In Review, Canonical, Deprecated)
FR5: Any user can view terms filtered by visibility level
FR6: Authorized users can create new terms with all structured fields
FR7: Authorized users can edit existing terms with change notes
FR8: The system records a versioned snapshot every time a term is modified
FR9: Any user can view the version history of a term with change notes, author, and timestamps
FR10: Deprecated terms display their replacement term (when relationship is modeled)
FR11: Any user can search terms by keyword across name, definition, synonyms, and examples
FR12: Search results return within 500ms for vocabularies up to 1,000 terms
FR13: Search results display term name, category, status badge, and definition preview
FR14: Any user can browse terms organized by category
FR15: Members can propose a new term through a structured form
FR16: Members can propose edits to an existing term
FR17: The proposal form captures all term fields (name, category, definition, why exists, usage guidance, examples, synonyms)
FR18: Before proposal submission, the system checks if any existing term name matches the proposed name and warns the user
FR19: Approvers can view a queue of pending proposals
FR20: Approvers can approve a proposal, which automatically creates or updates the corresponding term
FR21: Approvers can reject a proposal with a comment
FR22: Approvers can request changes on a proposal with feedback
FR23: The system maintains a full audit trail of all proposal decisions
FR24: Any user can view a list of all organizational principles
FR25: Any user can view the full detail of a principle including markdown body content
FR26: Authorized users can create, edit, and archive principles
FR27: Principles can be linked to related terms (bidirectional)
FR28: Term detail pages display linked principles
FR29: Principle detail pages display linked terms
FR30: Admins can view all system users
FR31: Users are auto-provisioned on first Google sign-in (restricted to @katgroupinc.com domain); admins can manage user roles
FR32: Admins can change a user's role
FR33: The system enforces role-based permissions for all write operations
FR34: Public read access is available without authentication
FR35: Admins can create, edit, and delete categories
FR36: Categories have a display order and color for UI presentation
FR37: The sidebar navigation displays categories as quick links
FR38: Admins can configure system behavior through settings toggles
FR39: Settings include governance controls (require approver signoff, require change notes, allow self-approval)
FR40: Settings include notification controls (weekly digest, new proposal alerts, changes requested alerts)
FR41: Settings include visibility controls (enable client portal, enable public glossary)
FR42: Every term and principle has a visibility classification (Internal / Client-Safe / Public)
FR43: The system can filter content by visibility level
FR44: Authentication is required for all write operations (propose, edit, approve, admin)

### NonFunctional Requirements

NFR1: Search results return within 500ms for vocabularies up to 1,000 terms
NFR2: Page load time under 2 seconds on standard connections
NFR3: Application maintains sub-2-second page loads with up to 50 concurrent users
NFR4: Application is mobile-responsive for meeting lookup use case
NFR5: Term lookup achievable in under 30 seconds from app open
NFR6: All interactive elements have data-testid attributes for automated testing
NFR7: Status badges use consistent, colorblind-friendly visual indicators
NFR8: All write operations require authentication (when auth is wired)
NFR9: Role-based permissions enforced regardless of client state
NFR10: Session tokens protected from client-side script access
NFR11: No secrets or credentials exposed in client-side code
NFR12: All term modifications produce an immutable version history entry
NFR13: Proposal approval atomically creates/updates the term and archives the proposal
NFR14: Database transactions used for multi-table operations
NFR15: Globally unique identifiers for all entity primary keys
NFR16: Strict type checking enforced across entire codebase
NFR17: Data schema defined once in a shared module, used by both client and server
NFR18: All database operations go through a single storage interface abstraction
NFR19: API route handlers remain thin — business logic lives in the storage layer
NFR20: Works in modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
NFR21: Responsive design supports desktop, tablet, and mobile viewports

### Additional Requirements

**From Architecture (AD-11 through AD-16):**

- AR1: Search-first UI with SearchHero component using WAI-ARIA combobox pattern (AD-11)
- AR2: Search results ranked using SQL CASE WHEN scoring: exact name match → name contains → definition/synonym match (AD-11)
- AR3: Search uses useDebounce hook (200ms) with TanStack Query, staleTime override of 30s for search queries (AD-11, Pattern 6)
- AR4: Search result highlighting is client-side string matching (AD-11)
- AR5: Mobile search renders as full-screen Spotlight overlay using Sheet component (AD-11, AD-14)
- AR6: Combobox keyboard navigation: Down Arrow opens/navigates, Tab closes without selecting, Enter selects, Escape closes (AD-11)
- AR7: 7 domain components built as composites on shadcn/ui primitives (AD-12): StatusBadge, TermCard, SearchHero, TierSection, UsageGuidance, ProposalForm, EmptyState
- AR8: TermCard displays freshness signal from updatedAt (relative time) and currentVersion (version badge) (AD-12)
- AR9: Two-tier progressive disclosure on term detail: Tier 1 always visible (definition, usage, status), Tier 2 expandable (examples, history, principles) (AD-13)
- AR10: Breadcrumb navigation on term detail derived from routing context + category (AD-13)
- AR11: Responsive strategy: useMediaQuery only for fundamentally different interaction patterns; Tailwind prefixes for layout changes (AD-14)
- AR12: WCAG 2.1 AA compliance across all components (AD-15)
- AR13: Skip link in Layout.tsx as first child element before header (AD-15)
- AR14: Page title updates on route change: "PageName — Katalyst Lexicon" (AD-15)
- AR15: Destructive confirmation dialogs: Enter does NOT confirm (AD-15)
- AR16: prefers-reduced-motion disables animations (AD-15)
- AR17: Minimum 44x44px touch targets on mobile (AD-15)
- AR18: Empty states bridge Lookup Job failures to Governance Job with pre-fill CTAs (AD-16)
- AR19: "Suggest an edit" fetches full term data via GET /api/terms/:id and pre-fills ProposalForm (AD-16)
- AR20: Proposal approval must be wrapped in database transaction for atomicity (Known Gap)

**From UX Design Specification:**

- UX1: Search-dominant home page with SearchHero as hero element (UX Core Experience)
- UX2: Results-as-you-type after 2+ characters with debounced input (UX Interaction Patterns)
- UX3: Card-based browse lists with term name, category tag, status badge, definition preview, freshness signal (UX Visual Patterns)
- UX4: Conversational form labels using "librarian voice" (UX Form Patterns)
- UX5: Progressive form disclosure: required fields always visible, optional behind "Add more detail" collapsible (UX Form Patterns)
- UX6: Duplicate detection on term name blur with amber warning (UX Journey 4)
- UX7: Review queue with badge count on nav item (UX Journey 5)
- UX8: Version history in Tier 2 with diff view and optional full snapshot view (UX Journey 6)
- UX9: Toast notifications for success (4s auto-dismiss), persistent for errors (UX Feedback Patterns)
- UX10: Inline field validation on blur with green checkmark for valid fields (UX Form Patterns)
- UX11: Status filter: multi-select (can combine Canonical + In Review); filters reflected in URL query parameters (UX Filter Patterns)
- UX12: Deprecated term amber banner at top of detail page with replacement link (UX Status Patterns)
- UX13: Button hierarchy: Primary (green), Secondary (outlined), Destructive (dialogs only), Ghost (text links) (UX Button Hierarchy)
- UX14: Empty state copy using "helpful librarian" voice (UX Empty State Patterns)
- UX15: Responsive breakpoints: mobile (<768px single column + Spotlight), tablet (768-1023 two-column), desktop (1024+ three-column + persistent sidebar) (UX Responsive Strategy)
- UX16: Dark mode support via CSS custom properties (UX Design System)
- UX17: Playwright e2e tests at 3 viewport sizes: 375px, 768px, 1280px (UX Testing Strategy)

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | View all terms (term list as search results + recently updated) |
| FR2 | Epic 2 | View term full detail (two-tier layout) |
| FR3 | Epic 3 | Filter terms by category |
| FR4 | Epic 3 | Filter terms by status |
| FR5 | Epic 3 | Filter terms by visibility |
| FR6 | Epic 5 | Create new terms via proposal form |
| FR7 | Epic 6 | Edit existing terms with change notes (via approval) |
| FR8 | Epic 6 | Record versioned snapshot on modification |
| FR9 | Epic 2 | View version history (Tier 2 section) |
| FR10 | Epic 2 | Deprecated terms show replacement |
| FR11 | Epic 1 | Search by keyword across name, definition, synonyms, examples |
| FR12 | Epic 1 | Search returns within 500ms |
| FR13 | Epic 1 | Search result display (name, category, status, definition preview) |
| FR14 | Epic 3 | Browse terms organized by category |
| FR15 | Epic 5 | Propose new term through structured form |
| FR16 | Epic 5 | Propose edits to existing term |
| FR17 | Epic 5 | Proposal form captures all term fields |
| FR18 | Epic 5 | Duplicate check before submission |
| FR19 | Epic 6 | View pending proposals queue |
| FR20 | Epic 6 | Approve proposal → create/update term atomically |
| FR21 | Epic 6 | Reject proposal with comment |
| FR22 | Epic 6 | Request changes with feedback |
| FR23 | Epic 6 | Full audit trail of proposal decisions |
| FR24 | Epic 4 | View principles list |
| FR25 | Epic 4 | View principle detail with markdown body |
| FR26 | Epic 7 | Create, edit, and archive principles |
| FR27 | Epic 4 | Link principles to terms (bidirectional) |
| FR28 | Epic 4 | Term detail shows linked principles |
| FR29 | Epic 4 | Principle detail shows linked terms |
| FR30 | Epic 7 | View all system users |
| FR31 | Epic 7 | Auto-provision users on Google sign-in (@katgroupinc.com); manage roles |
| FR32 | Epic 7 | Change user roles |
| FR33 | Epic 7 | Enforce role-based permissions |
| FR34 | Epic 7 | Public read access without auth |
| FR35 | Epic 7 | Category CRUD |
| FR36 | Epic 7 | Category display order and color |
| FR37 | Epic 3 | Sidebar category quick links |
| FR38 | Epic 7 | System settings toggles |
| FR39 | Epic 7 | Governance controls |
| FR40 | Epic 7 | Notification controls |
| FR41 | Epic 7 | Visibility controls |
| FR42 | Epic 3 | Visibility classification on terms/principles |
| FR43 | Epic 3 | Filter content by visibility level |
| FR44 | Epic 7 | Auth required for write operations |

**All 44 FRs mapped. Zero gaps.**

## Epic List

### Epic 1: Search & Discovery
Any user can search for a term and see instant, ranked results — the primary entry point for the "Lookup Job" (80% of all usage). The search experience must feel instant, with results-as-you-type, status badges at a glance, and a mobile Spotlight overlay.
**FRs covered:** FR1, FR11, FR12, FR13
**ARs covered:** AR1, AR2, AR3, AR4, AR5, AR6, AR7 (StatusBadge, TermCard, SearchHero), AR8
**UX covered:** UX1, UX2, UX3, UX15
**NFRs addressed:** NFR1, NFR2, NFR4, NFR5
**A11y (built-in):** AR12 (WCAG 2.1 AA on all components), AR6 (keyboard nav), AR17 (touch targets), NFR6 (data-testid), NFR7 (colorblind-safe badges)

### Epic 2: Term Detail Experience
Any user can read a complete term definition with usage guidance, view version history, and understand how definitions evolved — the "answer" moment that determines whether the product succeeds.
**FRs covered:** FR2, FR9, FR10
**ARs covered:** AR7 (TierSection, UsageGuidance), AR9, AR10
**UX covered:** UX8, UX12
**A11y (built-in):** AR12, AR17, NFR6, NFR7

### Epic 3: Browse & Discover
Any user can browse terms by category, filter by status and visibility, and explore the organization's vocabulary — supporting onboarding and category exploration.
**FRs covered:** FR3, FR4, FR5, FR14, FR37, FR42, FR43
**ARs covered:** AR11, AR18 (empty category bridge)
**UX covered:** UX11, UX14, UX15
**A11y (built-in):** AR12, AR17, NFR6

### Epic 4: Principles & Knowledge Connections
Any user can read organizational principles and navigate the bidirectional relationships between principles and terms — supporting "aha moments" during onboarding and exploration.
**FRs covered:** FR24, FR25, FR27, FR28, FR29
**UX covered:** UX3 (card-based principle lists)
**A11y (built-in):** AR12, AR17, NFR6

### Epic 5: Propose & Contribute
Authenticated members can propose new terms or suggest edits through a guided form with progressive disclosure, duplicate detection, and pre-fill from governance bridges — transforming passive readers into active contributors.
**FRs covered:** FR6, FR15, FR16, FR17, FR18
**ARs covered:** AR7 (ProposalForm, EmptyState), AR18, AR19
**UX covered:** UX4, UX5, UX6, UX9, UX10, UX13, UX14
**Dependencies:** Requires Epic 1 search API for duplicate detection
**A11y (built-in):** AR12, AR15 (destructive dialogs), AR17, NFR6

### Epic 6: Review & Approve
Approvers can view pending proposals, review full details, and make decisions (approve, reject, request changes) — maintaining the governed workflow that makes the lexicon authoritative.
**FRs covered:** FR7, FR8, FR19, FR20, FR21, FR22, FR23
**ARs covered:** AR7 (EmptyState for empty queue), AR15, AR20
**UX covered:** UX7, UX9, UX13
**NFRs addressed:** NFR12, NFR13, NFR14
**Dependencies:** Requires Epic 5 to have proposals to review
**A11y (built-in):** AR12, AR15, AR17, NFR6
**Complexity note:** Story for "approve proposal" is the most technically complex — creates/updates term + version history entry + updates proposal status atomically in a database transaction. Needs careful decomposition.

### Epic 7: Administration & Governance
Admins can manage users, categories, principles authoring, and system settings — ensuring proper role-based access, category organization, and governance controls.
**FRs covered:** FR26, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR38, FR39, FR40, FR41, FR44
**NFRs addressed:** NFR8, NFR9, NFR10, NFR11
**A11y (built-in):** AR12, AR15, AR17, NFR6

### Epic 8: Quality & Testing
Cross-cutting quality concerns that can't be addressed per-component: dark mode theming, skip link, page title updates, Playwright e2e test suite, and full WCAG 2.1 AA compliance audit.
**ARs covered:** AR13 (skip link), AR14 (page titles), AR16 (reduced motion)
**UX covered:** UX16 (dark mode), UX17 (e2e test suite)
**NFRs addressed:** NFR6 (data-testid audit), NFR20 (browser compatibility), NFR21 (responsive verification)

## Dependencies

```
Epic 1: Search & Discovery        → No dependencies (foundational)
Epic 2: Term Detail Experience     → No dependencies (foundational)
Epic 3: Browse & Discover          → No dependencies (foundational)
Epic 4: Principles & Knowledge     → No dependencies (foundational)
Epic 5: Propose & Contribute       → Depends on Epic 1 (search API for duplicate detection)
Epic 6: Review & Approve           → Depends on Epic 5 (proposals to review)
Epic 7: Administration             → No dependencies (can be done in parallel)
Epic 8: Quality & Testing          → Should be last (audits all previous work)
```

**Key architectural note:** Accessibility requirements (WCAG 2.1 AA, keyboard navigation, ARIA attributes, touch targets, data-testid) are embedded as acceptance criteria in every component story across Epics 1-7 — not deferred to Epic 8. Epic 8 covers only the cross-cutting horizontal concerns (dark mode, skip link, page titles, e2e suite, final audit).

---

## Epic 1: Search & Discovery — Stories

### Story 1.1: Search API + SearchHero with Ranked Results-as-You-Type [Size: L]

As a user looking up a term,
I want to type into a prominent search input and see ranked, highlighted results appear instantly,
So that I find the right term in seconds without submitting a form or navigating away.

**Acceptance Criteria:**

**Given** I land on the home page
**When** the page loads
**Then** I see a large, centered search input as the dominant element on the page
**And** the input has placeholder text guiding me (e.g., "Search terms, definitions, synonyms...")

**Given** I type "sco" into the search input
**When** 200ms passes after my last keystroke
**Then** a dropdown appears below the input showing matching terms as cards
**And** each card shows: term name, category tag, status badge, definition preview, and freshness signal ("Updated 3 days ago", "v4")

**Given** results are returned for "sco"
**When** a term named exactly "Scope" exists
**Then** it appears first (exact name match ranked highest)
**And** terms whose names start with "sco" appear next
**And** terms where "sco" appears in the definition, synonyms, or examples appear last

**Given** results are displayed
**When** I look at any result card
**Then** the matching text "sco" is highlighted in bold wherever it appears — in the term name, definition preview, or synonym list

**Given** I type a query with no matches
**When** the dropdown appears
**Then** I see a friendly empty state: "We don't have that term yet"
**And** a "Propose this term" button is shown with my search query pre-filled as the term name

**Given** search results are loading
**When** I see the dropdown area
**Then** skeleton card placeholders are shown (not a full-page spinner)

**Given** I type fewer than 2 characters
**When** I have typed only 1 character
**Then** no search is triggered and no dropdown appears

**Given** I clear the search input (backspace to empty or click clear)
**When** the input becomes empty
**Then** the dropdown closes and I return to the default home page state

**Given** I click on a search result card
**When** the result is selected
**Then** I navigate to that term's detail page

**Given** a term has status "Canonical"
**When** I view its status badge on any card
**Then** I see a green badge with a checkmark icon and the text "Canonical"

**Given** a term has status "Deprecated"
**When** I view its status badge
**Then** I see an amber badge with a warning icon and visually muted card styling

**Given** I am using a screen reader
**When** I interact with the search
**Then** the combobox has proper ARIA attributes (`role="combobox"`, `aria-expanded`, `aria-activedescendant`)
**And** result count is announced via `aria-live="polite"`
**And** all interactive elements have accessible labels

**Dev Notes:**
- StatusBadge component: 4 variants (Canonical/green, Deprecated/amber, Draft/gray, In Review/blue), each with icon + color + text. `data-testid="badge-status-{status}"`
- TermCard component: composes Card + StatusBadge, shows name, category, definition preview (2-line truncation), freshness (relative time from `updatedAt`), version badge (`currentVersion`). `data-testid="term-card-{id}"`
- SearchHero component: WAI-ARIA combobox pattern, uses `useDebounce(200ms)` + TanStack Query with `staleTime: 30_000`, `enabled: query.length >= 2`
- Search API endpoint: `GET /api/terms/search?q={query}`, max 10 results
- SQL CASE WHEN scoring in `storage.searchTerms()`: exact name = 1, name starts with = 2, name contains = 3, definition/synonym match = 4. Case-insensitive via LOWER()
- Client-side highlighting: bold matched substrings across name, definition preview, and synonyms
- EmptyState component with "Propose this term" CTA linking to `?name={searchQuery}`
- Consider GIN index on search fields for scaling beyond 500 terms (NFR1)
- All components support `className` override via `cn()`, light/dark mode, `prefers-reduced-motion`
- Minimum 44px touch targets on mobile (AR17)

---

### Story 1.2: SearchHero Keyboard Navigation [Size: S]

As a keyboard user or power user,
I want to navigate search results using keyboard shortcuts,
So that I can find and select terms without using a mouse.

**Acceptance Criteria:**

**Given** the search input is focused and results are visible
**When** I press the Down Arrow key
**Then** the first result is highlighted with a visible focus indicator
**And** subsequent Down Arrow presses move the highlight down through results

**Given** a result is highlighted
**When** I press the Up Arrow key
**Then** the highlight moves to the previous result

**Given** a result is highlighted
**When** I press Enter
**Then** I navigate to that term's detail page

**Given** results are visible
**When** I press Tab
**Then** the dropdown closes without selecting any result
**And** focus moves to the next focusable element on the page

**Given** results are visible
**When** I press Escape
**Then** the dropdown closes, selection is cleared, and focus remains on the search input

**Given** the search input is focused but no results are visible
**When** I press Down Arrow
**Then** the dropdown opens (if cached results exist) and the first result is highlighted

**Dev Notes:**
- `aria-activedescendant` tracks the currently highlighted result
- Highlighted result gets visible focus ring or background highlight
- All keyboard behavior works identically when hardware keyboard is connected on mobile

---

### Story 1.3: Mobile Spotlight Search Overlay [Size: M]

As a user on a mobile device,
I want search to open as a full-screen overlay when I tap the search icon,
So that I get maximum space for results and the keyboard appears immediately.

**Acceptance Criteria:**

**Given** I am on any page on a mobile device (viewport < 768px)
**When** I tap the search icon in the header
**Then** a full-screen overlay (Sheet) slides up covering the entire screen
**And** the search input is auto-focused and the keyboard appears

**Given** I am in the Spotlight overlay and type a search query
**When** results appear
**Then** they fill the available screen space as full-width cards
**And** the same ranking, highlighting, and empty state behavior as desktop applies

**Given** I am in the Spotlight overlay
**When** I tap a search result
**Then** the overlay closes and I navigate to the term detail page

**Given** I am in the Spotlight overlay
**When** I tap the close button or swipe down
**Then** the overlay closes and I return to the page I was on

**Dev Notes:**
- Uses `useMediaQuery("(max-width: 767px)")` to determine rendering mode
- Mobile: Sheet component (full-screen); Desktop: Popover dropdown
- Same SearchHero component renders different sub-trees internally — no separate MobileSearchHero file
- Header shows search icon (not full input) on mobile viewports
- All touch targets minimum 44x44px (AR17)

---

### Story 1.4: Home Page with Recently Updated Terms [Size: S]

As a user landing on the home page,
I want to see recently updated terms below the search bar,
So that I can discover what's changed without searching and get a sense the lexicon is actively maintained.

**Acceptance Criteria:**

**Given** I am on the home page
**When** the page loads
**Then** I see the SearchHero at the top as the dominant element
**And** below it, I see a section titled "Recently Updated" showing the most recently modified terms

**Given** terms exist in the system
**When** I view the "Recently Updated" section
**Then** I see up to 6 terms displayed as TermCards in a responsive grid
**And** the grid shows 1 column on mobile, 2 on tablet, 3 on desktop
**And** terms are ordered by most recently updated first

**Given** no terms exist in the system
**When** I view the home page
**Then** I see an empty state below the search bar with a message like "The lexicon is just getting started"
**And** a "Propose the first term" CTA button is visible

**Dev Notes:**
- Uses existing terms API with sort by `updatedAt` descending, limit 6
- TermCard grid uses Tailwind responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- EmptyState component with librarian voice copy
- Page title: "Katalyst Lexicon" (home page)

---

**Epic 1 complete: 4 stories (1 Large, 1 Medium, 2 Small). All FRs covered: FR1, FR11, FR12, FR13.**

---

## Epic 2: Term Detail Experience — Stories

### Story 2.1: Term Detail Page with Two-Tier Progressive Disclosure [Size: L]

As a user who found a term through search or browsing,
I want to see its full definition, usage guidance, and metadata in a clear, scannable layout,
So that I get the answer I need immediately and can explore deeper context if I want.

**Acceptance Criteria:**

**Given** I navigate to a term detail page (e.g., by clicking a search result)
**When** the page loads
**Then** I see breadcrumb navigation showing: Home > {Category} > {Term Name}

**Given** I am viewing a term detail page
**When** I look at the Tier 1 (always visible) section
**Then** I see the term name as the page heading
**And** the status badge (Canonical/Draft/In Review/Deprecated)
**And** the category tag
**And** the full definition
**And** usage guidance (when provided) in a distinct section with clear formatting
**And** the freshness signal ("Updated 3 days ago") and version badge ("v4")

**Given** the term has a "Why it exists" explanation
**When** I view Tier 1
**Then** it appears below the definition as a brief contextual note

**Given** the term has synonyms
**When** I view Tier 1
**Then** synonyms are displayed as inline tags/chips

**Given** I am viewing a term detail page
**When** I look below Tier 1
**Then** I see collapsible Tier 2 sections that are collapsed by default: "Examples", "Version History", "Related Principles"

**Given** a Tier 2 section exists (e.g., "Examples")
**When** I click the section header
**Then** it expands to reveal its content
**And** other Tier 2 sections remain in their current state (independent toggles)

**Given** the term has good examples and bad examples
**When** I expand the "Examples" section
**Then** I see good examples with a green indicator and bad examples with a red indicator
**And** each example has clear formatting distinguishing it from prose

**Given** I am using a screen reader
**When** I navigate the page
**Then** the page has a logical heading hierarchy (h1 for term name, h2 for sections)
**And** Tier 2 sections use `aria-expanded` to communicate their state
**And** all interactive elements have accessible labels

**Given** the term is in "Deprecated" status
**When** I view the detail page
**Then** I see an amber banner at the top of the page with the text "This term has been deprecated"
**And** if a replacement term exists, the banner includes a link: "See {replacement term name} instead"

**Given** I want to suggest an improvement
**When** I see the "Suggest an edit" link on the page
**Then** clicking it navigates me to the proposal form with all current term fields pre-filled

**Dev Notes:**
- TierSection component: collapsible with `aria-expanded`, smooth transition (respects `prefers-reduced-motion`)
- UsageGuidance component: distinct formatting (e.g., background, border-left accent) to separate from definition
- Breadcrumb: derived from route context + term's category, uses `nav` element with `aria-label="Breadcrumb"`
- Page title: "{Term Name} — Katalyst Lexicon" (AR14)
- "Suggest an edit" link: `GET /api/terms/:id` fetches full data, navigates to `/propose?editTermId={id}` (AR19)
- `data-testid` on: breadcrumb, term name, status badge, definition, usage guidance, each Tier 2 toggle, deprecated banner, suggest-edit link

---

### Story 2.2: Version History in Term Detail [Size: M]

As a user exploring a term,
I want to view how its definition has changed over time with author and timestamp,
So that I understand the term's evolution and can trust it reflects current organizational thinking.

**Acceptance Criteria:**

**Given** I am on a term detail page with version history
**When** I expand the "Version History" Tier 2 section
**Then** I see a chronological list of versions, most recent first
**And** each version entry shows: version number, author name, date, and change notes

**Given** there are two or more versions
**When** I view the version list
**Then** I can see what changed between versions by reading the change notes
**And** the current version is visually marked (e.g., "Current" badge)

**Given** a version entry exists
**When** I click "View full snapshot" on a past version
**Then** I see the complete term definition, usage guidance, and metadata as it existed at that version

**Given** a term has only one version (just created)
**When** I expand "Version History"
**Then** I see a single entry marked as "v1 — Original" with the creation date and author

**Given** I am using a screen reader
**When** I navigate the version list
**Then** each version entry is announced with its version number, author, and date

**Dev Notes:**
- Endpoint: `GET /api/terms/:id/versions` returns version array sorted by version number descending
- Version snapshot view could be a modal or inline expansion — keep it simple for MVP
- `data-testid="version-entry-{versionNumber}"` on each version row
- Change notes field may be empty for early versions — display "No change notes" in muted text

---

**Epic 2 complete: 2 stories (1 Large, 1 Medium). All FRs covered: FR2, FR9, FR10.**

---

## Epic 3: Browse & Discover — Stories

### Story 3.1: Browse Page with Category Sections and Sidebar [Size: L]

As a user exploring the lexicon,
I want to see all terms organized by category on a browse page with a sidebar for quick navigation,
So that I can explore the vocabulary by topic and jump to the category I care about.

**Acceptance Criteria:**

**Given** I navigate to the browse page
**When** the page loads
**Then** I see a page heading ("Browse Terms") with no SearchHero — the browse page uses filter controls, not a search hero
**And** all terms are grouped under their category headings
**And** each category section shows the category name, color accent (left border), and count of terms
**And** terms within each category are displayed as TermCards in a responsive grid

**Given** the page has multiple categories
**When** I view the page on desktop (1024px+)
**Then** I see a persistent sidebar on the left listing all categories as quick links
**And** clicking a category link scrolls me smoothly to that section on the page

**Given** I am on a tablet (768-1023px)
**When** I view the page
**Then** the sidebar is hidden and categories are listed sequentially in a two-column term grid

**Given** I am on mobile (< 768px)
**When** I view the page
**Then** categories are listed sequentially in a single-column term grid
**And** a "Jump to category" dropdown appears at the top for quick navigation

**Given** a category has no terms and no filters are active
**When** I view that category section
**Then** I see an empty state: "No terms in this category yet"
**And** a "Propose a term" CTA button is shown that pre-fills the category on the proposal form

**Given** a category has no matching terms because filters are active
**When** filters reduce a category to zero results
**Then** that category section is hidden entirely (no empty state shown — it's just noise when filtering)

**Given** I am using a screen reader
**When** I navigate the page
**Then** the sidebar uses `nav` with `aria-label="Categories"`
**And** category headings provide proper hierarchy for skip navigation

**Dev Notes:**
- Sidebar uses Tailwind `hidden lg:block` for responsive show/hide
- Category quick links use smooth scroll with `scroll-margin-top` for header offset
- Mobile "Jump to category" is a Select/dropdown component
- TermCards reuse the component from Epic 1
- Fetch: `GET /api/terms` + `GET /api/categories`, group client-side by category
- Category color used as left-border accent on section headers
- Page title: "Browse — Katalyst Lexicon"
- `data-testid` on: sidebar, each category link, each category section, jump-to dropdown, empty state CTAs

---

### Story 3.2: Filter Terms by Status and Visibility [Size: M]

As a user browsing terms,
I want to filter by status and visibility level so I can narrow down to the terms relevant to my current context,
So that I find exactly what I need without scrolling through everything.

**Acceptance Criteria:**

**Given** I am on the browse page
**When** I look above the category sections
**Then** I see a horizontal filter bar with: a multi-select status filter and a single-select visibility filter
**And** the status filter shows options: Canonical, Draft, In Review, Deprecated (I can select multiple simultaneously)
**And** the visibility filter shows options: All, Internal, Client-Safe, Public (I can select only one at a time)

**Given** I am on mobile (< 768px)
**When** I view the filter area
**Then** the filters are inside a collapsible "Filters" section that I can expand/collapse
**And** when collapsed, a badge shows how many filters are active (e.g., "Filters (2)")

**Given** I select "Canonical" and "In Review" status filters
**When** the filters apply
**Then** only terms with status Canonical or In Review are shown
**And** the URL updates to reflect my filter selections (e.g., `?status=canonical,in-review`)
**And** the term count per visible category section updates to reflect filtered results

**Given** I select "Client-Safe" from the visibility filter
**When** the filter applies
**Then** only terms with visibility "Client-Safe" are shown
**And** status and visibility filters work together (AND logic: status matches AND visibility matches)

**Given** I copy the current URL with filter parameters and share it with a colleague
**When** they open the URL
**Then** they see the same filtered view with the same filters pre-selected

**Given** filters are active
**When** I click a "Clear filters" button
**Then** all filters are removed, URL parameters are cleared, and all terms are shown

**Given** a filter combination returns no results across all categories
**When** no terms match
**Then** I see a friendly empty state: "No terms match these filters"
**And** a "Clear filters" button is prominent

**Dev Notes:**
- Multi-select for status uses checkbox-style toggles (can combine multiple)
- Visibility filter is single-select dropdown or radio group
- Desktop: horizontal filter bar above content; Mobile: collapsible "Filters" section
- Filters reflected in URL via `useLocation` from wouter + query string parsing
- Filter state drives the API query: `GET /api/terms?status=canonical,in-review&visibility=client-safe`
- `data-testid` on: each filter option, clear-filters button, filter container, active-filter-count badge

---

**Epic 3 complete: 2 stories (1 Large, 1 Medium). All FRs covered: FR3, FR4, FR5, FR14, FR37, FR42, FR43.**

---

## Epic 4: Principles & Knowledge Connections — Stories

### Story 4.1: Principles List Page [Size: M]

As a user exploring organizational thinking,
I want to browse a list of all principles,
So that I can discover the philosophies behind the organization's vocabulary.

**Acceptance Criteria:**

**Given** I navigate to the principles page
**When** the page loads
**Then** I see a list of all principles displayed as cards
**And** each card shows: principle title, status badge, summary preview (2-line truncation), tag list, and linked term count (e.g., "5 related terms")

**Given** principles exist with different statuses
**When** I view the list
**Then** I see status badges on each card (Published, Draft, Archived) consistent with the term status badge pattern

**Given** no principles exist yet
**When** I view the principles list page
**Then** I see an empty state: "Principles will appear here once they're published"
**And** the message does not include a "Create" CTA (since most users cannot create principles)

**Given** I click on a principle card
**When** I click
**Then** I navigate to that principle's detail page

**Given** I am using a screen reader
**When** I navigate the principles list
**Then** the page has proper heading hierarchy and each card is announced with title and linked term count

**Dev Notes:**
- PrincipleCard: reuses Card pattern, shows title, status badge, summary (2-line clamp), tags as chips, linked term count
- Endpoint: `GET /api/principles` — response should include `linkedTermCount` for each principle
- Page title: "Principles — Katalyst Lexicon"
- `data-testid` on: each principle card (`principle-card-{id}`), empty state

---

### Story 4.2: Principle Detail Page [Size: M]

As a user who selected a principle,
I want to read its full content rendered as formatted text and see which terms it connects to,
So that I understand the principle deeply and can explore related vocabulary.

**Acceptance Criteria:**

**Given** I navigate to a principle detail page
**When** the page loads
**Then** I see the principle title as the page heading
**And** the full summary text
**And** the body content rendered as formatted markdown (headings, lists, bold, links)
**And** the status badge and visibility classification
**And** tags displayed as inline chips

**Given** the principle has linked terms
**When** I view the detail page
**Then** I see a "Related Terms" section listing the linked terms as TermCards
**And** clicking a linked term navigates me to that term's detail page

**Given** the principle has no linked terms
**When** I view the detail page
**Then** the "Related Terms" section shows: "No terms linked to this principle yet"

**Given** the principle has status "Archived"
**When** I view the detail page
**Then** I see a muted banner at the top: "This principle has been archived"
**And** the page content is still fully readable (not hidden or blocked)

**Given** I am using a screen reader
**When** I navigate the detail page
**Then** the page has a logical heading hierarchy (h1 for title, h2 for sections)
**And** all interactive elements have accessible labels

**Dev Notes:**
- Markdown rendering: use `react-markdown` or `marked` + `DOMPurify`. Either way, sanitize all HTML output to prevent XSS from user-authored markdown
- Endpoint: `GET /api/principles/:id` — response includes full body and `linkedTerms` array (via join on `principleTermLinks`)
- Archived banner uses muted styling (gray background, not amber — it's not a warning, just informational)
- Page title: "{Principle Title} — Katalyst Lexicon"
- `data-testid` on: principle title, body content, related terms section, each linked term card, archived banner

---

### Story 4.3: Bidirectional Term-Principle Links [Size: S]

As a user viewing a term detail page,
I want to see which principles are connected to this term,
So that I understand the broader organizational context behind the term's definition.

**Acceptance Criteria:**

**Given** I am on a term detail page and the term has linked principles
**When** I expand the "Related Principles" Tier 2 section
**Then** I see a list of linked principles with their title, summary preview, and status
**And** clicking a principle navigates me to that principle's detail page

**Given** a term has no linked principles
**When** I expand the "Related Principles" Tier 2 section
**Then** I see a brief message: "No principles linked to this term"

**Given** I link a principle to a term (via admin)
**When** I view either the term detail or the principle detail
**Then** the link appears in both directions — the term shows the principle and the principle shows the term

**Dev Notes:**
- Term detail already has the Tier 2 "Related Principles" section shell from Story 2.1 — this story populates it with data
- Endpoint: `GET /api/terms/:id` response should include `linkedPrinciples` array (via join on `principleTermLinks` table)
- `data-testid="linked-principle-{id}"` on each linked principle item

---

**Epic 4 complete: 3 stories (2 Medium, 1 Small). All FRs covered: FR24, FR25, FR27, FR28, FR29.**

---

## Epic 5: Propose & Contribute — Stories

### Story 5.1: Proposal Form for New Terms [Size: L]

As a team member who noticed a missing term,
I want to fill out a guided proposal form that asks for the term name, definition, category, and optional details,
So that I can contribute to the lexicon without needing to know the full editorial process.

**Acceptance Criteria:**

**Given** I navigate to the "Propose a Term" page
**When** the page loads
**Then** I see a form with required fields always visible: Term Name, Definition, Category (dropdown), and "Why does this term need to exist?"
**And** optional fields are hidden behind an "Add more detail" collapsible section: Usage Guidance, Good Examples, Bad Examples, Synonyms
**And** form labels use conversational "librarian voice" (e.g., "What's the term?" instead of "Term Name")

**Given** I click "Add more detail"
**When** the collapsible section expands
**Then** I see the optional fields: Usage Guidance (textarea), Good Examples (add multiple), Bad Examples (add multiple), Synonyms (comma-separated or tag input)

**Given** I have added a good or bad example to the dynamic list
**When** I click the remove button next to it
**Then** the example is removed from the list

**Given** I fill in the Term Name field and tab away (blur)
**When** the name I entered exactly matches or starts with an existing term's name
**Then** I see an amber warning below the field: "A similar term already exists: {matching term name}"
**And** a link to view the existing term is provided
**And** the warning does NOT block submission — it's informational only

**Given** I fill in the Term Name field and tab away (blur)
**When** the name only matches in a definition or synonym (not in term names)
**Then** no duplicate warning is shown (only exact name match and "starts with" matches trigger the warning)

**Given** required fields are all empty
**When** I view the submit button
**Then** it appears disabled with reduced opacity

**Given** I fill out all required fields correctly
**When** I view the submit button
**Then** it becomes enabled (green, primary style)

**Given** I fill out all required fields and click "Submit Proposal"
**When** the submission succeeds
**Then** the proposal is created with status "Pending"
**And** I see a success toast (4-second auto-dismiss): "Your proposal has been submitted for review"
**And** I am navigated to a confirmation page or back to the home page

**Given** I leave a required field empty
**When** I try to submit
**Then** I see inline validation errors on the empty fields
**And** the form does not submit

**Given** I fill in a field correctly
**When** I tab away from the field (blur)
**Then** I see a green checkmark next to the field indicating it's valid

**Given** submission fails (server error)
**When** the error occurs
**Then** I see a persistent error toast (does not auto-dismiss): "Something went wrong. Please try again."
**And** my form data is preserved so I don't lose my work

**Given** I have entered data into the form
**When** I navigate away without submitting (clicking a link, pressing back, etc.)
**Then** I see a confirmation dialog: "You have unsaved changes. Leave anyway?"
**And** I can choose to stay or leave

**Given** I arrived at the proposal page via "Propose this term" from a search empty state
**When** the page loads
**Then** the Term Name field is pre-filled with the search query from the URL parameter (`?name={query}`)

**Given** I arrived via a "Propose a term" CTA from an empty category
**When** the page loads
**Then** the Category dropdown is pre-filled with that category from the URL parameter (`?category={id}`)

**Given** I arrived with both URL parameters (`?name=Sprint&category=2`)
**When** the page loads
**Then** both the Term Name and Category fields are pre-filled

**Given** I am using a screen reader
**When** I interact with the form
**Then** all fields have associated labels, required fields are marked with `aria-required`
**And** validation errors are announced via `aria-describedby` linked to error messages
**And** the success/error toasts are announced via `aria-live` regions

**Dev Notes:**
- ProposalForm component: progressive disclosure with Collapsible for optional fields
- Duplicate detection: on name blur, call `GET /api/terms/search?q={name}` — only warn if results include exact name match or name-starts-with match (tiers 1-2 from search ranking). Ignore contains/definition matches (tiers 3-4) to avoid false positives
- Inline validation on blur using react-hook-form + zod resolver
- Toast: success = 4s auto-dismiss; error = persistent until dismissed
- Endpoint: `POST /api/proposals` with body matching proposal insert schema
- Good/Bad examples: dynamic list with "Add another" and per-item remove button
- Synonyms: tag-style input (comma-separated, chips display)
- Button hierarchy: Primary green "Submit Proposal" button, disabled until required fields valid (UX13)
- Unsaved changes: use `beforeunload` event + wouter navigation guard
- Seed data should include at least one term for duplicate detection testing
- URL params `?name=` and `?category=` work independently and together
- `data-testid` on: each form field, submit button, duplicate warning, add-more-detail toggle, each example add/remove button, toast messages, unsaved-changes dialog

---

### Story 5.2: Propose Edits to Existing Terms [Size: M]

As a team member who thinks an existing term's definition needs updating,
I want to propose an edit with all current values pre-filled so I only change what needs changing,
So that I can suggest improvements without rewriting the entire entry from scratch.

**Acceptance Criteria:**

**Given** I click "Suggest an edit" on a term detail page
**When** the proposal form loads
**Then** all fields are pre-filled with the term's current values (name, definition, category, usage guidance, examples, synonyms)
**And** the form heading indicates this is an edit proposal (e.g., "Suggest changes to: {term name}")
**And** an additional required field appears: "Change Notes" — explaining what I changed and why

**Given** I modify one or more fields and add change notes
**When** I click "Submit Proposal"
**Then** a proposal is created with type "Edit" linked to the original term
**And** the proposal stores both the proposed values and a reference to the original term ID
**And** I see a success toast: "Your edit suggestion has been submitted for review"

**Given** I try to submit an edit proposal without change notes
**When** I click submit
**Then** I see an inline validation error: "Please explain what you changed and why"

**Given** I haven't changed any fields from their original values
**When** I click submit
**Then** I see a validation message: "No changes detected — please modify at least one field"

**Given** the duplicate detection fires on the name field
**When** I haven't changed the name (it's the same as the original)
**Then** no duplicate warning is shown (it would match itself)

**Given** I have entered data into the form
**When** I navigate away without submitting
**Then** I see the same "unsaved changes" confirmation dialog as for new proposals

**Dev Notes:**
- Pre-fill: fetch term data via `GET /api/terms/:id`, populate form via URL param `?editTermId={id}` (AR19)
- Proposal type: "new" vs "edit" — edit proposals include `editTermId` foreign key
- Change notes field: textarea, required for edit proposals, not shown for new proposals
- Change detection: use react-hook-form's `isDirty` which compares against `defaultValues` (the original term values)
- Same ProposalForm component with conditional rendering for edit mode
- `data-testid` on: change-notes field, edit-mode heading, all form fields (reused from 5.1)

---

**Epic 5 complete: 2 stories (1 Large, 1 Medium). All FRs covered: FR6, FR15, FR16, FR17, FR18.**

---

## Epic 6: Review & Approve — Stories

### Story 6.1: Proposal Review Queue [Size: M]

As an approver,
I want to see a queue of all pending proposals with key details at a glance,
So that I can prioritize which proposals to review first.

**Acceptance Criteria:**

**Given** I am an approver and navigate to the review queue page
**When** the page loads
**Then** I see a list of all pending proposals ordered by submission date (oldest first)
**And** each proposal card shows: proposed term name, proposal type (New / Edit), submitter name, submission date, and category

**Given** the navigation sidebar or header has a "Review" link
**When** pending proposals exist
**Then** the link shows a badge count of pending proposals (e.g., "Review (3)")

**Given** I click on a proposal in the queue
**When** the proposal detail loads
**Then** I navigate to the proposal review page for that proposal

**Given** no pending proposals exist
**When** I view the review queue
**Then** I see an empty state: "No proposals waiting for review — the team is all caught up!"

**Given** I am a member (not an approver or admin)
**When** I try to access the review queue
**Then** I see a message: "You don't have permission to review proposals"
**And** the Review link does not appear in my navigation

**Dev Notes:**
- Endpoint: `GET /api/proposals?status=pending` returns pending proposals with submitter info
- Badge count: fetch count separately or derive from list length
- Page title: "Review Queue — Katalyst Lexicon"
- Queue sorts oldest-first so nothing gets buried
- `data-testid` on: each proposal card (`proposal-card-{id}`), badge count, empty state, permission message

---

### Story 6.2: Proposal Review and Decision [Size: L]

As an approver reviewing a proposal,
I want to see the full proposed term details and choose to approve, reject, or request changes,
So that I can make an informed decision and provide feedback to the contributor.

**Acceptance Criteria:**

**Given** I am viewing a proposal review page
**When** the page loads
**Then** I see all proposed term fields: name, definition, category, why it exists, usage guidance, examples, synonyms
**And** I see the submitter's name and submission date
**And** I see the proposal type (New or Edit)

**Given** the proposal is an edit (type "Edit")
**When** I view the review page
**Then** I see each field with an inline diff showing changes: removed text with strikethrough and added text with highlight
**And** unchanged fields appear normally without diff markup

**Given** I want to approve the proposal
**When** I click the "Approve" button
**Then** I see a confirmation dialog: "Approve this proposal? This will create/update the term."
**And** the Enter key does NOT confirm the dialog (AR15 — destructive action protection)
**And** I must click the "Confirm Approve" button to proceed

**Given** I confirm approval
**When** the approval processes
**Then** the corresponding term is created (for new) or updated (for edit) with the proposed values
**And** a version history entry is created with the change notes
**And** the proposal status changes to "Approved"
**And** an audit event is recorded
**And** I see a success toast: "Proposal approved — term has been published"
**And** I am returned to the review queue

**Given** the proposal has already been approved or rejected by another reviewer
**When** I click Approve (or Reject or Request Changes)
**Then** I see an error message: "This proposal has already been reviewed"
**And** the page refreshes to show the current proposal status

**Given** I want to reject the proposal
**When** I click the "Reject" button
**Then** a text area appears asking for a rejection reason (required)
**And** I must enter a reason before the rejection is confirmed

**Given** I confirm the rejection with a reason
**When** the rejection processes
**Then** the proposal status changes to "Rejected" with my reason saved
**And** an audit event is recorded
**And** I see a success toast: "Proposal rejected"
**And** I am returned to the review queue

**Given** I want to request changes
**When** I click "Request Changes"
**Then** a text area appears for feedback (required)
**And** I must enter feedback before submitting

**Given** I submit a change request with feedback
**When** the request processes
**Then** the proposal status changes to "Changes Requested" with my feedback saved
**And** an audit event is recorded
**And** I see a success toast: "Feedback sent to the proposer"
**And** I am returned to the review queue

**Given** I am using a screen reader
**When** I interact with the review actions
**Then** the confirmation dialog is announced with its purpose
**And** focus is trapped within the dialog until I dismiss or confirm it

**Dev Notes:**
- Endpoint: `GET /api/proposals/:id` for full proposal detail
- Approve: `POST /api/proposals/:id/approve` — wrapped in database transaction (AR20, NFR13, NFR14): atomically (1) validate proposal is still "Pending", (2) create/update term, (3) create version history entry, (4) update proposal status, (5) record audit event. If proposal is no longer Pending, return 409 Conflict.
- Reject: `POST /api/proposals/:id/reject` with `{ reason }` body
- Request Changes: `POST /api/proposals/:id/request-changes` with `{ feedback }` body
- Edit comparison: inline diff approach — each field shown once with strikethrough for removed text and highlight for additions. Simpler than side-by-side and works on mobile.
- Confirmation dialog: AlertDialog component, Enter does NOT confirm (set autoFocus on Cancel button)
- Button hierarchy: Approve = primary green, Request Changes = secondary outlined, Reject = destructive (UX13)
- Test: verify concurrent approval scenario — open two tabs, approve in one, try in the other, expect graceful 409 error
- `data-testid` on: approve/reject/request-changes buttons, confirmation dialog, reason/feedback textarea, proposal fields, diff highlights

---

### Story 6.3: Proposal Audit Trail [Size: S]

As an approver or admin,
I want to see the full history of decisions made on a proposal,
So that I can understand who reviewed it and what feedback was given.

**Acceptance Criteria:**

**Given** I am viewing a proposal that has been reviewed
**When** I look at the proposal detail page
**Then** I see an audit trail section showing all actions taken: submission, any change requests with feedback, and the final decision (approved/rejected) with timestamp and reviewer name

**Given** a proposal went through multiple rounds (submitted → changes requested → resubmitted → approved)
**When** I view the audit trail
**Then** I see each event in chronological order with timestamps, actor names, and any comments

**Given** I view a freshly submitted proposal (no decisions yet)
**When** I look at the audit trail
**Then** I see a single entry: "Submitted by {name} on {date}"

**Dev Notes:**
- Use a dedicated `proposalEvents` table (NOT a JSON column): `proposalId`, `eventType`, `actorId`, `timestamp`, `comment`
- Event types: "submitted", "changes_requested", "resubmitted", "approved", "rejected"
- Endpoint: included in `GET /api/proposals/:id` response as `events` array
- Drizzle schema: define `proposalEvents` table in `shared/schema.ts`
- `data-testid="audit-event-{index}"` on each audit entry
- Test: verify audit trail updates correctly after each action type (approve, reject, request changes)

---

### Story 6.4: Proposer Revision Flow [Size: M]

As a proposer who received change feedback from a reviewer,
I want to see the feedback, revise my proposal, and resubmit it,
So that I can address the reviewer's concerns without starting a new proposal from scratch.

**Acceptance Criteria:**

**Given** I am a proposer and my proposal has status "Changes Requested"
**When** I view my proposals (e.g., "My Proposals" section or notification)
**Then** I see the proposal marked as "Changes Requested" with the reviewer's feedback visible

**Given** I open my proposal that has changes requested
**When** the page loads
**Then** I see the reviewer's feedback prominently displayed at the top
**And** below it, I see my proposal form pre-filled with my previous values
**And** I can edit any field

**Given** I revise my proposal fields
**When** I click "Resubmit"
**Then** the proposal status changes back to "Pending"
**And** an audit event is recorded: "Resubmitted by {name}"
**And** I see a success toast: "Your revised proposal has been resubmitted for review"
**And** the proposal returns to the review queue for approvers

**Given** I try to resubmit without making any changes
**When** I click "Resubmit"
**Then** I see a validation message: "Please address the feedback before resubmitting"

**Given** I want to abandon my proposal after receiving feedback
**When** I click "Withdraw Proposal"
**Then** I see a confirmation dialog: "Withdraw this proposal? This cannot be undone."
**And** confirming changes the status to "Withdrawn"
**And** an audit event is recorded

**Dev Notes:**
- Reuses ProposalForm component in "revision" mode — pre-filled with previous values, feedback banner at top
- Endpoint: `POST /api/proposals/:id/resubmit` with updated proposal body
- Withdraw: `POST /api/proposals/:id/withdraw`
- "My Proposals" could be a page or section — at minimum, the proposer needs a way to find their proposals (consider `GET /api/proposals?submitterId={userId}`)
- `data-testid` on: feedback banner, resubmit button, withdraw button, confirmation dialog

---

**Epic 6 complete: 4 stories (1 Large, 2 Medium, 1 Small). All FRs covered: FR7, FR8, FR19, FR20, FR21, FR22, FR23.**

---

## Epic 7: Administration & Governance — Stories

### Story 7.1: Category Management [Size: M]

As an admin,
I want to create, edit, reorder, and delete categories with display colors,
So that the lexicon stays organized as the vocabulary grows.

**Acceptance Criteria:**

**Given** I am an admin on the category management page
**When** the page loads
**Then** I see a list of all categories in their current display order
**And** each category shows: name, color swatch, term count, and sort position

**Given** I click "Add Category"
**When** a form appears
**Then** I can enter a name, select a color, and set the sort position
**And** clicking "Save" creates the category and it appears in the list

**Given** I click "Edit" on a category
**When** the edit form appears
**Then** all current values are pre-filled
**And** I can change the name, color, or sort position
**And** saving updates the category across all terms that use it

**Given** I want to reorder categories
**When** I click the up or down arrow buttons next to a category
**Then** the category swaps position with its neighbor
**And** the display order updates and is reflected on the browse page sidebar

**Given** I click "Delete" on a category that has terms assigned
**When** the confirmation dialog appears
**Then** it warns: "This category has {N} terms. Reassign them before deleting."
**And** Enter does NOT confirm (AR15)
**And** deletion is blocked until terms are reassigned

**Given** I click "Delete" on a category with no terms
**When** I confirm the deletion
**Then** the category is removed

**Dev Notes:**
- Endpoint: CRUD at `GET/POST/PUT/DELETE /api/categories`
- Sort order: integer field, use up/down arrow buttons for reorder (not drag-and-drop — simpler, fully accessible, sufficient for admin use)
- Color: hex picker or preset palette
- Page title: "Manage Categories — Katalyst Lexicon"
- Test: verify deleting a category with terms is blocked
- `data-testid` on: category list, add button, each category row, edit/delete buttons, color picker, up/down reorder buttons

---

### Story 7.2: User Management [Size: M]

As an admin,
I want to view all users and change their roles,
So that the right people have the right permissions to contribute and review.

**Acceptance Criteria:**

**Given** I am an admin on the user management page
**When** the page loads
**Then** I see a table of all users showing: name, email, role (Member/Approver/Admin), and join date
**And** users are auto-provisioned on first Google sign-in with default role "Member"

**Given** a new employee signs in with their @katgroupinc.com Google account for the first time
**When** they complete the sign-in flow
**Then** a user record is created automatically with role "Member"
**And** they can immediately access the lexicon and propose terms

**Given** a person attempts to sign in with a non-@katgroupinc.com Google account
**When** they complete the Google sign-in flow
**Then** they are rejected with a message: "Access is restricted to KAT Group employees (@katgroupinc.com)"
**And** no user record is created

**Given** I want to change a user's role
**When** I click the role dropdown next to their name
**Then** I can select a new role (Member, Approver, Admin)
**And** the change takes effect immediately
**And** I see a success toast confirming the role change

**Given** I try to remove the last admin
**When** I attempt to change the only admin's role to Member or Approver
**Then** I see an error: "Cannot remove the last admin — at least one admin is required"

**Given** I am not an admin
**When** I try to access user management
**Then** I see a "Permission denied" message and the page is not accessible

**Dev Notes:**
- **Auth: Replit Auth (OpenID Connect)** with Google sign-in. Domain restricted to @katgroupinc.com.
- Users are auto-provisioned on first sign-in — no manual "Create User" flow needed. Admins only manage roles.
- Domain check: after OIDC callback, validate `email` claim ends with `@katgroupinc.com`. Reject non-matching emails before creating a user record.
- The first user to sign in should be auto-assigned "Admin" role (bootstrap problem). Subsequent users default to "Member".
- Endpoint: `GET /api/users`, `PUT /api/users/:id/role`
- Role enforcement: server-side middleware checks role before allowing access
- Test: verify last-admin protection edge case, verify domain restriction rejects non-@katgroupinc.com emails
- Page title: "Manage Users — Katalyst Lexicon"
- `data-testid` on: user table, each user row, role dropdown, permission denied message

---

### Story 7.3: Principles Authoring (Admin) [Size: M]

As an admin,
I want to create, edit, and archive organizational principles and link them to terms,
So that the team can reference the thinking behind our vocabulary.

**Acceptance Criteria:**

**Given** I am an admin on the principles management page
**When** I click "Create Principle"
**Then** I see a form with fields: Title, Summary, Body (markdown editor), Status (Draft/Published), Visibility (Internal/Client-Safe/Public), and Tags

**Given** I am editing a principle's body
**When** I type markdown syntax
**Then** I can preview the rendered output before saving

**Given** I save a new or edited principle
**When** the save succeeds
**Then** I see a success toast and the principle appears in the principles list

**Given** I want to link a principle to terms
**When** I edit a principle
**Then** I see a "Related Terms" section with a searchable term input
**And** as I type a term name, a dropdown shows matching terms from the search API
**And** I can click a result to add it as a linked term
**And** linked terms appear as removable chips below the input (like an email autocomplete field)
**And** I can click the "x" on a chip to remove a link

**Given** I want to archive a principle
**When** I click "Archive"
**Then** I see a confirmation dialog
**And** confirming changes the status to "Archived"
**And** the principle remains viewable but displays the archived banner (from Story 4.2)

**Dev Notes:**
- Reuses the principle form pattern; admin-only access
- Markdown preview: toggle between edit and preview modes
- Term linker: type-to-search dropdown using `GET /api/terms/search?q=`, selected terms shown as removable chips
- Manage links via `POST/DELETE /api/principles/:id/terms/:termId`
- Endpoint: `POST/PUT /api/principles`, `PUT /api/principles/:id/archive`
- `data-testid` on: create button, form fields, markdown preview toggle, term search input, term chips, remove-chip buttons, archive button

---

### Story 7.4: System Settings and Governance Controls [Size: M]

As an admin,
I want to configure system behavior through settings toggles for governance, notifications, and visibility,
So that I can tailor the lexicon's rules to our team's needs.

**Acceptance Criteria:**

**Given** I am an admin on the settings page
**When** the page loads
**Then** I see settings organized into three sections: Governance, Notifications, and Visibility

**Given** I view the Governance section
**When** I see the toggle controls
**Then** I can toggle: "Require approver signoff for new terms", "Require change notes on edits", "Allow self-approval"
**And** each toggle shows its current state (on/off)

**Given** I view the Notifications section
**When** I see the toggle controls
**Then** I can toggle: "Weekly digest", "New proposal alerts", "Changes requested alerts"
**And** a note below the section reads: "Notification delivery is coming soon — these settings will take effect when notifications are enabled"

**Given** I view the Visibility section
**When** I see the toggle controls
**Then** I can toggle: "Enable client portal", "Enable public glossary"

**Given** I change a setting
**When** I toggle it
**Then** the change saves automatically (no separate save button needed)
**And** I see a brief success toast confirming the change

**Given** I am not an admin
**When** I try to access the settings page
**Then** I see a "Permission denied" message

**Dev Notes:**
- Endpoint: `GET /api/settings`, `PUT /api/settings/:key` with `{ value }` body
- Settings stored as key-value pairs in settings table
- Auto-save on toggle change (debounced if needed)
- Notification settings are configuration only — notification delivery (email, in-app) is a future feature. Toggles work and values persist, but nothing sends yet. The "coming soon" note sets honest expectations.
- Page title: "Settings — Katalyst Lexicon"
- `data-testid` on: each settings section, each toggle, coming-soon note, permission denied message

---

### Story 7.5: Role-Based Access Enforcement [Size: M]

As a system,
I want to enforce role-based permissions on all write operations,
So that only authorized users can propose, review, and administer the lexicon.

**Acceptance Criteria:**

**Given** an unauthenticated user
**When** they attempt any write operation (propose, edit, approve, admin action)
**Then** the API returns 401 Unauthorized
**And** the UI shows a "Please sign in" message

**Given** a user with role "Member"
**When** they attempt to access admin pages (categories, users, settings, principles authoring)
**Then** the API returns 403 Forbidden
**And** the UI hides admin navigation items and shows "Permission denied" if accessed directly

**Given** a user with role "Member"
**When** they attempt to access the review queue or approve/reject proposals
**Then** the API returns 403 Forbidden

**Given** a user with role "Approver"
**When** they attempt admin actions (manage users, categories, settings)
**Then** the API returns 403 Forbidden

**Given** any user (authenticated or not)
**When** they access read-only pages (home, search, browse, term detail, principles list/detail)
**Then** access is allowed without authentication (FR34 — public read)

**Given** the navigation renders
**When** a user is logged in
**Then** navigation items are filtered by role: Members see Propose, Approvers see Propose + Review, Admins see Propose + Review + Admin

**Dev Notes:**
- **Auth: Replit Auth integration** provides `isAuthenticated` middleware and `useAuth()` hook. Auth routes: `/api/login`, `/api/logout`, `/api/auth/user`.
- Server middleware: `isAuthenticated` (from Replit Auth — checks session), `requireRole(role)` (custom — checks user role from database)
- Domain restriction: validate `email` claim ends with `@katgroupinc.com` during OIDC callback. Reject non-matching domains.
- Create a shared permissions utility (`shared/permissions.ts`) used by both server middleware and client navigation — single source of truth for the role matrix. Don't duplicate permission logic in two places.
- Permissions matrix: Read (all), Propose (Member+), Review (Approver+), Admin (Admin only)
- Replace all hardcoded "Current User" / "Current Approver" strings with real user identity from `req.user.claims`
- FR33, FR34, FR44 all addressed here
- Test priority: e2e suite should test the full permission matrix (4 roles × key operations) — flag for Epic 8 test suite
- `data-testid` on: permission-denied message, role-filtered navigation items, login/logout buttons

---

**Epic 7 complete: 5 stories (5 Medium). All FRs covered: FR26, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR38, FR39, FR40, FR41, FR44.**

---

## Epic 8: Quality & Testing — Stories

### Story 8.1: Dark Mode and Theme System [Size: M]

As a user who prefers dark mode,
I want the application to respect my system theme preference and provide a manual toggle,
So that I can use the lexicon comfortably in low-light environments.

**Acceptance Criteria:**

**Given** my operating system is set to dark mode
**When** I visit the application for the first time
**Then** the application renders in dark mode automatically

**Given** I am using the application
**When** I look for the theme toggle
**Then** I find it in the top-right area of the header (desktop) or accessible from the mobile header/menu
**And** it shows a Sun icon (in dark mode) or Moon icon (in light mode)

**Given** I click the theme toggle
**When** the theme switches
**Then** all pages, components, and text update to the new theme
**And** the transition is smooth (or instant if `prefers-reduced-motion: reduce` is enabled)
**And** my preference is saved and persists across sessions (localStorage)

**Given** I am in dark mode
**When** I view status badges, cards, forms, toasts, dialogs, and all UI components
**Then** all components maintain WCAG AA contrast ratios (4.5:1 for normal text, 3:1 for large text)
**And** category colors remain distinguishable
**And** status badge colors remain meaningful and differentiable

**Given** I am in dark mode viewing a principle with markdown content
**When** the body includes code blocks, blockquotes, links, or headings
**Then** all markdown-rendered elements have proper dark mode styling and remain legible

**Dev Notes:**
- Define semantic color tokens as CSS custom properties (`--color-surface`, `--color-text-primary`, `--color-text-secondary`, `--color-accent`, `--color-border`, etc.) that swap between light and dark themes. Do NOT rely solely on per-component `dark:` overrides — use token-based theming for consistency and maintainability.
- Theme toggle: Sun/Moon icon button in header top-right, uses `class="dark"` on `<html>` element
- Persist preference in localStorage, default to `prefers-color-scheme` media query
- Audit all components for dark mode: cards, badges, forms, toasts, dialogs, empty states, markdown content (principle bodies — code blocks, blockquotes, links, headings)
- `data-testid` on: theme toggle button

---

### Story 8.2: Skip Link, Page Titles, and Reduced Motion [Size: S]

As a user relying on assistive technology or keyboard navigation,
I want skip navigation, meaningful page titles, and motion-safe animations,
So that I can navigate efficiently and comfortably.

**Acceptance Criteria:**

**Given** I am using keyboard navigation
**When** I press Tab as the first action on any page
**Then** a "Skip to main content" link becomes visible as the first focusable element
**And** pressing Enter on it moves focus to the main content area, bypassing the header and navigation

**Given** I navigate to any page in the application
**When** the page loads
**Then** the browser tab title updates to: "{Page Name} — Katalyst Lexicon"
**And** examples: "Browse — Katalyst Lexicon", "Scope — Katalyst Lexicon", "Review Queue — Katalyst Lexicon"

**Given** I have `prefers-reduced-motion: reduce` enabled in my OS settings
**When** I use the application
**Then** all animations, transitions, and motion effects are disabled or replaced with instant state changes

**Dev Notes:**
- Skip link: visually hidden by default, visible on `:focus`, placed as first child of `<body>` or Layout component (AR13)
- Page titles: use a `useDocumentTitle` hook or set `document.title` in each page component (AR14)
- Reduced motion: Tailwind's `motion-safe:` and `motion-reduce:` prefixes, or CSS `@media (prefers-reduced-motion: reduce)` (AR16)
- `data-testid` on: skip-link

---

### Story 8.3: Playwright E2E Test Suite [Size: L]

As a development team,
I want a comprehensive end-to-end test suite that validates critical user journeys at three viewport sizes,
So that we catch regressions before they reach users and maintain confidence in the application quality.

**Acceptance Criteria:**

**Given** the test suite is configured
**When** I run the Playwright tests
**Then** they execute against three viewport sizes: 375px (mobile), 768px (tablet), 1280px (desktop)

**Given** the test suite runs
**When** critical user journeys are tested
**Then** the following journeys pass:
- **Lookup Job:** Search for a term → view results → click into term detail → read definition and expand Tier 2 sections
- **Browse Job:** Navigate to browse → filter by status → click into a category → view term
- **Propose Job:** Navigate to propose → fill required fields → see duplicate warning → submit → verify success
- **Review Job:** Navigate to review queue → open proposal → approve → verify term created
- **Principles Job:** View principles list → click into detail → verify linked terms

**Given** the test suite runs on mobile (375px)
**When** mobile-specific interactions are tested
**Then** the Spotlight search overlay opens, results display, and navigation works correctly

**Given** critical journeys are tested
**When** the suite runs in dark mode
**Then** the same journey tests pass with the theme toggled to dark mode (verifying no contrast or layout regressions)

**Given** all `data-testid` attributes are in place
**When** tests select elements
**Then** they use `data-testid` selectors exclusively (no CSS class or tag selectors)

**Given** the permission matrix is tested
**When** the suite runs role-based access tests
**Then** it verifies: unauthenticated can read, Member can propose but not review/admin, Approver can review but not admin, Admin has full access

**Dev Notes:**
- Viewport sizes per UX17: 375px, 768px, 1280px
- Test against running dev server
- Use `data-testid` for all element selection
- Each test creates its own test data with unique names (e.g., `Test Term ${nanoid()}`) rather than relying on pre-existing data. Tests should be independent and runnable in any order.
- Run critical journey tests in both light and dark mode to catch theme-related regressions
- Permission matrix tests: 4 roles × key operations
- Priority order if time is limited: (1) Lookup Job, (2) Permission matrix, (3) Propose + Review flow, (4) Browse, (5) Principles

---

### Story 8.4: WCAG 2.1 AA Compliance Audit [Size: M]

As a product team,
I want a formal accessibility audit of the completed application,
So that we can confirm WCAG 2.1 AA compliance and fix any gaps before launch.

**Acceptance Criteria:**

**Given** the application is feature-complete
**When** an accessibility audit is performed
**Then** all pages are tested for: color contrast (4.5:1 normal, 3:1 large text), keyboard navigability, screen reader compatibility, focus management, and ARIA attribute correctness

**Given** the audit identifies issues
**When** results are documented
**Then** each issue includes: severity (Critical/Major/Minor), affected component, WCAG criterion violated, and recommended fix

**Given** the audit is complete
**When** results are reviewed
**Then** all Critical and Major issues are resolved before launch
**And** Minor issues are documented as follow-up tasks

**Given** the audit covers all key flows
**When** the following are tested
**Then** each passes: search (combobox pattern), term detail (progressive disclosure), browse (filters + sidebar), proposal form (validation + error states), review actions (confirmation dialogs), navigation (skip link + role-filtered items)

**Given** the audit includes a data-testid coverage check
**When** all interactive elements and key display elements are examined
**Then** any elements missing `data-testid` attributes are documented as issues (NFR6)

**Dev Notes:**
- Use axe-core (via `@axe-core/playwright` or browser extension) for automated checks
- Manual testing: keyboard-only navigation through all critical journeys
- Screen reader testing: at minimum, VoiceOver (macOS) or NVDA (Windows)
- Include data-testid coverage audit — verify all interactive and meaningful display elements have testids
- Document results in `_bmad-output/implementation-artifacts/accessibility-audit.md`
- Focus areas: AR12-AR17 compliance across all implemented components
- This is a verify + fix story, not a greenfield build — produces a report, then fixes for Critical/Major issues

---

**Epic 8 complete: 4 stories (1 Large, 2 Medium, 1 Small). All cross-cutting quality concerns covered.**

---

## Summary

| Epic | Stories | Sizes | FRs Covered |
|------|---------|-------|-------------|
| Epic 1: Search & Discovery | 4 | 1L, 1M, 1S, 1S | FR1, FR11, FR12, FR13 |
| Epic 2: Term Detail Experience | 2 | 1L, 1M | FR2, FR9, FR10 |
| Epic 3: Browse & Discover | 2 | 1L, 1M | FR3, FR4, FR5, FR14, FR37, FR42, FR43 |
| Epic 4: Principles & Knowledge | 3 | 2M, 1S | FR24, FR25, FR27, FR28, FR29 |
| Epic 5: Propose & Contribute | 2 | 1L, 1M | FR6, FR15, FR16, FR17, FR18 |
| Epic 6: Review & Approve | 4 | 1L, 2M, 1S | FR7, FR8, FR19, FR20, FR21, FR22, FR23 |
| Epic 7: Administration | 5 | 5M | FR26, FR30-FR36, FR38-FR41, FR44 |
| Epic 8: Quality & Testing | 4 | 1L, 2M, 1S | Cross-cutting (ARs, UX, NFRs) |
| **Total** | **26 stories** | **5L, 14M, 7S** | **All 44 FRs** |
