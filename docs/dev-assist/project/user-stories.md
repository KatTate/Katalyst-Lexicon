# User Stories

*Source: Original design document + validation session 2026-01-10*

## Must Have (Priority 1)

### US-001: Quick Term Lookup
**As a** team member in a meeting,
**I want to** look up a term quickly,
**so that** I can confirm the correct usage without disrupting the conversation.

**Acceptance Criteria:**
- [ ] Search returns results quickly
- [ ] Works well on mobile during meetings
- [ ] Search across term name, definition, and examples

---

### US-002: Confirm Canonical vs Deprecated
**As a** content creator,
**I want to** see which term is canonical versus deprecated,
**so that** I use the correct, approved language.

**Acceptance Criteria:**
- [ ] Status badge clearly visible (Canonical/Deprecated/Draft)
- [ ] Deprecated terms show replacement guidance
- [ ] Synonym searches resolve to canonical term

---

### US-003: Propose New Term (Complete Form)
**As a** Member,
**I want to** propose a new term with all relevant details,
**so that** approvers have full context to make a decision.

**Acceptance Criteria:**
- [ ] Form includes: name, category, definition, why exists, used when, not used when
- [ ] Form includes: examples (good and bad usage)
- [ ] Form includes: synonyms
- [ ] Suggested duplicates shown before submission
- [ ] Proposal enters review workflow

**Note:** Current implementation is missing examples and synonyms fields on proposal form.

---

### US-004: Review and Approve Changes
**As an** Approver,
**I want to** review and approve proposed changes,
**so that** only vetted terms become canonical.

**Acceptance Criteria:**
- [ ] Review queue shows all pending proposals
- [ ] Can approve, reject, or request changes
- [ ] Full audit trail of review decisions

---

### US-005: Browse by Category
**As a** user,
**I want to** browse terms organized by domain/category,
**so that** I can explore related terminology.

**Acceptance Criteria:**
- [ ] Category landing pages with term lists
- [ ] Filters by status, visibility
- [ ] Sort by alphabetical, recent updates

---

### US-006: Full Version History
**As a** user,
**I want to** see the complete history of changes to a term,
**so that** I understand how the definition evolved and can audit changes.

**Acceptance Criteria:**
- [ ] Every change produces a versioned snapshot
- [ ] Version history shows who changed what, when, and why
- [ ] Can view previous versions
- [ ] Change notes required for edits

**Note:** Current implementation only has a version counter. Full history tracking needs to be built.

---

### US-007: Browse and Read Principles
**As a** team member,
**I want to** read organizational principles and philosophies,
**so that** I understand the reasoning behind our approach.

**Acceptance Criteria:**
- [ ] Principles page lists all principles
- [ ] Principle detail shows full content (markdown)
- [ ] Principles show related terms
- [ ] Terms show related principles

---

### US-008: Term Relationships
**As a** user,
**I want to** see how terms relate to each other,
**so that** I understand the vocabulary structure.

**Acceptance Criteria:**
- [ ] Terms can have parent/child relationships
- [ ] Deprecated terms link to their replacement
- [ ] Related terms are surfaced

**Note:** Current implementation only has synonyms. Full relationship model needs to be defined.

---

## Should Have (Priority 2)

### US-009: Client-Safe Visibility
**As an** admin,
**I want to** control which terms are visible to clients,
**so that** internal-only terminology isn't exposed.

**Acceptance Criteria:**
- [ ] Visibility flags (Internal/Client-safe/Public)
- [ ] Filtering by visibility works correctly

---

### US-010: Role-Based Access Control
**As an** admin,
**I want to** assign roles with different permissions,
**so that** governance is properly enforced.

**Acceptance Criteria:**
- [ ] Three roles: Member, Approver, Admin
- [ ] Member: browse and propose
- [ ] Approver: review and publish
- [ ] Admin: full system access, settings management

**Status:** Implemented and confirmed.

---

### US-011: Public Read / Auth for Actions
**As a** system,
**I want to** allow public read access but require authentication for actions,
**so that** the lexicon is accessible but governance is maintained.

**Acceptance Criteria:**
- [ ] Anyone can view terms and principles without login
- [ ] Google Workspace SSO for authentication
- [ ] Auth required for: propose, edit, approve actions

**Note:** Authentication not yet implemented. Deferred to publish.

---

### US-012: Basic Server-Side Search
**As a** user,
**I want to** search terms efficiently,
**so that** I get results quickly even with a large vocabulary.

**Acceptance Criteria:**
- [ ] Server-side search endpoint
- [ ] Searches term name, definition, synonyms, examples
- [ ] Returns relevant results quickly

**Note:** Current implementation is client-side only. Server search needed.

---

## Nice to Have (Priority 3)

### US-013: AI-Assisted Approval Analysis
**As an** Approver,
**I want to** see AI recommendations during review,
**so that** I can identify related terms and principles.

**Acceptance Criteria:**
- [ ] AI analyzes proposed term against existing lexicon
- [ ] Suggests related terms and principles
- [ ] Flags potential duplicates or conflicts

---

### US-014: AI-Driven Search
**As a** user,
**I want to** ask questions in natural language,
**so that** I can find relevant terms and principles based on context.

**Acceptance Criteria:**
- [ ] Natural language query input
- [ ] AI interprets intent and returns relevant results
- [ ] Surfaces both terms and principles

---

### US-015: Weekly Digest
**As a** team member,
**I want to** receive a digest of new and updated terms,
**so that** I stay current without checking manually.

---

## Future Considerations (Priority 4)

- Training quizzes and onboarding modules
- Slack bot for term lookup
- CRM integration (Zoho field tooltips, data validation)
- Google Drive template annotations
- Analytics dashboard (adoption, confusion hotspots)

---

## Role Definitions (Confirmed)

| Role | Permissions |
|------|-------------|
| **Member** | Browse, search, propose new terms, suggest edits |
| **Approver** | All Member permissions + review and publish |
| **Admin** | All permissions + user management, settings |

---

*Created: 2026-01-10*
*Validated: 2026-01-10 - Added Principles, version history, relationships, auth model, AI features*
