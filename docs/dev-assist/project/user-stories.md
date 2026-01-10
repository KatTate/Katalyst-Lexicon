# User Stories

*Extracted from: `attached_assets/Pasted--Design-Document-Katalyst-Lexicon...txt` (Section 4.2)*

## Must Have (Priority 1)

### US-001: Quick Term Lookup
**As a** team member in a meeting,
**I want to** look up a term quickly,
**so that** I can confirm the correct usage without disrupting the conversation.

**Acceptance Criteria:**
- [ ] Search returns results in under 300ms
- [ ] Works well on mobile during meetings
- [ ] Full-text search across term name, definition, and examples

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

### US-003: Propose New Term
**As a** contributor,
**I want to** propose a new term or edit,
**so that** I can suggest additions to the vocabulary.

**Acceptance Criteria:**
- [ ] Guided form with required fields
- [ ] Suggested duplicates shown before submission
- [ ] Proposal enters review workflow

---

### US-004: Review and Approve Changes
**As an** approver,
**I want to** review and approve proposed changes,
**so that** only vetted terms become canonical.

**Acceptance Criteria:**
- [ ] Review queue shows all pending proposals
- [ ] Diff view shows field-by-field changes
- [ ] Can approve, reject, or request changes
- [ ] Required "change note" for edits

---

### US-005: Browse by Category
**As a** user,
**I want to** browse terms organized by domain/category,
**so that** I can explore related terminology.

**Acceptance Criteria:**
- [ ] Category landing pages with term lists
- [ ] Filters by status, visibility, owner
- [ ] Sort by alphabetical, recent updates

---

### US-006: Version History
**As a** user,
**I want to** see the history of changes to a term,
**so that** I understand how the definition evolved.

**Acceptance Criteria:**
- [ ] Every change produces a new version
- [ ] Version diff view available
- [ ] Audit log shows who changed what, when, why

---

## Should Have (Priority 2)

### US-007: Client-Safe Subset
**As an** admin,
**I want to** control which terms are visible to clients,
**so that** internal-only terminology isn't exposed.

**Acceptance Criteria:**
- [ ] Visibility flags (Internal/Client-safe/Public)
- [ ] Optional public site view showing only appropriate terms
- [ ] Client-safe view cannot leak internal content

---

### US-008: Stable Term URLs
**As a** user,
**I want to** link directly to a term,
**so that** I can reference it in templates and other tools.

**Acceptance Criteria:**
- [ ] Each term has a stable URL
- [ ] Copy link functionality
- [ ] Copy "short definition" for embedding

---

### US-009: Role-Based Access Control
**As an** admin,
**I want to** assign roles with different permissions,
**so that** governance is properly enforced.

**Acceptance Criteria:**
- [ ] Member: browse and propose
- [ ] Approver: review and publish
- [ ] Admin: full system access

---

## Nice to Have (Priority 3)

### US-010: Relationship Graph
**As a** user,
**I want to** see how terms relate to each other visually,
**so that** I understand the vocabulary structure.

---

### US-011: Weekly Digest
**As a** team member,
**I want to** receive a digest of new and updated terms,
**so that** I stay current without checking manually.

---

### US-012: Analytics Dashboard
**As an** admin,
**I want to** see adoption metrics and confusion hotspots,
**so that** I can prioritize vocabulary improvements.

---

## Future Considerations (Priority 4)

- Training quizzes and onboarding modules
- Slack bot for term lookup
- AI assistance for drafting definitions
- AI collision detection for near-duplicate terms
- CRM integration (Zoho field tooltips, data validation)
- Google Drive template annotations

---

*Created: 2026-01-10*
*Source: Original Design Document (Sections 4.2, 6, 11)*
