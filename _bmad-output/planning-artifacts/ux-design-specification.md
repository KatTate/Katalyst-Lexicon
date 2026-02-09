---
stepsCompleted: [1, 2]
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/prd-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/architecture-katalyst-lexicon-2026-02-06.md
  - _bmad-output/project-context.md
  - docs/dev-assist/project/user-flows.md
---

# UX Design Specification Katalyst Lexicon

**Author:** User
**Date:** 2026-02-09

---

## Executive Summary

### Project Vision

Katalyst Lexicon is a purpose-built vocabulary governance tool for a 30-50 person team that loses 10-20 hours per week to terminology confusion. It replaces failed attempts with Notion, Confluence, and Google Docs by adding what those tools lacked: a governed approval workflow, structured term definitions, version history, and bidirectional linking between terms and organizational principles. The app serves two fundamentally different jobs: the Lookup Job (80% of usage — search, read, done) and the Governance Job (20% — propose, review, approve). Design decisions should always favor the Lookup Job when trade-offs arise.

### Target Users

1. **Team Members in Meetings (highest frequency)** — Need sub-30-second lookup on mobile or desktop. The "in a meeting, need to check a term right now" use case. Multiple times daily across the team.
2. **Content Creators (high frequency)** — Writing proposals, SOWs, and decks — need to confirm canonical vs. deprecated language. Several times per week.
3. **New Employees (moderate frequency, high impact)** — Onboarding, encountering unfamiliar terms daily, browsing to build understanding. Daily during first 1-3 months.
4. **Approvers (3-5 people, low frequency)** — Weekly batch review of proposals, ensuring quality and consistency.
5. **Admins (1-2 people, occasional)** — System maintenance, category management, user role assignment.

### Key Design Challenges

1. **Speed over everything** — The primary journey (search → read → done) must feel instant. In-meeting mobile lookup means zero friction — every extra tap or load time is a failure.
2. **Information density balance** — Terms have many structured fields (definition, usage, examples, synonyms, status, visibility, version). Need to show the right information at the right level of detail without overwhelming the reader.
3. **Two audiences, one interface** — 80% of users just want to look things up quickly. 20% need governance tools (proposal forms, review queues, admin settings). These shouldn't interfere with each other.
4. **Mobile-first for the primary journey** — Meeting lookup happens on phones. The search → read flow must work beautifully on small screens.

### Design Opportunities

1. **Search as the hero** — Make search the dominant, unmissable element. If 80% of usage is lookup, the search bar should be the first thing anyone sees and the fastest path to answers.
2. **Progressive disclosure** — Show definition first, reveal depth (examples, history, linked principles) on demand. Let casual users get in and out fast while power users can dig deeper.
3. **Status at a glance** — Color-coded, accessible badges (Canonical, Deprecated, Draft, In Review) that communicate instantly without reading.
4. **Connected knowledge** — The bidirectional term-principle linking is a unique differentiator. Surfacing these connections naturally could create "aha moments" during browsing and onboarding.
