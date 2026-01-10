# MVP Scope

*Source: Original design document + validation session 2026-01-10*

## Core Problem We're Solving

Katalyst needs a canonical, organization-wide vocabulary that reduces ambiguity, accelerates decision-making, and enforces consistent language across strategy, planning, delivery, and culture. This includes both individual terms and longer-form principles/philosophies.

## Target User

All Katalyst team members, with primary focus on:
- People in meetings who need quick term lookup
- Content creators who need to use correct terminology
- Approvers who govern the vocabulary
- New employees learning organizational language

## The Core Loop

```
Search/Browse → View Term/Principle → (Optionally) Propose Edit → Review → Publish
```

---

## MVP Features (What Must Be Complete)

### Feature 1: Term Management with Full Workflow
**User Stories:** US-003, US-004
**Must include:**
- Create term (draft)
- Edit term (with full version history - NOT just a counter)
- Publish term (becomes canonical)
- Deprecate term (with replacement guidance)
- Proposal → Review → Approval workflow

**Current Gaps:**
- ❌ Version history is only a counter - needs full snapshots
- ❌ Proposal form missing: examplesGood, examplesBad, synonyms

---

### Feature 2: Search and Browse
**User Stories:** US-001, US-005, US-012
**Must include:**
- Basic search (at minimum server-side text search)
- Browse by category
- Filters: category, status
- Sort: alphabetical, recent updates

**Current Gaps:**
- ❌ Search is client-side only - needs server-side implementation

---

### Feature 3: Principles
**User Stories:** US-007
**Must include:**
- CRUD for principles
- Markdown body content
- Status (Draft/Published/Archived)
- Visibility levels
- Link principles to related terms (bidirectional)

**Status:** ✅ Implemented

---

### Feature 4: Canonical vs Deprecated Handling
**User Stories:** US-002
**Must include:**
- Clear status badges
- Deprecated terms show replacement

**Current Gaps:**
- ⚠️ "Replaces" relationship not yet modeled

---

### Feature 5: Role-Based Access
**User Stories:** US-010
**Must include:**
- Three roles: Member, Approver, Admin
- Member: browse and propose
- Approver: review and publish
- Admin: full system access, settings management

**Status:** ✅ Implemented and confirmed

---

### Feature 6: Client-Safe Visibility
**User Stories:** US-009
**Must include:**
- Visibility flags (Internal/Client-safe/Public)
- Terms filtered based on visibility setting

**Status:** ✅ Implemented (flags exist, filtering works)

---

## Gaps To Address Before MVP Complete

| Gap | Priority | Effort |
|-----|----------|--------|
| Full version history (snapshots, not just counter) | High | Medium |
| Proposal form: add examples, synonyms fields | High | Low |
| Server-side search | High | Medium |
| Term relationships: replaces, parent/child | Medium | Medium |

---

## Not In MVP (Intentionally Deferred)

### Post-MVP / V2
| Feature | Why It's Waiting |
|---------|------------------|
| Google Workspace SSO | Can add at publish time |
| AI-assisted approval analysis | Needs core workflow stable first |
| AI-driven search | Enhancement after basic search works |
| Weekly digest emails | In-app is sufficient initially |
| Analytics dashboard | Need usage data first |

### Future / Someday
- Training quizzes and onboarding modules
- Slack bot integration
- CRM integration (Zoho)
- Google Drive template annotations

### Out of Scope
- Full knowledge base or SOP platform
- Replacing project management systems
- Public marketing glossary as primary objective

---

## Authentication Model (Confirmed)

| Access Level | Requires Auth |
|--------------|---------------|
| Read terms and principles | No (public) |
| Propose new term | Yes (Google SSO) |
| Edit existing term | Yes (Google SSO) |
| Approve/reject proposals | Yes (Google SSO) |
| Admin settings | Yes (Google SSO) |

*Note: Auth implementation deferred to publish time.*

---

## MVP Success Criteria

- [ ] Anyone can find the approved term quickly
- [ ] New terms go through governed approval process
- [ ] Full version history with audit trail
- [ ] Deprecated terms clearly marked with replacement
- [ ] Three user roles functioning correctly
- [ ] Visibility controls working (Internal vs Client-safe)
- [ ] Principles documented and linked to terms
- [ ] Basic server-side search functional

---

*Created: 2026-01-10*
*Validated: 2026-01-10 - Clarified gaps vs intentional deferrals, added auth model*
