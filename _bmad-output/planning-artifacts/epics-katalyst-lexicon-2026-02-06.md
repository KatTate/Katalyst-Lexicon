---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md
workflowType: 'epics'
date: 2026-02-06
author: User
status: complete
migratedFrom: existing-codebase
---

# Katalyst Lexicon - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Katalyst Lexicon, decomposing the requirements from the PRD and Architecture into implementable stories. Because this is a brownfield project with most MVP features already built, each story notes its current implementation status.

## Requirements Inventory

### Functional Requirements

- FR1: Any user can view a list of all terms in the system
- FR2: Any user can view the full detail of a term including definition, usage guidance, examples, synonyms, and metadata
- FR3: Any user can view terms filtered by category
- FR4: Any user can view terms filtered by status (Draft, In Review, Canonical, Deprecated)
- FR5: Any user can view terms filtered by visibility level
- FR6: Authorized users can create new terms with all structured fields
- FR7: Authorized users can edit existing terms with change notes
- FR8: The system records a versioned snapshot every time a term is modified
- FR9: Any user can view the version history of a term with change notes, author, and timestamps
- FR10: Deprecated terms display their replacement term (when relationship is modeled)
- FR11: Any user can search terms by keyword across name, definition, synonyms, and examples
- FR12: The system provides server-side search for performance with large vocabularies
- FR13: Search results display term name, category, status badge, and definition preview
- FR14: Any user can browse terms organized by category
- FR15: Members can propose a new term through a structured form
- FR16: Members can propose edits to an existing term
- FR17: The proposal form captures all term fields (name, category, definition, why exists, usage guidance, examples, synonyms)
- FR18: The system checks for potential duplicate terms before proposal submission
- FR19: Approvers can view a queue of pending proposals
- FR20: Approvers can approve a proposal, which automatically creates or updates the corresponding term
- FR21: Approvers can reject a proposal with a comment
- FR22: Approvers can request changes on a proposal with feedback
- FR23: The system maintains a full audit trail of all proposal decisions
- FR24: Any user can view a list of all organizational principles
- FR25: Any user can view the full detail of a principle including markdown body content
- FR26: Authorized users can create, edit, and archive principles
- FR27: Principles can be linked to related terms (bidirectional)
- FR28: Term detail pages display linked principles
- FR29: Principle detail pages display linked terms
- FR30: Admins can view all system users
- FR31: Admins can invite new users with a specified role
- FR32: Admins can change a user's role
- FR33: The system enforces role-based permissions for all write operations
- FR34: Public read access is available without authentication
- FR35: Admins can create, edit, and delete categories
- FR36: Categories have a display order and color for UI presentation
- FR37: The sidebar navigation displays categories as quick links
- FR38: Admins can configure system behavior through settings toggles
- FR39: Settings include governance controls (require approver signoff, require change notes, allow self-approval)
- FR40: Settings include notification controls (weekly digest, new proposal alerts, changes requested alerts)
- FR41: Settings include visibility controls (enable client portal, enable public glossary)
- FR42: Every term and principle has a visibility classification (Internal / Client-Safe / Public)
- FR43: The system can filter content by visibility level
- FR44: Authentication is required for all write operations (propose, edit, approve, admin)

### Non-Functional Requirements

- NFR1: Search results return within 500ms for vocabularies up to 1,000 terms
- NFR2: Page load time under 2 seconds on standard connections
- NFR3: Application remains responsive during concurrent multi-user access
- NFR4: Application is mobile-responsive for meeting lookup use case
- NFR5: Term lookup achievable in under 30 seconds from app open
- NFR6: All interactive elements have data-testid attributes for automated testing
- NFR7: Status badges use consistent, colorblind-friendly visual indicators
- NFR8: All write operations require authentication (when auth is wired)
- NFR9: Role-based permissions enforced server-side, not just client-side
- NFR10: Session management uses secure, httpOnly cookies
- NFR11: No secrets or credentials exposed in client-side code
- NFR12: All term modifications produce an immutable version history entry
- NFR13: Proposal approval atomically creates/updates the term and archives the proposal
- NFR14: Database transactions used for multi-table operations
- NFR15: UUID primary keys for all entities
- NFR16: TypeScript strict mode enforced across entire codebase
- NFR17: Schema defined once in shared/schema.ts, used by both client and server
- NFR18: All database operations go through the storage interface abstraction
- NFR19: API routes remain thin — business logic lives in storage layer
- NFR20: Works in modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
- NFR21: Responsive design supports desktop, tablet, and mobile viewports

### Additional Requirements

- AR1: Seed data must populate categories, terms, users, proposals, settings, and principles for development and demos
- AR2: Tailwind CSS v4 with `@theme inline` — no tailwind.config.js
- AR3: shadcn/ui (Radix) components live as project source files in `client/src/components/ui/`
- AR4: Wouter for client-side routing (not React Router)
- AR5: TanStack React Query for all server state management
- AR6: Legacy `mockData.ts` should be removed when no longer referenced

### FR Coverage Map

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | View all terms |
| FR2 | Epic 1 | View term detail |
| FR3 | Epic 1 | Filter by category |
| FR4 | Epic 1 | Filter by status |
| FR5 | Epic 1 | Filter by visibility |
| FR6 | Epic 2 | Create terms (via proposal) |
| FR7 | Epic 2 | Edit terms (via proposal) |
| FR8 | Epic 3 | Version snapshots |
| FR9 | Epic 3 | View version history |
| FR10 | Epic 3 | Deprecated term replacement |
| FR11 | Epic 1 | Search terms |
| FR12 | Epic 1 | Server-side search |
| FR13 | Epic 1 | Search result display |
| FR14 | Epic 1 | Browse by category |
| FR15 | Epic 2 | Propose new term |
| FR16 | Epic 2 | Propose edit |
| FR17 | Epic 2 | Proposal form fields |
| FR18 | Epic 2 | Duplicate detection |
| FR19 | Epic 2 | Review queue |
| FR20 | Epic 2 | Approve proposal |
| FR21 | Epic 2 | Reject proposal |
| FR22 | Epic 2 | Request changes |
| FR23 | Epic 2 | Audit trail |
| FR24 | Epic 4 | View principles list |
| FR25 | Epic 4 | View principle detail |
| FR26 | Epic 4 | Create/edit principles |
| FR27 | Epic 4 | Link principles to terms |
| FR28 | Epic 4 | Term detail shows principles |
| FR29 | Epic 4 | Principle detail shows terms |
| FR30 | Epic 5 | View users |
| FR31 | Epic 5 | Invite users |
| FR32 | Epic 5 | Change user roles |
| FR33 | Epic 6 | Enforce role-based permissions |
| FR34 | Epic 6 | Public read access |
| FR35 | Epic 5 | Category CRUD |
| FR36 | Epic 5 | Category display order & color |
| FR37 | Epic 1 | Sidebar category links |
| FR38 | Epic 5 | System settings |
| FR39 | Epic 5 | Governance settings |
| FR40 | Epic 5 | Notification settings |
| FR41 | Epic 5 | Visibility settings |
| FR42 | Epic 1 | Visibility classification |
| FR43 | Epic 1 | Filter by visibility |
| FR44 | Epic 6 | Auth required for writes |

## Epic List

### Epic 1: Search, Browse & Discover Terms
Users can find, browse, and explore the organization's terminology through search, category browsing, and filtering.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR11, FR12, FR13, FR14, FR37, FR42, FR43

### Epic 2: Propose & Review Terms
Members can propose new terms or edits, and Approvers can review, approve, reject, or request changes through a governed workflow.
**FRs covered:** FR6, FR7, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23

### Epic 3: Term Version History & Lifecycle
Users can view the complete history of how a term evolved, and the system automatically tracks all changes with snapshots.
**FRs covered:** FR8, FR9, FR10

### Epic 4: Organizational Principles
Users can browse principles, view full content, and navigate bidirectional links between principles and terms.
**FRs covered:** FR24, FR25, FR26, FR27, FR28, FR29

### Epic 5: Administration & Configuration
Admins can manage users, categories, and system settings to control governance behavior and platform configuration.
**FRs covered:** FR30, FR31, FR32, FR35, FR36, FR38, FR39, FR40, FR41

### Epic 6: Authentication & Access Control
The system enforces role-based permissions, requiring authentication for write operations while maintaining public read access.
**FRs covered:** FR33, FR34, FR44

---

## Epic 1: Search, Browse & Discover Terms

**Goal:** Users can find, browse, and explore the organization's terminology through search, category browsing, and filtering — the core read experience that all other epics build upon.

**Status:** Largely built. Search, browse, term detail, and category sidebar are implemented. Filtering refinements may need verification.

### Story 1.1: Home Page Search & Discovery

As a team member,
I want to search for terms from the home page,
So that I can quickly confirm correct terminology during meetings or content creation.

**Acceptance Criteria:**

**Given** the user navigates to the home page
**When** they type a search query of 2+ characters
**Then** the system returns matching terms searched across name, definition, synonyms, and examples
**And** results display term name, category, status badge, and definition preview
**And** clicking a result navigates to the term detail page

**Given** the user performs a search
**When** the server-side search endpoint processes the query
**Then** results return within 500ms for up to 1,000 terms (NFR1)

**Implementation Status:** Built — `Home.tsx` + `GET /api/terms/search?q=`

### Story 1.2: Browse Terms by Category

As a user,
I want to browse terms organized by category,
So that I can explore related terminology in a specific domain.

**Acceptance Criteria:**

**Given** the user navigates to the Browse page
**When** they select a category from the sidebar or category list
**Then** only terms belonging to that category are displayed
**And** the sidebar shows all categories as navigation links (FR37)
**And** categories are displayed in their configured sort order

**Given** the user is viewing a category
**When** they look at the term list
**Then** each term shows its name, status badge, and definition preview

**Implementation Status:** Built — `Browse.tsx` + `GET /api/terms/category/:category`

### Story 1.3: Term Detail View

As a user,
I want to view the complete details of a term,
So that I understand its definition, when to use it, examples, and related context.

**Acceptance Criteria:**

**Given** the user clicks on a term
**When** the term detail page loads
**Then** it displays: name, category, definition, why it exists, when to use, when not to use, good examples, bad examples, synonyms, status, visibility, owner, and version number
**And** the status is shown as a visual badge (Canonical, Draft, In Review, Deprecated)
**And** the visibility classification is displayed (Internal, Client-Safe, Public)

**Implementation Status:** Built — `TermDetail.tsx` + `GET /api/terms/:id`

### Story 1.4: Filter Terms by Status and Visibility

As a user,
I want to filter terms by status and visibility level,
So that I can find specifically canonical terms, internal-only terms, or deprecated terms.

**Acceptance Criteria:**

**Given** the user is on the Browse page
**When** they select a status filter (Draft, In Review, Canonical, Deprecated)
**Then** only terms with that status are shown

**Given** the user is on the Browse page
**When** they select a visibility filter (Internal, Client-Safe, Public)
**Then** only terms with that visibility level are shown

**Given** the user applies both category and status/visibility filters
**When** viewing the results
**Then** all filters are applied simultaneously (AND logic)

**Implementation Status:** Partially built — needs verification of filter UI in Browse.tsx

---

## Epic 2: Propose & Review Terms

**Goal:** Members can propose new terms or edits to existing terms, and Approvers can review proposals through a governed workflow with approve, reject, and request-changes actions.

**Status:** Built. Proposal form, review queue, and approval actions are implemented. Duplicate detection (FR18) needs verification.

### Story 2.1: Propose a New Term

As a Member,
I want to propose a new term with all relevant details,
So that Approvers have full context to evaluate it.

**Acceptance Criteria:**

**Given** the user navigates to the Propose Term page
**When** they fill out the form
**Then** the form includes: name, category (dropdown), definition, why it exists, used when, not used when, good examples (multi-entry), bad examples (multi-entry), synonyms (multi-entry), and changes summary
**And** category dropdown is populated from the categories table

**Given** the user submits a valid proposal
**When** the system processes it
**Then** a proposal record is created with type "new" and status "pending"
**And** the user sees a confirmation message

**Given** the user submits a proposal for a term name that already exists
**When** the system checks for duplicates (FR18)
**Then** the user is warned about potential duplicates before submission

**Implementation Status:** Built — `ProposeTerm.tsx` + `POST /api/proposals`. Duplicate detection needs verification.

### Story 2.2: Propose an Edit to an Existing Term

As a Member,
I want to propose changes to an existing term,
So that I can suggest improvements to definitions or usage guidance.

**Acceptance Criteria:**

**Given** the user is viewing a term detail page
**When** they click "Propose Edit"
**Then** the proposal form opens pre-populated with the current term data
**And** the proposal is linked to the existing term via termId
**And** the proposal type is set to "edit"

**Given** the user submits an edit proposal
**When** the system processes it
**Then** the changes summary explains what was modified and why

**Implementation Status:** Built — uses ProposeTerm.tsx with term context

### Story 2.3: Review Queue for Approvers

As an Approver,
I want to view a queue of pending proposals,
So that I can prioritize and process reviews efficiently.

**Acceptance Criteria:**

**Given** the Approver navigates to the Review Queue
**When** the page loads
**Then** all pending proposals are listed with: term name, proposal type (new/edit), submitted by, submitted date, and changes summary
**And** proposals are sorted by submission date (newest first)

**Given** the Approver clicks a proposal
**When** the detail view opens
**Then** all proposed fields are visible for review

**Implementation Status:** Built — `ReviewQueue.tsx` + `GET /api/proposals`

### Story 2.4: Approve, Reject, or Request Changes

As an Approver,
I want to approve, reject, or request changes on a proposal,
So that only vetted terms become canonical.

**Acceptance Criteria:**

**Given** the Approver is reviewing a proposal
**When** they click "Approve"
**Then** the proposal status changes to "approved"
**And** if type="new": a new term is created with status "Canonical" and a version history entry
**And** if type="edit": the existing term is updated with the proposed changes and a new version entry

**Given** the Approver is reviewing a proposal
**When** they click "Reject" and provide a comment
**Then** the proposal status changes to "rejected" and the comment is saved

**Given** the Approver is reviewing a proposal
**When** they click "Request Changes" and provide feedback
**Then** the proposal status changes to "changes_requested" and the comment is saved

**Implementation Status:** Built — `POST /api/proposals/:id/approve`, `/reject`, `/request-changes`

---

## Epic 3: Term Version History & Lifecycle

**Goal:** Users can view the complete history of how a term evolved, with automatic version tracking on every change.

**Status:** Built. Version snapshots are created automatically. History UI needs verification.

### Story 3.1: Automatic Version Snapshots

As the system,
I want to record a versioned snapshot every time a term is created or modified,
So that an immutable audit trail exists.

**Acceptance Criteria:**

**Given** a new term is created (directly or via proposal approval)
**When** the term is saved to the database
**Then** a TermVersion record is created with versionNumber=1, the complete term snapshot as JSON, the change note, and who made the change

**Given** an existing term is updated
**When** the update is saved
**Then** the term's version number increments
**And** a new TermVersion record is created with the new version number and updated snapshot
**And** the change note explains what changed

**Implementation Status:** Built — `storage.createTerm()` and `storage.updateTerm()` auto-create versions

### Story 3.2: View Term Version History

As a user,
I want to view the version history of a term,
So that I understand how its definition evolved over time.

**Acceptance Criteria:**

**Given** the user is on a term detail page
**When** they navigate to the version history section
**Then** they see a list of all versions ordered newest-first
**And** each version shows: version number, changed by, changed at (timestamp), and change note

**Given** the user clicks on a specific version
**When** the version detail loads
**Then** they can see the complete snapshot of the term at that point in time

**Implementation Status:** Built — `GET /api/terms/:id/versions`. UI display in TermDetail.tsx needs verification.

### Story 3.3: Deprecated Term Replacement Guidance

As a user,
I want deprecated terms to show their replacement,
So that I know which canonical term to use instead.

**Acceptance Criteria:**

**Given** a term has status "Deprecated"
**When** the user views its detail page
**Then** the term is visually marked as deprecated
**And** if a replacement term exists (via replaces relationship), it is linked

**Implementation Status:** Not built — requires `Term.replacesId` schema addition (documented architectural gap). Status badge shows "Deprecated" but no replacement linkage exists.

---

## Epic 4: Organizational Principles

**Goal:** Users can browse organizational principles, read full content, and navigate bidirectional links between principles and terms.

**Status:** Built. Principles CRUD, detail view, and term linking are implemented.

### Story 4.1: Browse Principles

As a user,
I want to view a list of all organizational principles,
So that I understand the reasoning behind our approach.

**Acceptance Criteria:**

**Given** the user navigates to the Principles page
**When** the page loads
**Then** all principles are listed in sort order
**And** each shows title, summary, status badge, and tags

**Implementation Status:** Built — `BrowsePrinciples.tsx` + `GET /api/principles`

### Story 4.2: Principle Detail with Markdown Content

As a user,
I want to view the full detail of a principle,
So that I can read the complete explanation and rationale.

**Acceptance Criteria:**

**Given** the user clicks on a principle
**When** the detail page loads
**Then** the full markdown body is rendered as formatted content
**And** the title, summary, status, visibility, owner, and tags are displayed

**Implementation Status:** Built — `PrincipleDetail.tsx` + `GET /api/principles/:id`

### Story 4.3: Bidirectional Principle-Term Linking

As a user,
I want to see which terms relate to a principle and vice versa,
So that I understand how vocabulary connects to organizational philosophy.

**Acceptance Criteria:**

**Given** the user is viewing a principle detail page
**When** the page loads
**Then** linked terms are displayed with their names and can be clicked to navigate (FR29)

**Given** the user is viewing a term detail page
**When** the page loads
**Then** linked principles are displayed with their titles and can be clicked to navigate (FR28)

**Given** an admin is managing a principle
**When** they link or unlink a term
**Then** the relationship is saved and reflected on both the principle and term detail pages

**Implementation Status:** Built — `POST/DELETE /api/principles/:id/terms` + `GET /api/terms/:id/principles`

---

## Epic 5: Administration & Configuration

**Goal:** Admins can manage users, categories, and system settings to control governance behavior and platform configuration.

**Status:** Built. User management, category management, and settings pages are implemented.

### Story 5.1: User Management

As an Admin,
I want to view, invite, and manage users with roles,
So that team members have appropriate access.

**Acceptance Criteria:**

**Given** the Admin navigates to user management
**When** the page loads
**Then** all users are listed with name, email, role, and status

**Given** the Admin creates a new user
**When** they provide name, email, and role
**Then** a user record is created with the specified role

**Given** the Admin changes a user's role
**When** they select a new role (Member, Approver, Admin)
**Then** the role is updated and the user's permissions change accordingly (FR32)

**Implementation Status:** Built — API routes exist (`/api/users`). Admin UI page needs verification (may be in Settings.tsx).

### Story 5.2: Category Management

As an Admin,
I want to create, edit, and delete categories,
So that terms are organized into meaningful domains.

**Acceptance Criteria:**

**Given** the Admin navigates to Manage Categories
**When** the page loads
**Then** all categories are listed in sort order with name, description, and color

**Given** the Admin creates a new category
**When** they provide name, description, and color
**Then** the category is created with the next available sort order

**Given** the Admin deletes a category
**When** they confirm the deletion
**Then** the category is removed (terms in that category are not deleted)

**Implementation Status:** Built — `ManageCategories.tsx` + `/api/categories`

### Story 5.3: System Settings Configuration

As an Admin,
I want to configure system behavior through toggles,
So that governance rules match our organization's needs.

**Acceptance Criteria:**

**Given** the Admin navigates to Settings
**When** the page loads
**Then** all settings are displayed as toggles grouped by category:
- Governance: require_approver_signoff, require_change_note, allow_self_approval
- Notifications: weekly_digest, new_proposal_alerts, changes_requested_alerts
- Visibility: enable_client_portal, enable_public_glossary

**Given** the Admin toggles a setting
**When** they save
**Then** the setting value is persisted and takes effect

**Implementation Status:** Built — `Settings.tsx` + `POST /api/settings/batch`

---

## Epic 6: Authentication & Access Control

**Goal:** The system enforces role-based permissions, requiring authentication for write operations while maintaining public read access.

**Status:** Not built. Auth infrastructure (Passport.js) is installed but not wired. All routes are currently unprotected. Deferred to publish time.

### Story 6.1: Public Read Access

As any user,
I want to browse and search terms without logging in,
So that the lexicon is accessible to everyone in the organization.

**Acceptance Criteria:**

**Given** an unauthenticated user visits the application
**When** they access read endpoints (terms, categories, principles, search)
**Then** all content is returned without requiring authentication (FR34)

**Implementation Status:** Built by default — no auth middleware blocks reads.

### Story 6.2: Authentication for Write Operations

As the system,
I want to require authentication for all write operations,
So that changes are attributed to specific users and governed.

**Acceptance Criteria:**

**Given** an unauthenticated user attempts a write operation (POST, PATCH, DELETE)
**When** the API processes the request
**Then** a 401 Unauthorized response is returned

**Given** an authenticated user with sufficient role attempts a write operation
**When** the API processes the request
**Then** the operation proceeds normally

**Implementation Status:** Not built — requires Passport.js middleware wiring (FR44)

### Story 6.3: Role-Based Permission Enforcement

As the system,
I want to enforce role-based permissions server-side,
So that Members cannot approve proposals and only Admins can manage users.

**Acceptance Criteria:**

**Given** a Member attempts to approve a proposal
**When** the API processes the request
**Then** a 403 Forbidden response is returned

**Given** a Member attempts to manage users or settings
**When** the API processes the request
**Then** a 403 Forbidden response is returned

**Given** an Approver attempts to manage users or settings
**When** the API processes the request
**Then** a 403 Forbidden response is returned

**Implementation Status:** Not built — requires auth middleware + role checking (FR33, NFR9)

---

## Implementation Status Summary

| Epic | Stories | Built | Partial | Not Built |
|------|---------|-------|---------|-----------|
| Epic 1: Search, Browse & Discover | 4 | 3 | 1 (filters) | 0 |
| Epic 2: Propose & Review | 4 | 3 | 1 (duplicate detect) | 0 |
| Epic 3: Version History & Lifecycle | 3 | 2 | 0 | 1 (replacement link) |
| Epic 4: Principles | 3 | 3 | 0 | 0 |
| Epic 5: Administration | 3 | 2 | 1 (user mgmt UI) | 0 |
| Epic 6: Authentication | 3 | 1 | 0 | 2 |
| **Totals** | **20** | **14** | **3** | **3** |

---

*Generated: 2026-02-06*
*Source: PRD functional requirements mapped to existing codebase implementation*
*Next: QA testing round to verify "built" stories actually function correctly*
