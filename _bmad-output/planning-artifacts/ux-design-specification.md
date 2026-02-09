---
stepsCompleted: [1, 2, 3, 4, 5]
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

## Core User Experience

### Defining Experience

The defining experience of Katalyst Lexicon is the **search-to-answer moment**: a user types a few characters, sees matching terms with clear status indicators, taps or clicks the right one, and reads a scannable definition — all within 30 seconds. This 3-step journey (Open → Search → Read → Done) represents 80% of all usage and is the interaction that determines whether the product succeeds or fails.

The secondary experience is the **governance loop**: a team member spots a gap or inconsistency, proposes a new term or edit with full context, and an approver reviews and publishes it — creating an audited, versioned change. This loop is used less frequently but is the reason this tool exists instead of a Google Doc.

### Platform Strategy

- **Responsive web application** — single codebase serving desktop and mobile browsers equally
- **Desktop (50%+ of usage)** — Full experience including governance tools (proposal forms, review queues, admin settings). Sidebar navigation with category browsing. Optimized for keyboard-driven search.
- **Mobile (up to 50% of usage)** — Fully functional lookup experience. Search and term reading must work well on phone screens. Governance features accessible but not optimized for mobile-first.
- **Always online** — No offline support needed. Real-time data freshness is expected.
- **No device-specific constraints** — Standard responsive breakpoints (phone, tablet, desktop). No special hardware considerations.

### Effortless Interactions

1. **Search is always available** — The search bar should be reachable from any page, any screen size, without scrolling. On desktop, a persistent search input in the header. On mobile, a search icon that opens a **full-screen search overlay** (similar to iOS Spotlight / Android search) — the keyboard comes up immediately and results get maximum visual space.
2. **Status communicates instantly** — Canonical, Deprecated, Draft, In Review badges should be understood at a glance through color and shape, not just text. A user should never accidentally cite a deprecated term.
3. **Two-tier term detail layout** — The term detail page uses two tiers of information:
   - **"Use this term correctly" tier (always visible):** Definition, usedWhen, notUsedWhen, status, visibility, and synonyms. These are the fields content creators need to use a term with confidence — they must never be hidden behind a click or accordion.
   - **"Understand this term deeply" tier (expandable):** Examples (good/bad), version history, and linked principles. These provide deeper context for onboarding and exploration but don't need to be visible by default.
4. **Category browsing is one click** — The sidebar (desktop) or navigation (mobile) takes users directly to a filtered term list without intermediate pages.
5. **Proposal forms guide, not interrogate** — Required fields are clear, optional fields are obviously optional, and the form helps users provide good context rather than blocking them with validation walls.
6. **Mobile term detail uses vertical scroll with sticky section headers** — On mobile, term detail content scrolls vertically (no tabs) with sticky section headers for orientation. This avoids hidden content behind tabs and lets users thumb-scroll naturally — faster than figuring out which tab has what.

### Critical Success Moments

1. **First search that works** — The moment a new user searches and instantly finds the term they need with a clear definition. This is where they decide "this is better than asking a colleague."
2. **The canonical confidence moment** — When a content creator sees the green "Canonical" badge and knows with certainty they're using the approved term. No second-guessing.
3. **The deprecation save** — When a user searches for a term and sees it's deprecated, preventing them from using outdated language in a client deliverable.
4. **First proposal submitted** — When a team member successfully proposes a term and sees it enter the review queue. This transforms them from a passive reader to an active contributor.
5. **The onboarding "aha"** — When a new hire browses a category or follows a principle-to-term link and starts to see how the organization's vocabulary connects together.
6. **The return visit** — The moment someone comes back a second time unprompted because they remembered the app was faster than asking a colleague. This is the adoption signal that matters most.

### Experience Principles

1. **Answers first, everything else second** — The definition is the product. Every design decision should be evaluated by asking: "Does this help the user get to the answer faster?"
2. **Show status, don't make them think** — Status (Canonical, Deprecated, Draft, In Review) and visibility (Internal, Client-Safe, Public) should be communicated through visual indicators that require zero cognitive effort.
3. **Progressive depth, not progressive barriers** — Surface the essential information immediately. Let users choose to go deeper into examples, history, and principles — don't force them through layers to get the basics. Usage guidance (usedWhen, notUsedWhen) is essential and stays visible alongside the definition — only deeper context (examples, history, principles) is progressive.
4. **Governance should feel lightweight** — Proposing a term should feel like filling out a helpful form, not submitting a bureaucratic application. Reviewing should feel like a quick quality check, not a compliance exercise.
5. **Empty states are onboarding moments** — Every empty state bridges the Lookup Job failure into the Governance Job. "No terms in this category yet — propose the first one." "No results — want to propose this term?" This is the growth loop that populates the lexicon and prevents the "feels dead on arrival" problem that killed Notion and Confluence glossaries before.

## Desired Emotional Response

### Primary Emotional Goals

1. **Confidence** — "I know I'm using the right term." The primary emotional outcome is certainty. When a user reads a term definition with a Canonical badge, they should feel zero doubt about using it in a meeting, a proposal, or a client deliverable.
2. **Quiet reliability** — "I'm glad this tool exists." Not wow-factor or flashiness. The feeling of a tool that's always there, always accurate, always fast. Like a dictionary you trust — you don't marvel at it, you just rely on it.
3. **Approachability** — "I can explore this freely." Especially for new hires and infrequent users, the app should feel inviting and low-pressure. Browsing should feel like exploring, not studying. No intimidation, no information overload.

### Emotional Journey Mapping

| Stage | Desired Feeling | Design Implication |
|-------|----------------|-------------------|
| **First visit** | "This is straightforward and I can figure it out" | Clean layout, obvious search, minimal onboarding friction |
| **Searching** | "This is fast and easy" | Instant results, clear matching, no dead ends |
| **Reading a term** | "Now I know — I can use this confidently" | Definition prominent, status clear, usage guidance visible |
| **No results found** | "That's okay — I can help fix this" | Warm empty state with "propose this term" invitation |
| **Browsing categories** | "I'm discovering how our language fits together" | Connected, explorable, not overwhelming |
| **Proposing a term** | "I'm contributing something valuable" | Guided form, encouraging tone, clear next steps |
| **Proposal rejected** | "I understand why, and I can try again" | Constructive feedback, no shame, clear path forward |
| **Return visit** | "Right, this is the faster way to check" | Remembered familiarity, instant search, consistent experience |

### Micro-Emotions

**Prioritized for this product:**

- **Confidence over confusion** — The most critical axis. Every design element should increase certainty about which term to use and whether it's current.
- **Trust over skepticism** — Users must believe the content is authoritative and up-to-date. Version history, "last updated" timestamps, and governance badges build this trust.
- **Accomplishment over frustration** — Especially in the governance flow. Submitting a proposal should feel like a small win, not a chore. Getting approved should feel like a contribution recognized.
- **Belonging over isolation** — The lexicon is a shared team artifact. Seeing other people's contributions, change notes, and principle authorship should reinforce that "we built this together."

**Reframed approach to delight:**

- **Delight through recognition, not decoration** — No confetti, no animations, no gamification. Instead, small earned moments that acknowledge human contributions: "Your first term is now part of the lexicon." Recent activity signals like "3 terms updated this week." The difference between a database and a team artifact is that a team artifact shows the human activity behind it.

### Voice Principle: The Helpful Librarian

The app speaks like a **helpful librarian** — someone who knows where everything is, speaks clearly, never condescends, and genuinely wants you to find what you need. Not a chatbot, not a brand mascot — a librarian. This voice is trusted because it's knowledgeable and neutral.

**Voice in action:**

| Context | Librarian Voice | Not This |
|---------|----------------|----------|
| Form labels | "What does this term mean?" | "Definition (required)" |
| Usage guidance | "When should someone use this?" | "Usage Constraints" |
| Empty category | "This category doesn't have any terms yet. Be the first to add one." | "No terms found." |
| No search results | "We couldn't find what you're looking for. Try a different search, or propose this as a new term." | "0 results." |
| Proposal submitted | "Your proposal has been submitted. An approver will review it soon." | "Submission successful." |
| First term approved | "Your first term is now part of the lexicon." | "Status: Approved." |
| Proposal rejected | "This proposal wasn't approved this time. Here's the feedback — you're welcome to revise and resubmit." | "Rejected. Reason: [text]" |

### Design Implications

| Emotional Goal | UX Design Approach |
|---------------|-------------------|
| Confidence | Green Canonical badge is the visual anchor. Deprecated terms get muted styling with clear warning. Status is never ambiguous. |
| Quiet reliability | Fast load times, consistent layout, no flashy transitions. The app should feel "solid" — same experience every time. |
| Approachability | Warm but professional color palette. Friendly typography. Conversational microcopy following the librarian voice. |
| Encouragement | Empty states invite contribution. Rejected proposals include constructive feedback. Form labels use helpful language. |
| Belonging | Show who contributed terms, who proposed changes, when things were last updated. The lexicon is a living team product, not an anonymous database. |
| Trust | Version history always accessible. "Last updated" visible on term cards. Governance badges signal editorial rigor. |

### Adoption-Killer Defenses

The emotional design specifically addresses the three failure modes that killed Notion, Confluence, and Google Docs glossaries:

1. **"Is this even up to date?" → Freshness signals everywhere** — Every term card shows a freshness indicator (e.g., "Updated 3 days ago" or "v4 — 12 changes"), even on search results and browse lists. Version count and last-updated timestamps are never hidden. The app must always feel actively maintained.

2. **"Nobody else uses this" → Social proof of team activity** — Contributor names visible on terms and proposals ("Proposed by Sarah," "Reviewed by Michael"). Recent activity signals on category pages ("3 terms updated this week"). The app feels alive because you can see your colleagues' fingerprints on it.

3. **"I don't have time for this" → Efficiency that's noticeable** — Sub-second search, minimal clicks, no loading spinners that linger. The app should respect the user's time so obviously that they notice it. The feeling should be "that was faster than I expected."

### Emotional Design Principles

1. **Warm professional, not corporate sterile** — The tone should feel like a knowledgeable colleague, not a compliance system. Friendly microcopy following the librarian voice, approachable layout, but always credible and authoritative.
2. **Encourage contribution, never shame** — Every interaction with the governance system should make users feel their input is valued. Rejections include reasons and invite revision. Empty categories invite first contributions.
3. **Build trust through transparency** — Show the work: version history, change notes, authorship, timestamps, freshness signals. Trust comes from seeing that the system is maintained and governed, not from branding or design polish.
4. **Calm efficiency, not excitement** — The best compliment for this tool is "I didn't even think about it — I just looked it up and moved on." The UX goal is to be so efficient it becomes invisible.
5. **Delight through recognition, not decoration** — Acknowledge human contributions with small, earned moments. Show the people behind the vocabulary. Make the lexicon feel like a team artifact, not an anonymous database.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

**Google Chat — "The tool nobody had to learn"**

What it does well:
- **Zero onboarding friction** — Users start using it immediately because it follows patterns they already know (message input, conversation threads, search)
- **Always available, never demanding** — It sits in the background until needed. No splash screens, no tips, no onboarding tours
- **Search just works** — Type, find, done. No advanced search UI, no filters to configure — just a text box that returns results
- **Consistent, predictable layout** — Every conversation looks the same. The interface is so consistent that users stop noticing it — which is the highest compliment for a utility tool

What's transferable to Katalyst Lexicon:
- The "just works" search experience — a single input that returns useful results immediately
- The invisible-until-needed design philosophy — governance tools shouldn't crowd the lookup experience
- The zero-learning-curve layout — familiar patterns, obvious affordances, no training required

**Apple Dictionary (macOS) — "The instant answer"**

A strong parallel for the Lookup Job:
- **Spotlight integration** — Users don't even open the app. They search from anywhere and get a definition inline
- **Definition first, etymology later** — The primary definition is always the first thing you see. Word origin, usage notes, and related words are below the fold
- **No navigation needed** — Search is the entire interface for 90% of usage

What's transferable:
- The full-screen search overlay on mobile should feel like Spotlight — immediate, focused, results-as-you-type
- Definition-first layout mirrors our two-tier term detail design
- The app should feel like "the answer is already here, you just need to type"

**Notion (as a cautionary tale) — "The tool that got abandoned"**

Relevant because Notion is one of the tools that previously failed for this team:
- **Too much flexibility** — Freeform pages meant inconsistent term entries with different formats
- **No governance** — Anyone could edit anything, so nothing felt authoritative
- **No freshness signals** — Pages felt stale because there was no indication of maintenance or activity
- **Discovery required effort** — Finding the right page required knowing where it was, not just what it was called

What to avoid:
- Freeform content entry — structured fields prevent the inconsistency problem
- Equal access without governance — the approval workflow is the key differentiator
- Static-feeling content — freshness signals and contributor names prevent the "graveyard" feeling

### Transferable UX Patterns

**Navigation Patterns:**

- **Search-dominant home page** (from Google Chat / Apple Dictionary) — The search input is the hero element on the home page. Category browsing is secondary navigation in a sidebar, not competing for attention with search.
- **Persistent header with search** (from Google Chat) — On desktop, the search bar lives in the header and is available on every page without navigating away. On mobile, a search icon opens the full-screen overlay.

**Interaction Patterns:**

- **Results-as-you-type** (from Spotlight / Google Chat) — Search results appear and update as the user types, with no "submit" button needed. Debounced input, fast rendering.
- **Single-click depth** (from Apple Dictionary) — From any search result or browse list, one click/tap takes you to the full term detail. No intermediate pages, no modals to dismiss.
- **Inline status indicators** (from Google Chat presence dots) — Status badges (Canonical, Deprecated, Draft, In Review) function like presence indicators — small, color-coded, always visible, instantly understood.

**Visual Patterns:**

- **Card-based browse lists** (common across modern tools) — Term cards in browse/search results show: name, category tag, status badge, definition preview, and freshness signal. Scannable without clicking.
- **Clean whitespace and typography hierarchy** (from Apple's design language) — Let the content breathe. Clear typographic hierarchy makes scanning fast: term name (large, bold), definition (readable body), metadata (smaller, muted).

### Anti-Patterns to Avoid

1. **The "power user" trap** — Don't expose governance complexity (filters, admin tools, review queues) in the primary navigation at the same visual weight as search and browse. This is what makes internal tools feel intimidating to casual users.
2. **The "freeform entry" problem** — Notion died because entries were inconsistent. Every term must go through the same structured form with the same fields. No rich text editors for definitions, no custom layouts.
3. **The "empty graveyard" spiral** — If the app feels abandoned, people stop coming. Freshness signals, contributor names, and activity indicators are non-negotiable defenses against this.
4. **The "hamburger menu on desktop" mistake** — Desktop users have screen space. Don't hide the category sidebar behind a hamburger menu on desktop viewports. It should be visible and persistent.
5. **The "confirmation dialog" tax** — Don't add "Are you sure?" dialogs to routine actions (searching, browsing, opening terms). Save confirmation dialogs for destructive actions only (deleting, rejecting proposals).

### Design Inspiration Strategy

**What to Adopt:**

- Google Chat's "zero onboarding" philosophy — The app should be usable on first visit without any tutorial or walkthrough
- Apple Dictionary's "definition first" information hierarchy — The answer is always the first thing you see
- Search-as-you-type with instant results — The pattern users expect from every modern search tool

**What to Adapt:**

- Google Chat's flat, minimal aesthetic — Adapt with warmer colors and the Katalyst brand palette. The app should feel approachable, not sterile.
- Apple Spotlight's full-screen search — Adapt for mobile web (not native iOS), with results rendering below the input as cards rather than inline definitions

**What to Avoid:**

- Notion's freeform flexibility — Structured fields only, governance-enforced consistency
- Complex filtering interfaces — Keep filters simple (category, status) and visible, not behind dropdowns or advanced search modals
- Any pattern that requires learning — If a user has to think about how to use the app, we've failed
