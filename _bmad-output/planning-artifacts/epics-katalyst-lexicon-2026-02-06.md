---
stepsCompleted: [1]
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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
