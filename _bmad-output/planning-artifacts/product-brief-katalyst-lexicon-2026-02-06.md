---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - docs/dev-assist/project/problem-statement.md
  - docs/dev-assist/project/user-stories.md
  - docs/dev-assist/project/mvp-scope.md
date: 2026-02-06
author: User
status: complete
migratedFrom: docs/dev-assist/project/problem-statement.md
---

# Product Brief: Katalyst Lexicon

## Executive Summary

Katalyst Lexicon is an internal web application serving as the canonical source of truth for organization-wide vocabulary, terminology, and guiding principles. It replaces the current ad-hoc approach of asking colleagues, searching old documents, and guessing — with a governed, searchable knowledge base that any team member can access in under 30 seconds.

The application addresses a critical operational problem: overlapping and inconsistent language across departments (Strategy, Design, Production, Finance, Sales) leads to misalignment, rework, and confusion. Katalyst Lexicon provides a structured governance workflow — propose, review, approve — ensuring only vetted terminology becomes canonical, while preserving full audit trails and version history.

---

## Core Vision

### Problem Statement

Overlapping and inconsistent language across departments leads to misalignment, rework, and confusion. The reasoning behind terminology choices and organizational philosophy is scattered or undocumented. New employees don't understand the "why" behind organizational language, and principles exist in people's heads but aren't captured anywhere.

### Problem Impact

- **Project delays** from miscommunication about scope, deliverables, and "done" criteria
- **Confusing handoffs** and weak ownership between departments
- **Rework** caused by different departments using different terms for the same concept
- **CRM inconsistency** and reporting errors from non-standardized language
- **Training that does not scale** — new employees rely on tribal knowledge
- **Customer confusion** when external-facing language is inconsistent
- **Wasted meeting time** debating what words mean instead of making decisions

### Why Existing Solutions Fall Short

The current approach — asking colleagues, searching old documents, or guessing — fails because:

- **No single source of truth** — terminology definitions live across documents, Slack threads, and people's memories
- **No governance** — anyone can define a term however they see fit, with no approval process
- **No version history** — when terminology changes, there's no record of what changed, why, or when
- **No deprecation path** — outdated terms persist without clear replacement guidance
- **No principles documentation** — the reasoning behind language choices isn't captured
- **No visibility controls** — no way to distinguish internal-only terms from client-safe language

### Proposed Solution

A purpose-built internal web application with:

1. **Structured term definitions** — each term includes: definition, why it exists, when to use it, when NOT to use it, good/bad examples, synonyms, and status
2. **Governed approval workflow** — propose → review → approve/reject/request changes, with full audit trail
3. **Organizational principles** — longer-form philosophy documents linked bidirectionally to related terms
4. **Role-based access** — Member (browse + propose), Approver (review + publish), Admin (full system control)
5. **Visibility controls** — Internal, Client-Safe, and Public classification for every term
6. **Version history** — every change produces a versioned snapshot with change notes, who, when, and why
7. **Fast search and browse** — find the right term in under 30 seconds via search or category browsing

### Key Differentiators

- **Not a wiki or knowledge base** — purpose-built for vocabulary governance with structured fields, not freeform pages
- **Governance-first design** — every change goes through a defined workflow with approval authority
- **Bidirectional linking** — terms and principles reference each other, creating a connected knowledge graph
- **Visibility-aware** — built-in support for internal vs. client-safe vs. public terminology
- **Deprecation management** — first-class support for sunsetting terms with replacement guidance

---

## Target Users

### Primary Users

**1. Team Members in Meetings (Quick Lookup)**
- Role: Any Katalyst employee (Client Services, PMs, Design, Production, Finance, Sales)
- Context: In a live meeting or conversation, needs to confirm correct terminology quickly
- Pain: Currently guesses or asks a colleague, disrupting the conversation
- Need: Sub-30-second lookup on mobile or desktop
- Success moment: Confidently uses the correct term without pausing the meeting

**2. Content Creators (Correct Language)**
- Role: Anyone producing documents, proposals, SOWs, presentations
- Context: Writing client-facing or internal content, needs canonical terminology
- Pain: Uses inconsistent language, resulting in rework or confusion
- Need: Clear status visibility (Canonical vs. Deprecated), good/bad examples, visibility flags
- Success moment: Writes a proposal using consistent, approved language throughout

**3. Approvers (Vocabulary Governors)**
- Role: Leadership and senior team members with approval authority
- Context: Reviewing proposed terms or changes to ensure quality and consistency
- Pain: No structured review process — changes happen informally
- Need: Review queue with full context, ability to approve/reject/request changes
- Success moment: Efficiently reviews and publishes a well-defined term

**4. New Employees (Onboarding)**
- Role: Recent hires learning organizational language and philosophy
- Context: First weeks/months, encountering unfamiliar terminology daily
- Pain: Relies entirely on colleagues to explain terms, slowing ramp-up
- Need: Browsable, searchable vocabulary with "why" context and linked principles
- Success moment: Independently finds and understands a term without asking anyone

### Secondary Users

**5. Administrators**
- Role: System admins managing categories, settings, and user roles
- Context: Maintaining the structure and configuration of the lexicon
- Need: Category management, user role assignment, system settings

### User Journey

```
Discovery → Browse/Search → View Term Detail → (Optional: Propose/Edit) → Review → Publish
```

1. **Discovery:** Team member hears an unfamiliar term or needs to confirm usage
2. **Search/Browse:** Opens Katalyst Lexicon, searches by keyword or browses by category
3. **View Detail:** Reads the full term card — definition, usage guidance, examples, related principles
4. **Propose (if needed):** Submits a new term or suggests an edit through the proposal form
5. **Review:** Approver sees the proposal in their review queue, evaluates with full context
6. **Publish:** Approved term becomes canonical, previous version archived with full history

---

## Success Metrics

### User Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Term lookup time | < 30 seconds | Time from app open to finding correct term |
| Correct terminology usage | Reduction in terminology-related rework | Qualitative feedback from team leads |
| New hire ramp-up speed | Faster onboarding | Self-service term lookups vs. colleague questions |
| Proposal quality | Complete submissions | % of proposals with all required fields filled |

### Business Objectives

| Objective | Success Indicator |
|-----------|-------------------|
| Reduce miscommunication-driven rework | Fewer scope disputes and handoff issues |
| Faster onboarding | New hires productive with terminology sooner |
| Consistent CRM data | Standardized language in Zoho and reporting |
| Professional client communications | Consistent, approved language in all deliverables |
| Institutional knowledge preservation | Principles and term histories captured permanently |

### Key Performance Indicators

- **Adoption:** Active users as % of total Katalyst team members
- **Coverage:** % of commonly-used organizational terms documented in the lexicon
- **Governance health:** Average time from proposal submission to approval decision
- **Content quality:** % of terms with complete fields (definition, usage guidance, examples)
- **Search effectiveness:** Users find what they need on first search (low bounce rate)

---

## MVP Scope

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| **Term Management** | Full CRUD with structured fields (definition, usage, examples, synonyms, status, visibility, owner) | Built |
| **Proposal Workflow** | Propose → Review → Approve/Reject/Request Changes, with automatic term creation on approval | Built |
| **Version History** | Every edit creates a versioned snapshot with change notes, who, when, why | Built (TermVersion table) |
| **Search & Browse** | Search by keyword + browse by category with filters (status, visibility) | Built (client-side search; server-side search exists) |
| **Principles** | CRUD for organizational principles with markdown body, linked to terms bidirectionally | Built |
| **Role-Based Access** | Three roles (Member, Approver, Admin) with different permission levels | Built (model exists; auth not wired) |
| **Visibility Controls** | Internal / Client-Safe / Public flags on terms and principles | Built |
| **Category Management** | Admin CRUD for term categories with color coding and sort order | Built |
| **System Settings** | Admin configuration toggles for system behavior | Built |

### Out of Scope for MVP

| Feature | Rationale for Deferral |
|---------|----------------------|
| Google Workspace SSO | Can add at publish time; core UX works without it |
| AI-assisted approval analysis | Needs core workflow stable first |
| AI-driven natural language search | Enhancement after basic search works |
| Weekly digest emails | In-app access is sufficient initially |
| Analytics dashboard | Need usage data first |
| Training quizzes / onboarding modules | Future enhancement |
| Slack bot integration | Future enhancement |
| CRM integration (Zoho) | Future enhancement |
| Full knowledge base / SOP platform | Out of product scope |

### MVP Success Criteria

- [ ] Anyone can find the approved term quickly (< 30 seconds)
- [ ] New terms go through governed approval process with full context
- [ ] Full version history with audit trail (who, what, when, why)
- [ ] Deprecated terms clearly marked with replacement guidance
- [ ] Three user roles functioning correctly
- [ ] Visibility controls working (Internal vs. Client-Safe vs. Public)
- [ ] Principles documented and linked to terms bidirectionally
- [ ] Search functional across term name, definition, synonyms, examples

### Future Vision

**Post-MVP / V2:**
- Google Workspace SSO authentication
- AI-assisted approval analysis (duplicate detection, conflict flagging)
- AI-driven semantic search across terms and principles
- Weekly digest notifications for new/updated terms
- Analytics dashboard (adoption metrics, confusion hotspots)

**Long-term:**
- Training quizzes and onboarding assessment modules
- Slack bot for in-channel term lookup
- CRM integration (Zoho field tooltips, data validation against canonical terms)
- Google Drive template annotations
- Public-facing glossary mode for external stakeholders

---

*Migrated to BMAD format: 2026-02-06*
*Original source: docs/dev-assist/project/problem-statement.md (created 2026-01-10)*
*Validated: 2026-01-10 — Added Principles, confirmed 3-role model, clarified auth deferral*
