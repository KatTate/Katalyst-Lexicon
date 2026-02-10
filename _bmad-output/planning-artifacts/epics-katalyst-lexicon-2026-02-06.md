---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/planning-artifacts/prd-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
workflowType: 'epics'
date: 2026-02-10
author: User
status: in-progress
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
FR31: Admins can invite new users with a specified role
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
| FR31 | Epic 7 | Invite new users with role |
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
