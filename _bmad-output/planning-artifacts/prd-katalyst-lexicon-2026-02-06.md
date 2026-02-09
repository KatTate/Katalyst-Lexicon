---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
inputDocuments:
  - docs/dev-assist/project/user-stories.md
  - docs/dev-assist/project/mvp-scope.md
  - docs/dev-assist/project/user-flows.md
  - docs/dev-assist/project/data-model.md
  - _bmad-output/planning-artifacts/product-brief-katalyst-lexicon-2026-02-06.md
workflowType: 'prd'
date: 2026-02-06
author: User
status: complete
migratedFrom: docs/dev-assist/project/
---

# Product Requirements Document — Katalyst Lexicon

**Author:** User
**Date:** 2026-02-06

---

## Executive Summary

Katalyst Lexicon is an internal web application that serves as the canonical source of truth for organization-wide vocabulary, terminology, and guiding principles. The organization loses an estimated 10-20 hours per week to terminology confusion across a 30-50 person team — previous tools (Notion, Confluence, Google Docs) failed due to lack of governance workflows and version tracking. Katalyst Lexicon provides a governed workflow for proposing, reviewing, and approving terms, ensuring only vetted language becomes canonical. The system supports three roles (Member, Approver, Admin), visibility controls (Internal/Client-Safe/Public), full version history, and bidirectional linking between terms and organizational principles. A centralized, browsable vocabulary also accelerates new hire onboarding by replacing ad-hoc colleague questions with self-service term lookups.

**Product Type:** Internal multi-user CRUD application with editorial workflow
**Domain:** Knowledge management / vocabulary governance
**Deployment:** Web application (responsive, mobile-friendly)

---

## Success Criteria

### User Success

| ID | Criterion | Measurement | Type |
|----|-----------|-------------|------|
| SC-1 | Term lookup in under 30 seconds | Time from app open to finding correct term | Instrumentable |
| SC-2 | Correct terminology usage increases | Reduction in terminology-related rework; baseline: current rework hours per sprint (survey at launch) | Observational |
| SC-3 | New hire ramp-up accelerates | Self-service term lookups vs. colleague questions; baseline: current onboarding survey scores | Observational |
| SC-4 | Proposals submitted with full context | % of proposals with all required fields completed | Instrumentable |

### Business Success

| ID | Criterion | Measurement | Type |
|----|-----------|-------------|------|
| SC-5 | Reduced miscommunication-driven rework | Fewer scope disputes and handoff issues; baseline: current sprint retro tallies | Observational |
| SC-6 | Consistent CRM language | Standardized terminology in Zoho and reporting; no direct app measurement — requires external CRM audit | Observational |
| SC-7 | Institutional knowledge preserved | Principles and term histories captured permanently; baseline: 0 terms at launch, target 100-250 within 6 months | Instrumentable |
| SC-8 | Team adoption | Active users as % of total team members (30-50 person team); baseline: 0% at launch | Instrumentable |

### Key Performance Indicators

- **Coverage:** % of commonly-used organizational terms documented
- **Governance health:** Average time from proposal to approval decision
- **Content quality:** % of terms with complete fields (definition, usage, examples)
- **Search effectiveness:** Users find what they need on first search

---

## Roles & Authentication

### Role Definitions

| Role | Permissions | Frequency |
|------|-------------|-----------|
| **Member** | Browse, search, propose new terms/edits | Daily |
| **Approver** | All Member + review, approve/reject proposals | Weekly |
| **Admin** | All Approver + user management, settings, categories | Occasional |

### Authentication Model

| Action | Auth Required |
|--------|---------------|
| Browse / search / view terms | No (public read) |
| Browse / view principles | No (public read) |
| Propose new term | Yes (Google Workspace SSO) |
| Propose edit to existing term | Yes (Google Workspace SSO) |
| Review / approve / reject proposals | Yes (Google Workspace SSO) |
| Admin settings & user management | Yes (Google Workspace SSO) |

**Implementation Note:** Auth infrastructure (Passport.js) is installed but not wired. All routes currently unprotected. SSO implementation deferred to publish time.

---

## User Stories

### Priority 1 — Must Have

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-001 | As a team member in a meeting, I want to look up a term quickly, so that I can confirm correct usage without disrupting the conversation. | Search returns results quickly; works on mobile; searches name, definition, examples |
| US-002 | As a content creator, I want to see which term is canonical vs. deprecated, so that I use correct, approved language. | Status badge visible (Canonical/Deprecated/Draft); deprecated terms show replacement guidance; synonym searches resolve to canonical term |
| US-003 | As a Member, I want to propose a new term with all relevant details, so that approvers have full context. | Form includes: name, category, definition, why exists, used when, not used when, examples (good/bad), synonyms; suggested duplicates shown; enters review workflow |
| US-004 | As an Approver, I want to review and approve proposed changes, so that only vetted terms become canonical. | Review queue shows pending proposals; can approve, reject, or request changes; full audit trail |
| US-005 | As a user, I want to browse terms by category, so that I can explore related terminology. | Category landing pages with term lists; filters by status/visibility; sort alphabetical/recent |
| US-006 | As a user, I want to see the complete history of changes to a term, so that I understand how definitions evolved. | Every change produces versioned snapshot; shows who, what, when, why; can view previous versions; change notes required |
| US-007 | As a team member, I want to read organizational principles, so that I understand reasoning behind our approach. | Principles list page; detail shows full markdown content; shows related terms; terms show related principles |
| US-008 | As a user, I want to see how terms relate to each other, so that I understand vocabulary structure. | MVP: deprecated terms link to replacement (FR10). V2: parent/child relationships and related-term surfacing |

### Priority 2 — Should Have

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-009 | As an Admin, I want to control which terms are visible to clients, so that internal-only terminology isn't exposed. | Visibility flags (Internal/Client-Safe/Public); filtering by visibility works |
| US-010 | As an Admin, I want to assign roles with different permissions, so that governance is enforced. | Three roles functioning; permissions enforced per role |
| US-011 | As the system, I want to allow public read but require auth for actions, so that the lexicon is accessible but governed. | Public read access; Google SSO for write actions |
| US-012 | As a user, I want to search terms efficiently, so that results return quickly even as the vocabulary grows. | Search returns results within 500ms for up to 1,000 terms; searches name, definition, synonyms, examples |

### Priority 3 — Nice to Have

| ID | Story | Acceptance Criteria |
|----|-------|-------------------|
| US-013 | As an Approver, I want AI recommendations during review, so I can identify related terms and conflicts. | AI analyzes proposed term; suggests related terms/principles; flags duplicates |
| US-014 | As a user, I want natural language search, so I can find terms by context. | NLP query input; AI interprets intent; surfaces terms and principles |
| US-015 | As a team member, I want a weekly digest of new/updated terms, so I stay current. | Automated digest delivery |

### Future Considerations

- Training quizzes and onboarding modules
- Slack bot for term lookup
- CRM integration (Zoho field tooltips, data validation)
- Google Drive template annotations
- Analytics dashboard (adoption, confusion hotspots)

---

## User Journeys

### Journey 1: Quick Term Lookup (Most Common)

**Actor:** Any user (no auth)
**Trigger:** In a meeting or creating content, needs to confirm terminology

```
Search bar → Type query → Scan results with status badges → Click term → Read definition + usage → Return to work
```

**Success:** Found the correct term in under 30 seconds with confidence in usage.

### Journey 2: Browse by Category

**Actor:** Any user (no auth)
**Trigger:** Exploring terminology in a specific domain

```
Category sidebar → Click category → Scan term list → Filter by status → Click term → View detail → Navigate to related terms
```

**Success:** Understands the vocabulary landscape for a domain.

### Journey 3: Read Principles

**Actor:** Any user (no auth)
**Trigger:** Wants to understand organizational philosophy

```
Nav → Principles → Scan list → Click principle → Read full markdown content → See related terms → Navigate to linked term
```

**Success:** Understands the principle and its relationship to vocabulary.

### Journey 4: Propose New Term

**Actor:** Member (auth required)
**Trigger:** Encounters a term that should be in the lexicon

```
"Propose Term" button → Fill form (name, category, definition, why, usage, examples, synonyms) → System checks duplicates → Submit → Confirmation → Track status
```

**Success:** Proposal submitted with full context, enters review queue.

### Journey 5: Review and Approve

**Actor:** Approver (auth required)
**Trigger:** Proposals pending review

```
Review Queue → Click proposal → Read full details → Check for conflicts → Decision (Approve/Reject/Request Changes) → Add comment → Submit
```

**Approval outcome:** Term created or updated automatically, version history entry created.
**Success:** Proposal resolved with clear outcome and audit trail.

### Journey 6: View Version History

**Actor:** Any user
**Trigger:** Understanding how a term evolved

```
Term detail → History tab → Version list (dates, authors, notes) → Click version → View snapshot
```

**Success:** Full audit trail visible with change reasoning.

### Journey 7: Admin User Management

**Actor:** Admin (auth required)
**Trigger:** New employee or role change needed

```
Settings → Team Management → User list → Invite/Edit → Set role → Save
```

**Success:** User has appropriate access level.

---

## Domain Model

### Entity: Term (Core)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| name | String | Yes | Canonical term name |
| category | String | Yes | Links to Category.name |
| definition | Text | Yes | Non-circular definition |
| whyExists | Text | Yes | Problem this term solves |
| usedWhen | Text | No | When to use this term |
| notUsedWhen | Text | No | When NOT to use this term |
| examplesGood | String[] | No | Correct usage examples |
| examplesBad | String[] | No | Incorrect usage examples |
| synonyms | String[] | No | Alternate names resolving to this term |
| status | Enum | Yes | Draft / In Review / Canonical / Deprecated |
| visibility | Enum | Yes | Internal / Client-Safe / Public |
| owner | String | No | Steward responsible |
| version | Integer | Yes | Current version number |
| updatedAt | Timestamp | Yes | Last modification |

**Implementation Status:** Built in `shared/schema.ts`

### Entity: TermVersion

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| termId | UUID | Yes | FK to Term |
| versionNumber | Integer | Yes | Sequential version |
| snapshotJson | JSON | Yes | Complete term state at this version |
| changeNote | Text | Yes | Why this change was made |
| changedBy | String | Yes | Who made the change |
| changedAt | Timestamp | Yes | When changed |

**Implementation Status:** Built in `shared/schema.ts`

### Entity: Category

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| name | String | Yes | Unique category name |
| description | Text | Yes | What this category covers |
| color | String | No | UI color class |
| sortOrder | Integer | Yes | Display order |

**Taxonomy (7 domains):** Organizational, Planning & Execution, Commercial, Financial, Cultural, Methodology, Systems

**Implementation Status:** Built

### Entity: Proposal

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| termId | UUID | No | FK to Term (null for new proposals) |
| termName | String | Yes | Proposed name |
| category | String | Yes | Proposed category |
| type | Enum | Yes | "new" or "edit" |
| status | Enum | Yes | pending / in_review / changes_requested / approved / rejected |
| submittedBy | String | Yes | Who proposed |
| assignedTo | String | No | Reviewer |
| changesSummary | Text | Yes | What changed and why |
| definition | Text | Yes | Proposed definition |
| whyExists | Text | Yes | Proposed reasoning |
| usedWhen | Text | No | Proposed usage guidance |
| notUsedWhen | Text | No | Proposed exclusion guidance |
| examplesGood | String[] | No | Good usage examples |
| examplesBad | String[] | No | Bad usage examples |
| synonyms | String[] | No | Proposed synonyms |
| reviewComment | Text | No | Reviewer feedback |
| submittedAt | Timestamp | Yes | When proposed |

**Implementation Status:** Built (schema includes examples/synonyms fields)

### Entity: Principle

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| title | String | Yes | Principle title |
| slug | String | Yes | URL-friendly identifier (unique) |
| summary | Text | Yes | Brief description |
| body | Text | Yes | Full content (markdown) |
| status | Enum | Yes | Draft / Published / Archived |
| visibility | Enum | Yes | Internal / Client-Safe / Public |
| owner | String | Yes | Maintainer |
| tags | String[] | No | Categorization tags |
| sortOrder | Integer | Yes | Display order |
| createdAt | Timestamp | Yes | Creation time |
| updatedAt | Timestamp | Yes | Last modification |

**Implementation Status:** Built

### Entity: PrincipleTermLink (Join Table)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| principleId | UUID | Yes | FK to Principle |
| termId | UUID | Yes | FK to Term |

**Implementation Status:** Built

### Entity: User

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| name | String | Yes | Display name |
| email | String | Yes | Login email (unique) |
| role | Enum | Yes | Member / Approver / Admin |
| status | String | Yes | active / invited / inactive |

**Implementation Status:** Built

### Entity: Setting

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | UUID | Auto | Primary key |
| key | String | Yes | Setting name (unique) |
| value | Boolean | Yes | Setting value |

**Current Settings:** require_approver_signoff, require_change_note, allow_self_approval, weekly_digest, new_proposal_alerts, changes_requested_alerts, enable_client_portal, enable_public_glossary

**Implementation Status:** Built

### Entity Relationships

```
Category 1 ──── * Term
                   │
                   ├── * Proposal
                   │
                   ├── * TermVersion
                   │
                   └── * PrincipleTermLink * ──── 1 Principle

User (roles control access to all entities)
Setting (system configuration, key-value)
```

### Domain Model Gaps (Not Yet Built)

| Gap | Description | Priority |
|-----|-------------|----------|
| Term.parentId | Self-referencing FK for term hierarchy | Medium |
| Term.replacesId | FK pointing to replacement term for deprecation | Medium |
| TermRelationship | Join table for general "related_to" relationships | Low |

---

## Functional Requirements

### Term Management

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

### Search & Discovery

- FR11: Any user can search terms by keyword across name, definition, synonyms, and examples
- FR12: Search returns results within 500ms for vocabularies up to 1,000 terms, searching across name, definition, synonyms, and examples fields
- FR13: Search results display term name, category, status badge, and definition preview
- FR14: Any user can browse terms organized by category

### Proposal Workflow

- FR15: Members can propose a new term through a structured form
- FR16: Members can propose edits to an existing term
- FR17: The proposal form captures all term fields (name, category, definition, why exists, usage guidance, examples, synonyms)
- FR18: Before proposal submission, the system checks if any existing term name exactly matches the proposed name (case-insensitive) and warns the user if a match is found
- FR19: Approvers can view a queue of pending proposals
- FR20: Approvers can approve a proposal, which automatically creates or updates the corresponding term
- FR21: Approvers can reject a proposal with a comment
- FR22: Approvers can request changes on a proposal with feedback
- FR23: The system maintains a full audit trail of all proposal decisions

### Principles

- FR24: Any user can view a list of all organizational principles
- FR25: Any user can view the full detail of a principle including markdown body content
- FR26: Authorized users can create, edit, and archive principles
- FR27: Principles can be linked to related terms (bidirectional)
- FR28: Term detail pages display linked principles
- FR29: Principle detail pages display linked terms

### User & Role Management

- FR30: Admins can view all system users
- FR31: Admins can invite new users with a specified role
- FR32: Admins can change a user's role
- FR33: The system enforces role-based permissions for all write operations
- FR34: Public read access is available without authentication

### Category Management

- FR35: Admins can create, edit, and delete categories
- FR36: Categories have a display order and color for UI presentation
- FR37: The sidebar navigation displays categories as quick links

### System Settings

- FR38: Admins can configure system behavior through settings toggles
- FR39: Settings include governance controls (require approver signoff, require change notes, allow self-approval)
- FR40: Settings include notification controls (weekly digest, new proposal alerts, changes requested alerts)
- FR41: Settings include visibility controls (enable client portal, enable public glossary)

### Visibility & Access Control

- FR42: Every term and principle has a visibility classification (Internal / Client-Safe / Public)
- FR43: The system can filter content by visibility level
- FR44: Authentication is required for all write operations (propose, edit, approve, admin)

---

## Non-Functional Requirements

### Performance

- NFR1: Search results return within 500ms for vocabularies up to 1,000 terms
- NFR2: Page load time under 2 seconds on standard connections
- NFR3: Application maintains sub-2-second page loads with up to 50 concurrent users

### Usability

- NFR4: Application is mobile-responsive for meeting lookup use case
- NFR5: Term lookup achievable in under 30 seconds from app open
- NFR6: All interactive elements have data-testid attributes for automated testing
- NFR7: Status badges use consistent, colorblind-friendly visual indicators

### Security

- NFR8: All write operations require authentication (when auth is wired)
- NFR9: Role-based permissions enforced regardless of client state — unauthorized actions rejected even if the UI is bypassed
- NFR10: Session tokens protected from client-side script access
- NFR11: No secrets or credentials exposed in client-side code

### Data Integrity

- NFR12: All term modifications produce an immutable version history entry
- NFR13: Proposal approval atomically creates/updates the term and archives the proposal
- NFR14: Database transactions used for multi-table operations
- NFR15: Globally unique identifiers for all entity primary keys

### Maintainability (Brownfield Implementation Constraints)

- NFR16: Strict type checking enforced across entire codebase
- NFR17: Data schema defined once in a shared module, used by both client and server
- NFR18: All database operations go through a single storage interface abstraction
- NFR19: API route handlers remain thin — business logic lives in the storage layer

### Compatibility

- NFR20: Works in modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions)
- NFR21: Responsive design supports desktop, tablet, and mobile viewports

---

## MVP Scope Summary

### In Scope (MVP)

| Feature | Status | Stories |
|---------|--------|---------|
| Term CRUD with structured fields | Built | US-001, US-002, US-003 |
| Proposal workflow (propose/review/approve) | Built | US-003, US-004 |
| Version history with snapshots | Built | US-006 |
| Search (client-side + server endpoint) | Built | US-001, US-012 |
| Browse by category with filters | Built | US-005 |
| Principles with markdown + term linking | Built | US-007 |
| Role-based access (3 roles) | Built (model) | US-010 |
| Visibility controls | Built | US-009 |
| Category management | Built | US-005 |
| System settings | Built | — |

### Out of Scope (Deferred)

| Feature | Rationale | Target |
|---------|-----------|--------|
| Google Workspace SSO | Core UX works without it | V1.1 (publish) |
| AI-assisted approval analysis | Needs stable core first | V2 |
| AI-driven natural language search | Enhancement after basic search | V2 |
| Weekly digest emails | In-app access sufficient | V2 |
| Analytics dashboard | Need usage data first | V2 |
| Term relationships (parent/child, replaces) | Medium priority gap | V1.1 |
| Training quizzes | Future enhancement | V3+ |
| Slack bot | Future enhancement | V3+ |
| CRM integration (Zoho) | Future enhancement | V3+ |

---

## Navigation Structure

### Site Map

```
Katalyst Lexicon
├── Home / Search & Discover [Public]
│   ├── Global search
│   ├── Recently updated terms
│   └── Propose CTA
│
├── Browse Categories [Public]
│   ├── All Terms
│   └── By Category (7 categories)
│
├── Term Detail [Public]
│   ├── Definition & Usage
│   ├── Examples (Good / Bad)
│   ├── Related Principles
│   ├── Version History
│   └── Propose Edit [Auth]
│
├── Principles [Public]
│   ├── Principles List
│   └── Principle Detail
│       ├── Full Markdown Content
│       └── Related Terms
│
├── Propose Term [Auth: Member+]
│   └── Proposal Form
│
├── Review Queue [Auth: Approver+]
│   └── Proposal Review
│
├── Manage Categories [Auth: Admin]
│
├── System Settings [Auth: Admin]
│
└── Design System [Internal Reference]
```

### Primary Navigation Items

| Destination | Section | Auth | Frequency |
|-------------|---------|------|-----------|
| Search & Discover | Knowledge Base | No | High |
| Browse Categories | Knowledge Base | No | High |
| Principles | Knowledge Base | No | Medium |
| Review Queue | Approver Tools | Yes | Medium |
| Manage Categories | Administration | Yes | Low |
| System Settings | Administration | Yes | Low |
| Design System | Administration | No | Low |

---

*Migrated to BMAD format: 2026-02-06*
*Source documents: user-stories.md, mvp-scope.md, user-flows.md, data-model.md (all created 2026-01-10)*
*Validated: 2026-01-10 — Added Principles, version history, relationships, auth model, AI features*
