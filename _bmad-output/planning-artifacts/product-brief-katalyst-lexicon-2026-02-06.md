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
revisedDate: 2026-02-09
revisionNote: Post-greenfield party mode validation — added problem quantification, competitive analysis, user prioritization, instrumentable metrics, tiered MVP scope, and resolved contradictions
---

# Product Brief: Katalyst Lexicon

## Executive Summary

Katalyst Lexicon is an internal web application serving as the canonical source of truth for organization-wide vocabulary, terminology, and guiding principles. It replaces the current ad-hoc approach of asking colleagues, searching old documents, and guessing — with a governed, searchable knowledge base that any team member can access in under 30 seconds.

The application addresses a critical operational problem: across a team of 30-50 people spanning Strategy, Design, Production, Finance, and Sales, overlapping and inconsistent language costs an estimated 10-20 hours per week in wasted meeting time, rework, and miscommunication. Katalyst Lexicon provides a structured governance workflow — propose, review, approve — ensuring only vetted terminology becomes canonical, while preserving full audit trails and version history.

The organization has an estimated 100-250 active terms that need governance. Previous attempts using Notion, Confluence, and shared Google Docs all failed — they were eventually forgotten, lacked approval workflows, had no version tracking, and weren't architected to support the AI intelligence layer planned for future phases.

---

## Core Vision

### Problem Statement

Overlapping and inconsistent language across departments leads to misalignment, rework, and confusion. Across a team of 30-50 people, this costs an estimated 10-20 hours per week — roughly 500-1,000 hours per year — in wasted meeting time debating terminology, rework from miscommunication, and onboarding friction for new hires. The reasoning behind terminology choices and organizational philosophy is scattered or undocumented. Principles exist in people's heads but aren't captured anywhere.

### Problem Impact (Quantified)

- **10-20 hours/week lost** across the team to terminology-related confusion and rework
- **Project delays** from miscommunication about scope, deliverables, and "done" criteria
- **Confusing handoffs** and weak ownership between departments
- **Rework** caused by different departments using different terms for the same concept
- **CRM inconsistency** and reporting errors from non-standardized language in Zoho
- **Training that does not scale** — new employees rely on tribal knowledge from the 30-50 person team
- **Customer confusion** when external-facing language is inconsistent across client-facing staff
- **Wasted meeting time** debating what words mean instead of making decisions

### Why Existing Solutions Fall Short

#### Current Process Failures

The current approach — asking colleagues, searching old documents, or guessing — fails because:

- **No single source of truth** — terminology definitions live across documents, Slack threads, and people's memories
- **No governance** — anyone can define a term however they see fit, with no approval process
- **No version history** — when terminology changes, there's no record of what changed, why, or when
- **No deprecation path** — outdated terms persist without clear replacement guidance
- **No principles documentation** — the reasoning behind language choices isn't captured
- **No visibility controls** — no way to distinguish internal-only terms from client-safe language

#### Commercial Tool Failures (Tried and Abandoned)

The team has previously tried general-purpose tools and they all failed:

| Tool | Why It Failed |
|------|--------------|
| **Notion** | Glossary pages created but eventually forgotten; no approval workflow; no version tracking; freeform structure led to inconsistent entries |
| **Confluence** | Same wiki-style problems — no governance, no structured fields, no way to enforce quality; became another document graveyard |
| **Google Docs** | Shared glossary documents lost in Drive; no search across definitions; no way to link terms to organizational principles; no approval process |

**Common failure patterns across all tools:**
- No built-in approval/governance workflow — anyone could edit anything
- No structured data model — definitions were freeform text with inconsistent formatting
- No version history with change reasoning — just "last edited by" timestamps
- Not purpose-built for vocabulary — just general docs/wikis repurposed
- No path to AI augmentation — generic tools can't be extended with intelligent search, duplicate detection, or AI-assisted review

### Proposed Solution

A purpose-built internal web application with:

1. **Structured term definitions** — each term includes: definition, why it exists, when to use it, when NOT to use it, good/bad examples, synonyms, and status
2. **Governed approval workflow** — propose → review → approve/reject/request changes, with full audit trail
3. **Organizational principles** — longer-form philosophy documents linked bidirectionally to related terms
4. **Role-based access** — Member (browse + propose), Approver (review + publish), Admin (full system control)
5. **Visibility controls** — Internal, Client-Safe, and Public classification for every term
6. **Version history** — every change produces a versioned snapshot with change notes, who, when, and why
7. **Fast search and browse** — find the right term in under 30 seconds via search or category browsing
8. **AI-ready architecture** — data model and search infrastructure designed to support intelligent features (duplicate detection, semantic search, AI-assisted review) in future phases

### Key Differentiators

- **Not a wiki or knowledge base** — purpose-built for vocabulary governance with structured fields, not freeform pages. This is why Notion/Confluence/Google Docs failed.
- **Governance-first design** — every change goes through a defined workflow with approval authority, unlike any general-purpose tool
- **Bidirectional linking** — terms and principles reference each other, creating a connected knowledge graph
- **Visibility-aware** — built-in support for internal vs. client-safe vs. public terminology
- **Deprecation management** — first-class support for sunsetting terms with replacement guidance
- **AI-ready foundation** — structured data model designed from day one to support semantic search, duplicate detection, and AI-assisted review in V2

---

## Target Users

### User Prioritization

The application serves two fundamentally different "jobs to be done":

1. **The Lookup Job** (80% of usage) — Finding and reading term definitions quickly. This is the primary value driver and the experience that must be optimized above all else.
2. **The Governance Job** (20% of usage) — Proposing, reviewing, and managing terms. This is essential infrastructure but used far less frequently.

Design decisions should always favor the Lookup Job when trade-offs arise.

### Primary Users (Lookup Job — Highest Priority)

**1. Team Members in Meetings (Quick Lookup) — HIGHEST FREQUENCY**
- Role: Any of the 30-50 Katalyst employees (Client Services, PMs, Design, Production, Finance, Sales)
- Context: In a live meeting or conversation, needs to confirm correct terminology quickly
- Pain: Currently guesses or asks a colleague, disrupting the conversation
- Need: Sub-30-second lookup on mobile or desktop — search, read, done
- Success moment: Confidently uses the correct term without pausing the meeting
- Frequency: Multiple times daily across the team
- Core journey: Open app → Search → Read definition → Close app (3 steps, under 30 seconds)

**2. Content Creators (Correct Language) — HIGH FREQUENCY**
- Role: Anyone producing documents, proposals, SOWs, presentations
- Context: Writing client-facing or internal content, needs canonical terminology
- Pain: Uses inconsistent language, resulting in rework or confusion
- Need: Clear status visibility (Canonical vs. Deprecated), good/bad examples, visibility flags
- Success moment: Writes a proposal using consistent, approved language throughout
- Frequency: Several times per week

**3. New Employees (Onboarding) — MODERATE FREQUENCY, HIGH IMPACT**
- Role: Recent hires learning organizational language and philosophy
- Context: First weeks/months, encountering unfamiliar terminology daily
- Pain: Relies entirely on colleagues to explain terms, slowing ramp-up
- Need: Browsable, searchable vocabulary with "why" context and linked principles
- Success moment: Independently finds and understands a term without asking anyone
- Frequency: Daily during onboarding (first 1-3 months)

### Secondary Users (Governance Job)

**4. Approvers (Vocabulary Governors) — LOW FREQUENCY**
- Role: Leadership and senior team members with approval authority (estimated 3-5 people)
- Context: Reviewing proposed terms or changes to ensure quality and consistency
- Pain: No structured review process — changes happen informally
- Need: Review queue with full context, ability to approve/reject/request changes
- Success moment: Efficiently reviews and publishes a well-defined term
- Frequency: Weekly or as proposals arrive

**5. Administrators — OCCASIONAL**
- Role: System admins managing categories, settings, and user roles (estimated 1-2 people)
- Context: Maintaining the structure and configuration of the lexicon
- Need: Category management, user role assignment, system settings
- Frequency: Monthly or as needed

### User Journeys

**Journey A: Quick Lookup (Primary — optimized for speed)**
```
Open app → Search → Read definition → Done
```
3 steps, under 30 seconds. This is the journey 80% of users do 80% of the time.

**Journey B: Explore & Learn (Onboarding / Discovery)**
```
Browse categories → Scan term list → Read term detail → Follow linked principles → Navigate to related terms
```
Longer session, focused on building understanding. Common for new hires.

**Journey C: Propose & Govern (Contributors) — requires auth (V1.1+)**
```
Encounter gap → Propose term (or edit) → Wait for review → Track status
```
Requires authentication. Happens occasionally. In MVP (pre-auth), this journey is functional but unprotected — any user can submit proposals without login. Auth enforcement comes in V1.1.

**Journey D: Review & Approve (Approvers) — requires auth (V1.1+)**
```
Open Review Queue → Read proposal with diff → Approve/Reject/Request Changes → Term published
```
Requires authentication and Approver role. Weekly or as needed. In MVP (pre-auth), any user can access the review queue. Role enforcement comes in V1.1.

**Journey E: Administer (Admins) — requires auth (V1.1+)**
```
Manage categories → Manage users/roles → Configure settings
```
Requires authentication and Admin role. Occasional. In MVP (pre-auth), admin pages are accessible to all users. Access restriction comes in V1.1.

---

## Success Metrics

### Baselines

| Baseline | Value | Source |
|----------|-------|--------|
| Team size | 30-50 people | Current headcount |
| Estimated active terms | 100-250 | Domain estimate |
| Weekly hours lost to terminology confusion | 10-20 hours | Team estimate |
| Previous tools tried | Notion, Confluence, Google Docs | All abandoned |

### Instrumentable Metrics (Measurable by the Application)

These are metrics the application can track directly through its own data:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Search-to-view rate | > 70% of searches result in a term detail view | Track searches that lead to a term click |
| Term coverage | 100+ canonical terms within 3 months of launch | Count of terms with status "Canonical" |
| Proposal cycle time | < 5 business days from proposal to decision | Timestamp difference: submittedAt → approved/rejected |
| Proposal completion rate | > 80% of proposals have all required fields | Count proposals with non-empty definition, whyExists, category |
| Content quality | > 60% of canonical terms have examples | Count canonical terms with non-empty examplesGood |
| Active contributors | 5+ unique proposal submitters per month | Count distinct submittedBy values per month |
| Version activity | Average of 1+ version per term over 6 months | TermVersion count / Term count |

### Observational Metrics (Require Team Feedback)

These cannot be tracked by the application alone but should be assessed periodically:

| Metric | Target | How to Assess |
|--------|--------|---------------|
| Reduction in terminology confusion | Decrease from 10-20 hrs/week baseline | Quarterly team survey |
| New hire self-sufficiency | New hires use Lexicon before asking colleagues | Onboarding feedback |
| Meeting efficiency | Less time debating terminology in meetings | Team lead observation |

### Business Objectives

| Objective | Success Indicator | Timeframe |
|-----------|-------------------|-----------|
| Reduce miscommunication-driven rework | Fewer scope disputes and handoff issues | 6 months |
| Faster onboarding | New hires reference Lexicon as primary terminology source | 3 months |
| Consistent CRM data | Standardized language in Zoho aligned with canonical terms | 6 months |
| Professional client communications | Consistent, approved language in deliverables | 3 months |
| Institutional knowledge preservation | 100+ terms and 5+ principles documented permanently | 3 months |
| Team adoption | 20+ of 30-50 team members using the Lexicon monthly | 3 months |

### Key Performance Indicators (Summary)

- **Adoption:** 20+ active users out of 30-50 team members (40-60% adoption within 3 months)
- **Coverage:** 100+ canonical terms documented out of estimated 100-250 active terms (40%+ coverage within 3 months)
- **Governance health:** Average proposal-to-decision time under 5 business days
- **Content quality:** 60%+ of canonical terms with complete fields (definition, usage, examples)
- **Search effectiveness:** 70%+ of searches result in viewing a term detail page

---

## MVP Scope

### Feature Tiers

Features are prioritized into three tiers based on user value and necessity:

#### Tier 1: Must-Have (Core value proposition — the app is incomplete without these)

| Feature | Description | Status | Rationale |
|---------|-------------|--------|-----------|
| **Search & Discover** | Server-side search across name, definition, synonyms, examples with results showing name, category, status badge, and definition preview | Built | Primary user journey (Journey A) depends on this |
| **Browse by Category** | Category sidebar navigation with term lists, including filters for status and visibility | Partially built (filters missing) | Secondary discovery path for browsing users |
| **Term Detail View** | Complete term display: definition, usage, examples, synonyms, status, visibility, version, linked principles | Built | The destination of every search and browse action |
| **Proposal Workflow** | Propose new terms and edits → Review Queue → Approve/Reject/Request Changes, with automatic term creation on approval | Built | Core governance mechanism — the reason we're not using Notion |
| **Version History** | Every edit creates a versioned snapshot with change notes, who, when, why; viewable on term detail page | Built | Key differentiator from tools that failed before |
| **Duplicate Detection (Basic)** | Warn proposers when a term name exactly or closely matches an existing term name (simple string comparison) | Not built | Prevents governance overhead from duplicate proposals. Note: basic name-matching is MVP; AI-powered semantic duplicate detection is V2 |

#### Tier 2: Should-Have (Important but the app works without them)

| Feature | Description | Status | Rationale |
|---------|-------------|--------|-----------|
| **Principles** | Organizational philosophy documents with markdown body, linked to terms bidirectionally | Built | Essential context for understanding "why" behind terminology — user confirmed this stays in MVP |
| **Category Management** | Admin CRUD for term categories with color coding and sort order | Built | Needed to organize the 100-250 terms into meaningful groups |
| **Visibility Controls** | Internal / Client-Safe / Public flags on terms and principles | Built (data model); browse filtering not built | Important for client-facing staff but not needed for initial internal use |

#### Tier 3: Nice-to-Have (Valuable but can ship without them)

| Feature | Description | Status | Rationale |
|---------|-------------|--------|-----------|
| **System Settings** | Admin configuration toggles for governance, notifications, visibility | Built (UI only) | User confirmed these stay in MVP; toggles are ready for when auth is wired |
| **Role-Based Access** | Three roles (Member, Approver, Admin) with different permission levels | Built (data model only; auth not wired) | Essential for production but MVP can demo and validate UX without enforcement |
| **User Management** | Admin view of users with role assignment | Built (API + partial UI) | Depends on auth being wired to be meaningful |

### Auth Deferral — Explicit Consequences

Authentication (Google Workspace SSO) is deferred to publish time. This has the following known consequences:

- **All write endpoints are unprotected** — anyone can create, edit, or delete terms, proposals, categories, users, and settings
- **Audit trail is incomplete** — proposal submittedBy and version changedBy fields contain placeholder values ("Current User", "System") instead of real user identities
- **Role-based permissions are not enforced** — the three roles (Member, Approver, Admin) exist in the data model but no middleware checks them
- **Settings toggles are cosmetic** — governance rules like "require approver signoff" and "require change note" aren't enforced because there's no auth context to enforce them against

**This is acceptable for MVP validation** because the core UX (search, browse, propose, review) can be demonstrated and validated without auth. Auth must be wired before production deployment to a team of 30-50 people.

### Out of Scope for MVP

| Feature | Rationale for Deferral | Target |
|---------|----------------------|--------|
| Google Workspace SSO | Core UX works without it; add at publish time | V1.1 (publish) |
| Term relationships (parent/child, replaces) | Medium complexity; not needed for core governance workflow | V1.1 |
| Deprecated term replacement linking | Requires Term.replacesId schema addition; visual deprecation badge is sufficient for MVP | V1.1 |
| AI-assisted approval analysis | Needs core workflow stable first; custom app architecture enables this (unlike Notion/Confluence) | V2 |
| AI-driven natural language search | Enhancement after basic search validated; AI-ready data model supports this | V2 |
| Analytics dashboard | Need usage data from real adoption first | V2 |
| Weekly digest emails | In-app access is sufficient initially | V2 |
| Training quizzes / onboarding modules | Future enhancement | V3+ |
| Slack bot integration | Future enhancement | V3+ |
| CRM integration (Zoho) | Future enhancement | V3+ |

### MVP Success Criteria

Must be true before MVP is considered complete:

- [ ] Anyone can find a canonical term in under 30 seconds via search (Journey A)
- [ ] Browse page supports filtering by category, status, and visibility
- [ ] New terms go through governed approval process with all required fields
- [ ] Proposers are warned about potential duplicate terms before submission
- [ ] Full version history with snapshots viewable on term detail page
- [ ] Principles documented and linked to terms bidirectionally (viewable on both sides)
- [ ] Search functional across term name, definition, synonyms, and examples
- [ ] Deprecated terms visually marked with status badge (replacement linking deferred to V1.1)
- [ ] Proposal approval atomically creates/updates terms using database transactions (data integrity requirement)

**Explicitly NOT MVP success criteria** (deferred):
- ~~Three user roles functioning correctly~~ → Deferred: auth not wired; roles exist in data model only
- ~~Visibility controls enforced~~ → Deferred: data flags exist but filtering/enforcement requires auth context
- ~~Deprecated terms link to replacement term~~ → Deferred to V1.1: requires schema addition (Term.replacesId)

### Future Vision

**V1.1 (Publish-Ready):**
- Google Workspace SSO authentication wired via Passport.js
- Role-based permission enforcement (server-side middleware)
- Term relationships (parent/child, replacesId for deprecation guidance)
- Settings toggles enforced by backend middleware
- Audit trail with real user identities (replacing "Current User" / "System" placeholders)

**V2 (AI Intelligence Layer):**
- AI-assisted approval analysis (semantic duplicate detection beyond name matching, conflict flagging, related term suggestions)
- AI-driven semantic search across terms and principles
- Analytics dashboard (adoption metrics, search patterns, confusion hotspots)
- Weekly digest notifications for new/updated terms

**V3+ (Long-term):**
- Training quizzes and onboarding assessment modules
- Slack bot for in-channel term lookup
- CRM integration (Zoho field tooltips, data validation against canonical terms)
- Google Drive template annotations
- Public-facing glossary mode for external stakeholders

---

*Migrated to BMAD format: 2026-02-06*
*Original source: docs/dev-assist/project/problem-statement.md (created 2026-01-10)*
*Validated: 2026-01-10 — Added Principles, confirmed 3-role model, clarified auth deferral*
*Revised: 2026-02-09 — Post-greenfield party mode validation: added problem quantification, competitive analysis, user prioritization, instrumentable metrics, tiered MVP scope, resolved contradictions*
