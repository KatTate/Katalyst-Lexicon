# MVP Scope

*Extracted from: `attached_assets/Pasted--Design-Document-Katalyst-Lexicon...txt` (Section 16)*

## Core Problem We're Solving

Katalyst needs a canonical, organization-wide vocabulary that reduces ambiguity, accelerates decision-making, and enforces consistent language across strategy, planning, delivery, and culture.

## Target User

All Katalyst team members, with primary focus on:
- People in meetings who need quick term lookup
- Content creators who need to use correct terminology
- Approvers who govern the vocabulary

## The Core Loop

```
Search/Browse → View Term Details → (Optionally) Propose Edit → Review → Publish
```

---

## MVP Features (Version 1)

### Feature 1: Term CRUD with Workflow
**User Stories:** US-003, US-004
**Must include:**
- Create term (draft)
- Edit term (with versioning)
- Publish term (becomes canonical)
- Deprecate term (requires replacement guidance)
- Proposal → Review → Approval workflow

**Explicitly NOT including:**
- AI-assisted drafting
- Collision detection

---

### Feature 2: Search and Filters
**User Stories:** US-001, US-005
**Must include:**
- Full-text search (term name + definition + examples)
- Filters: category, status, visibility
- Sort: alphabetical, recent updates
- Synonym resolution (search for synonym, find canonical)

**Explicitly NOT including:**
- "Did you mean" suggestions
- Relationship graph view

---

### Feature 3: Canonical vs Deprecated Handling
**User Stories:** US-002
**Must include:**
- Clear status badges
- Deprecated terms show replacement
- Synonym searches resolve to canonical term

**Explicitly NOT including:**
- Automatic redirects from deprecated to replacement

---

### Feature 4: Versioning and Audit Log
**User Stories:** US-006
**Must include:**
- Every change produces a new version
- Audit log: who changed what, when, why
- Required "change note" for edits

**Explicitly NOT including:**
- Version diff view (field-by-field comparison)
- Restore previous version

---

### Feature 5: Role-Based Access
**User Stories:** US-009
**Must include:**
- Three roles: Member, Approver, Admin
- Member: browse and propose
- Approver: review and publish
- Admin: full system access, settings management

**Simplified from original:**
- Original had 5 roles (Viewer, Contributor, Editor, Approver, Admin)
- Consolidated to 3 roles for simplicity

---

### Feature 6: Client-Safe Visibility
**User Stories:** US-007
**Must include:**
- Visibility flags (Internal/Client-safe/Public)
- Terms filtered based on visibility setting

**Explicitly NOT including:**
- Separate public-facing site/view

---

## Not In MVP

### Version 2 (After Launch)
| Feature | Why It's Waiting |
|---------|------------------|
| Relationship graph | Need user feedback on whether visual representation is valuable |
| Version diff view | Core audit log is sufficient for V1 |
| Weekly digest emails | In-app is sufficient initially |
| Analytics dashboard | Need usage data first |

### Future / Someday
- Training quizzes and onboarding modules
- Slack bot integration
- AI drafting assistance
- CRM integration (Zoho)
- Google Drive template annotations

### Out of Scope
- Full knowledge base or SOP platform
- Replacing project management systems
- Public marketing glossary as primary objective

---

## MVP Success Criteria

- [ ] Anyone can find the approved term in under 30 seconds
- [ ] New terms go through governed approval process
- [ ] Deprecated terms clearly marked with replacement
- [ ] Three user roles functioning correctly
- [ ] Visibility controls working (Internal vs Client-safe)

---

## Implementation Sprints (from original doc)

1. **Sprint 0: Foundation** - Finalize taxonomy, define roles, seed initial terms
2. **Sprint 1: Core app** - Auth + RBAC, Term model, Term detail + browse
3. **Sprint 2: Workflow + versioning** - Proposals, Review queue, Audit log
4. **Sprint 3: Visibility** - Visibility flags, filtered views
5. **Sprint 4: Adoption** - Weekly digest, Analytics basics

---

*Created: 2026-01-10*
*Source: Original Design Document (Sections 16, 17)*
