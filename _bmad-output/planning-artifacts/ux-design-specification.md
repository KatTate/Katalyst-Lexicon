---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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

## Design System Foundation

### Design System Choice

**Existing System: shadcn/ui + Tailwind CSS v4 + Radix UI + Katalyst Brand Tokens**

The project already uses a themeable design system approach that aligns well with our UX goals. No design system change is needed.

### Rationale for Selection

1. **Already built and working** — The design system is implemented and in use across the existing application. Switching would be wasteful and destabilizing for a brownfield project.
2. **Tailwind supports the "warm professional" aesthetic** — Utility-first CSS makes it easy to fine-tune spacing, typography, and color without fighting component library defaults.
3. **shadcn/ui + Radix provides accessible primitives** — Headless components handle keyboard navigation, focus management, and ARIA attributes — critical for a productivity tool used daily.
4. **Brand tokens already defined** — Katalyst-specific colors (kat-green, kat-charcoal) are set up as design tokens. These can be extended to support the emotional design goals (warm palette, status badge colors, freshness indicators).
5. **Framer Motion for subtle animations** — Already available for the "recognition, not decoration" delight moments (e.g., gentle transitions when a proposal is approved).

### Implementation Approach

- **Extend, don't replace** — Build on existing shadcn/ui components. Add new components only when no existing primitive fits.
- **Brand token expansion** — Extend the existing Katalyst color tokens to include semantic status colors (canonical-green, deprecated-amber, draft-gray, in-review-blue) and freshness indicator styling.
- **Typography system** — Montserrat for headers supports scannability. Roboto for body supports readability. The hierarchy already matches our "clean whitespace and typography hierarchy" pattern.
- **Responsive breakpoints** — Use Tailwind's standard breakpoints (sm, md, lg, xl) for the desktop/mobile responsive strategy.

### Customization Strategy

**Status Badges:**
- Canonical → solid green badge (confidence anchor)
- Deprecated → muted amber/orange with strikethrough or warning styling
- Draft → light gray, understated
- In Review → blue, indicates activity

**Visibility Indicators:**
- Internal → no special indicator (default)
- Client-Safe → small shield or checkmark icon
- Public → globe icon

**Component Priorities:**
- Search input with results-as-you-type dropdown
- Term card (for browse lists and search results) with name, category tag, status badge, definition preview, freshness signal
- Term detail page with two-tier layout
- Empty state component with call-to-action (the "helpful librarian" voice)
- Proposal form with guided field labels

## Defining Core Experience

### The Defining Interaction

**"Search. Read. Done."**

The defining experience of Katalyst Lexicon is a **dictionary lookup** — but for your organization's specific vocabulary. The user has a term in mind, types it, and gets a clear, authoritative answer with confidence about whether it's the right word to use.

This is an established pattern — every user already knows how to use a dictionary or search engine. There is nothing novel about the core interaction. The innovation is that this dictionary is *governed, structured, versioned, and connected to organizational principles* — but the user doesn't need to know or care about any of that when they're just looking something up.

### User Mental Model

**Users think of this as:** "The company dictionary"

- **Current solution:** Ask a colleague, search Slack history, check old documents, or guess
- **Mental model they bring:** Google search / dictionary lookup — type words, get answers
- **Expectation:** I type, I find, I read, I'm done. Under 30 seconds.
- **Where they'd get confused:** If search requires exact matches, if results don't show status clearly, if the definition is buried under metadata
- **What they hate about current solutions:** No single place to look, no confidence that what they find is current, interrupting colleagues is awkward

**Key mental model insight:** Users don't think about "governance" or "workflows" — those are invisible infrastructure. They think about "is this the right word?" The governance system is what makes the answers trustworthy, but the user experience of governance should be invisible to 80% of users.

### Success Criteria

| Criterion | Measure | What It Feels Like |
|-----------|---------|-------------------|
| **Speed** | Search-to-answer in under 30 seconds | "That was fast" |
| **Confidence** | Status badge visible and unambiguous | "I know this is the approved term" |
| **Completeness** | Definition + usage guidance visible without clicking | "I have everything I need" |
| **Findability** | First search returns the right term | "It found exactly what I meant" |
| **Reliability** | Same experience every time, no surprises | "I didn't even think about it" |

### Novel vs. Established Patterns

**This is 100% established patterns.** The core interaction (search → results → detail) is a pattern every internet user understands. No user education is needed.

**The unique twist within established patterns:**

1. **Status badges on search results** — Unlike a regular dictionary, results show governance status (Canonical, Deprecated) so users can assess authority before clicking
2. **Usage guidance alongside definition** — "When to use" and "When NOT to use" fields are unique to organizational vocabulary and don't exist in standard dictionaries
3. **Freshness signals** — "Updated 3 days ago" on term cards is not a standard dictionary pattern but addresses the "is this stale?" concern specific to internal tools
4. **Empty-state-to-proposal bridge** — When search fails, the path to "propose this term" is unique to a governed vocabulary tool

### Experience Mechanics

**1. Initiation:**
- **Desktop:** User clicks into the search bar in the header (always visible) or lands on the home page where search is the hero element. Keyboard shortcut (Cmd/Ctrl+K) is a nice-to-have.
- **Mobile:** User taps the search icon in the header → full-screen search overlay opens with keyboard ready

**2. Interaction:**
- User types 2+ characters → results appear below the input as cards
- Each result card shows: term name, category tag, status badge, definition preview (first ~100 characters), freshness signal
- Results update as the user types (debounced, ~200ms)
- User scans results visually — status badges and category tags help them identify the right term without reading every definition

**3. Feedback:**
- **Success path:** Results appear instantly. The right term is visible. User clicks/taps it → term detail page loads with definition immediately visible above the fold.
- **Partial match:** Results show related terms even if the exact name doesn't match (searches across name, definition, synonyms, examples)
- **No results:** Warm empty state: "We don't have that term yet. Want to propose it?" with a direct link to the proposal form

**4. Completion:**
- User reads the definition and usage guidance in the "Use this term correctly" tier
- If they need more depth, they expand the "Understand this term deeply" tier (examples, history, linked principles)
- User returns to their work (meeting, document, conversation) with confidence
- No explicit "done" action needed — closing the tab or navigating away is the natural end

## Visual Design Foundation

### Color System

**Brand Palette (Existing):**

The Katalyst brand palette is earthy, warm, and professional — naturally aligned with the "warm professional, not corporate sterile" emotional principle.

| Token | Role | HSL |
|-------|------|-----|
| kat-green | Primary / brand anchor | 88 67% 45% |
| kat-charcoal | Body text | 86 4% 31% |
| kat-black | Headers | 27 6% 23% |
| kat-graylight | Page background | 220 14% 96% |
| kat-gray | Borders, dividers | 235 11% 84% |
| kat-wheat | Warm accent | 40 36% 77% |
| kat-warning | Cautionary yellow | 55 68% 63% |

**Semantic Status Colors (Extending brand palette):**

| Status | Color Mapping | Rationale |
|--------|--------------|-----------|
| Canonical | kat-green (primary) | Green = primary = trustworthy. Reinforces that canonical terms are the "real" ones. |
| Deprecated | kat-warning (amber/yellow) | Cautionary without being alarming. Signals "still here but don't use this." |
| Draft | kat-gray / kat-gauntlet (muted) | Understated, not attention-grabbing. Drafts are works in progress, not yet important. |
| In Review | Blue (~hsl(210 60% 50%)) | Activity indicator. Blue signals "something is happening" without positive/negative connotation. |

**Semantic UI Colors:**

| Purpose | Token | Usage |
|---------|-------|-------|
| Success | kat-green | Proposal approved, term published |
| Warning | kat-warning | Deprecated terms, validation hints |
| Error/Destructive | Existing destructive token | Rejection, deletion confirmation |
| Info | Blue (same as In Review) | Informational messages, tips |

**Dark Mode:** Fully supported via CSS custom properties. All semantic colors must work in both light and dark palettes with sufficient contrast.

### Typography System

**Font Pairing (Existing):**

| Role | Font | Weight | Usage |
|------|------|--------|-------|
| Headers | Montserrat | Bold, tight tracking | Page titles, section headers, term names in detail view |
| Body | Roboto | Regular/Medium | Definitions, descriptions, form labels, paragraph content |
| Code/Mono | Roboto Mono | Regular | Technical identifiers, slugs, code references |

**Type Scale:**

| Level | Usage | Style |
|-------|-------|-------|
| h1 | Page titles ("Search & Discover", "Principles") | Montserrat bold, ~2rem |
| h2 | Section headers, term name on detail page | Montserrat bold, ~1.5rem |
| h3 | Subsection headers, card titles in browse lists | Montserrat bold, ~1.25rem |
| Body | Definitions, usage guidance, descriptions | Roboto regular, 1rem, comfortable line-height (~1.6) |
| Small | Metadata (timestamps, contributor names, version info) | Roboto, 0.875rem, muted color |
| Caption | Freshness signals, badge labels | Roboto, 0.75rem |

**Typography Principles:**
- Term names use Montserrat bold — they should stand out as the primary information
- Definitions use Roboto regular with generous line-height for readability — this is the content users are here to read
- Metadata (timestamps, contributors, version numbers) uses smaller muted text — important for trust signals but shouldn't compete with the definition

### Spacing & Layout Foundation

**Spacing System:**
- Base unit: 4px (Tailwind default)
- Component internal padding: 16px (p-4)
- Card padding: 16-24px (p-4 to p-6)
- Section spacing: 24-32px (space-y-6 to space-y-8)
- Page margins: 16px mobile, 24-32px desktop

**Layout Structure:**

- **Desktop:** Sidebar (category navigation, ~240px) + main content area. Header with persistent search bar.
- **Mobile:** Full-width content. Header with search icon. Sidebar collapses to hamburger menu or bottom nav.
- **Max content width:** ~1200px to prevent lines from becoming too long for readability

**Density Approach:** Maintain current spacing — moderately dense, balanced between information-rich and breathable. Content doesn't feel cramped, but the interface doesn't waste space with excessive padding.

### Accessibility Considerations

1. **Color contrast** — All text must meet WCAG 2.1 AA contrast ratios (4.5:1 for body text, 3:1 for large text). Status badges must not rely on color alone — include text labels or icons.
2. **Colorblind safety** — Status badges use color + shape/text. Green (Canonical) and amber (Deprecated) are distinguishable for the most common color vision deficiencies. The blue (In Review) provides additional separation.
3. **Focus indicators** — All interactive elements must have visible focus states for keyboard navigation. Radix UI primitives handle this by default.
4. **Touch targets** — Minimum 44x44px touch targets on mobile for all tappable elements (term cards, buttons, search results).
5. **Screen reader support** — Status badges include aria-labels ("Status: Canonical"). Search results announce count. Radix UI components provide built-in ARIA attributes.
6. **Reduced motion** — Respect `prefers-reduced-motion` media query. Framer Motion animations should be disabled or minimized for users who prefer reduced motion.

## Design Direction Decision

### Design Directions Explored

Seven complementary design directions were created as an interactive HTML showcase (`ux-design-directions.html`), each addressing a key screen in the application:

- **A: Search-Hero Home Page** — Centered search input as the dominant element, instant results dropdown with term name/status/definition/freshness, "Recently Updated" card grid below
- **B: Browse Layout with Category Sidebar** — Persistent ~240px sidebar with color-coded category dots and counts, inline header search, term cards in grid layout with status badges
- **C: Term Detail — Two-Tier Layout** — Tier 1 (always visible): definition, when to use / when not to use, synonyms. Tier 2 (expandable): examples, related principles, version history
- **D: Empty States — Helpful Librarian Voice** — Three variations: no search results (bridges to proposal), empty category (encourages contribution), empty review queue (positive acknowledgment)
- **E: Proposal Form — Guided, Not Interrogating** — Conversational field labels, required/optional indicators, inline duplicate detection warning, Save Draft secondary action
- **F: Mobile Search — Full-Screen Overlay** — Spotlight pattern: search icon triggers full-screen overlay, keyboard appears immediately, results fill available space
- **G: Review Queue — Governance Workspace** — Simple list with proposal type badges (New Term / Edit), submitter names, timestamps, categories

### Chosen Direction

**All seven directions adopted as a unified system.** These are not competing alternatives — they are complementary screens that work together using the same brand palette, typography, interaction patterns, and voice.

### Design Rationale

- The unified approach directly implements all UX decisions from previous steps: search-hero for the Lookup Job, two-tier progressive disclosure for term detail, librarian voice for empty states, Spotlight pattern for mobile
- The brand palette (earthy, warm, professional) comes through consistently across all screens
- Status badges use the semantic color system (kat-green for Canonical, amber for Deprecated, blue for In Review, gray for Draft) with text labels for accessibility
- Freshness signals (contributor names, timestamps, version counts) appear on every term card and detail view to prevent the "empty graveyard" anti-pattern
- Governance screens (proposal form, review queue) feel lightweight — simple lists and conversational forms, not complex dashboards

### Implementation Approach

1. **Component library first** — Build reusable components (StatusBadge, TermCard, SearchInput, TierSection, EmptyState) that encode the design decisions
2. **Search-hero home page** — Rebuild the home page with centered search as the dominant element and recently updated grid below
3. **Browse layout** — Refine existing sidebar + grid layout with the design direction's category dot styling and status filters
4. **Term detail** — Implement the two-tier layout with expandable sections for depth content
5. **Proposal form** — Replace field labels with conversational librarian voice copy, add duplicate detection
6. **Mobile responsive** — Implement Spotlight search overlay, collapsible sidebar
7. **Empty states** — Add librarian voice empty states for search, categories, and review queue

## User Journey Flows

### Journey 1: Quick Term Lookup (80% of usage)

**Actor:** Any user, no auth required
**Trigger:** In a meeting, writing a document, or in conversation — needs to confirm terminology
**Design direction:** Search-Hero (A) + Term Detail (C)

**Flow:**

1. **Entry** — User opens Katalyst Lexicon (bookmarked or linked). Lands on search-hero home page. Search input is focused or prominently centered.
2. **Search** — User types their query. After 2+ characters, results appear. On desktop, an instant dropdown below the search input. On mobile, the full-screen Spotlight overlay shows results filling available space.
3. **Scan** — User scans 1-5 results. Status badges (green checkmark = Canonical, amber warning = Deprecated) provide instant confidence signals without clicking.
4. **Select** — User clicks/taps a result. Navigates to term detail page.
5. **Read Tier 1** — Definition, "When to use," "When NOT to use," and synonyms are immediately visible. On mobile, the usage grid stacks to single-column.
6. **Optional: Read Tier 2** — If they need more depth, they expand Examples, Related Principles, or Version History sections.
7. **Optional: Suggest Edit** — If authenticated and the definition seems incomplete or outdated, user can click "Suggest an edit" link to enter the governance flow.
8. **Done** — User returns to their work. No explicit "done" action needed.

**Error path:** No results found → empty state ("We don't have that term yet") → bridges to "Propose this term" CTA.

**Loading state:** Design for the fast path (client-side search), but include a subtle loading indicator (skeleton results or spinner) to gracefully handle future server-side/semantic search latency.

**Key metric:** Under 30 seconds from opening the app to reading the definition.

### Journey 2: Browse by Category (Onboarding Journey)

**Actor:** Any user, no auth — particularly new team members during onboarding
**Trigger:** Exploring terminology in a specific domain, learning the organization's vocabulary
**Design direction:** Sidebar Browse (B)

**Flow:**

1. **Entry** — User clicks "Browse Categories" in navigation or sidebar. For new hires, this is the recommended starting point: "New to the team? Start here."
2. **Scan categories** — Sidebar shows color-coded categories with term counts. User identifies relevant category for their role or domain.
3. **Select category** — User clicks a category. Main area filters to show only terms in that category as a card grid.
4. **Scan terms** — Cards show term name, status badge, definition preview, and freshness signal. User scans visually.
5. **Optional: Filter by status** — Sidebar status filters let them narrow to Canonical-only, or see what's In Review.
6. **Select term** — Clicks a term card. Navigates to term detail page (same as Journey 1, step 5).
7. **Navigate related** — From term detail, user may follow related terms or principles links, creating a natural browsing chain.

**Empty state:** Category with no terms → "This category is waiting for its first terms" with Propose CTA.

### Journey 3: Read Principles

**Actor:** Any user, no auth
**Trigger:** Wants to understand organizational philosophy or context behind vocabulary decisions

**Flow:**

1. **Entry** — User clicks "Principles" in top navigation.
2. **Scan list** — Principles displayed as cards with title, summary, tags, and linked term count.
3. **Select principle** — Clicks a principle card. Full principle page shows title, summary, full markdown body, and linked terms section.
4. **Read content** — User reads the principle's full content (markdown rendered).
5. **Explore linked terms** — Below the principle content, linked terms appear as clickable cards. User can navigate to any related term.
6. **Done** — User returns to principles list or navigates elsewhere.

### Journey 4: Propose New Term

**Actor:** Member (authenticated)
**Trigger:** Encounters a term the team uses that isn't in the lexicon
**Design direction:** Proposal Form (E) + Empty State bridge (D)

**Flow:**

1. **Entry A** — User clicks "+ Propose Term" button in sidebar.
   **Entry B** — User searches, gets "no results" empty state, clicks "Propose this term" (term name pre-filled).
   **Entry C** — User clicks "Suggest an edit" on an existing term detail page (term fields pre-filled for editing).
2. **Progressive form** — Form shows required fields first: term name, category, definition, why it exists, change rationale. An "Add more detail" expander reveals optional fields (when to use, when not to use, good/bad examples, synonyms). This keeps the barrier to contribution low, especially for users coming from the empty state bridge.
3. **Debounced duplicate check** — After the user finishes typing the term name (on blur or after a typing pause, not on every keystroke), system checks for similar existing terms. If found, inline warning: "Heads up — similar term exists" with link to the existing term.
4. **Fill required fields** — Conversational labels guide the user: "What's the term?", "What does this term mean?", "Why does this term exist?"
5. **Optional: Expand and fill optional fields** — User clicks "Add more detail" to add usage guidance, examples, synonyms.
6. **Submit or Save Draft** — "Submit Proposal" sends to review queue. "Save Draft" preserves work for later.
7. **Confirmation** — Success message: "Your proposal has been submitted. You'll be notified when a reviewer takes action."
8. **Track status** — Proposal appears in user's activity or can be found via search with "In Review" badge.

**Error path:** Validation errors shown inline next to specific fields with helpful copy.

### Journey 5: Review and Approve

**Actor:** Approver (authenticated)
**Trigger:** Badge count on "Review Queue" shows pending proposals; future enhancement: email/Slack notification
**Design direction:** Review Queue (G)

**Flow:**

1. **Entry** — Approver sees badge count on "Review Queue" nav item. Clicks it. (Note: in v1, approvers must visit the app to see pending proposals. Email/Slack notifications are a planned future enhancement to prevent proposals sitting unreviewed.)
2. **Scan queue** — List shows pending proposals with: proposal type (New Term / Edit), term name, definition preview, submitter name, timestamp, category.
3. **Select proposal** — Clicks a proposal to open the full review view.
4. **Review content** — Full proposal details displayed: all proposed fields, for edits a diff view showing what changed, submitter's rationale.
5. **Decision** — Three actions available:
   - **Approve** — Term is created/updated, status becomes Canonical, version history entry created
   - **Reject** — Proposal closed with required rejection reason
   - **Request Changes** — Proposal returned to submitter with reviewer comments
6. **Add comment** — Reviewer adds a comment explaining their decision (required for reject/request changes, optional for approve).
7. **Submit decision** — Confirmation: "Proposal approved. 'Retainer' is now a canonical term."
8. **Queue updates** — Badge count decrements. Next proposal ready for review.

**Empty state:** "All caught up" — positive acknowledgment when queue is empty.

### Journey 6: View Version History

**Actor:** Any user
**Trigger:** Wants to understand how a term evolved, or checking when a definition changed

**Flow:**

1. **Entry** — On term detail page, user expands "Version History" in Tier 2.
2. **Scan versions** — Timeline shows version number, date, author, and change summary for each version.
3. **View diff (default)** — By default, each version entry shows what changed (diff view) — the most common use case is "what changed and why?"
4. **Optional: View full snapshot** — User can toggle to see the complete term as it existed at that point in time, for cases where the full context is needed.
5. **Done** — User collapses the section or navigates away.

### Journey 7: Admin User Management

**Actor:** Admin (authenticated)
**Trigger:** New team member needs access, or role change required

**Flow:**

1. **Entry** — Admin navigates to Settings > Team Management.
2. **View users** — User list shows name, email, role, and last active date.
3. **Add/Edit** — Admin invites new user or edits existing user's role (Member / Approver / Admin).
4. **Save** — Changes take effect immediately. Confirmation displayed.

### Journey Patterns

**Navigation patterns:**
- **Search-first entry** — Home page search is the primary entry point for the Lookup Job. Every page also has a header search bar for quick re-searches.
- **Breadcrumb navigation** — Term detail pages show breadcrumb (Browse > Category > Term) for orientation and back-navigation.
- **Single-click depth** — One click from any term card (in browse, search results, or recent updates) goes directly to the full term detail page.

**Feedback patterns:**
- **Instant search with graceful loading** — Results appear as the user types (after 2+ characters), no submit button needed. A subtle loading state handles future server-side search latency without disrupting the experience.
- **Status badges everywhere** — Every term reference (cards, search results, detail pages) shows the status badge so users always know if they're looking at a Canonical term or a Draft.
- **Freshness signals everywhere** — "Updated 2 days ago by Sarah" appears on term cards and detail pages, building trust that the lexicon is actively maintained.
- **Confirmation messages** — All state-changing actions (submit proposal, approve, reject) show clear confirmation with next steps.

**Bridge patterns:**
- **Lookup → Governance bridge (empty state)** — Empty search results bridge to "Propose this term." This is the primary growth loop for missing terms.
- **Lookup → Governance bridge (edit)** — Term detail pages include "Suggest an edit" for authenticated users. This is the primary growth loop for improving existing terms.
- **Browse → Governance bridge** — Empty categories bridge to "Propose the first term."

### Flow Optimization Principles

1. **Minimize steps to value** — Lookup Job: 3 interactions (open → search → read). No extra clicks, no login walls for reading.
2. **Progressive authentication** — Browsing and searching require no auth. Auth only prompted when the user tries to propose or review.
3. **Progressive form disclosure** — Proposal form shows required fields only by default; optional fields behind "Add more detail" expander. Keeps contribution barrier low.
4. **Pre-fill when possible** — When bridging from search to proposal, pre-fill the term name. When bridging from category, pre-fill the category. When suggesting an edit, pre-fill all existing fields.
5. **Debounced server interactions** — Duplicate detection triggers on blur or typing pause, not every keystroke. Prevents unnecessary server load.
6. **Inline validation** — Form errors shown next to the field, not at the top of the form. Duplicate detection is immediate, not on submit.
7. **Minimal decision points** — Reduce choices at each step. Search results show the most relevant matches first. Review queue shows oldest proposals first.
8. **Clear success signals** — After every state-changing action, confirm what happened and what happens next.
9. **Mobile-aware layouts** — Term detail usage grid stacks to single-column on mobile. Search uses full-screen Spotlight overlay. Sidebar collapses.
10. **Notification gap acknowledged** — v1 relies on badge counts for approver awareness. Email/Slack notifications planned as future enhancement to prevent review backlog.
