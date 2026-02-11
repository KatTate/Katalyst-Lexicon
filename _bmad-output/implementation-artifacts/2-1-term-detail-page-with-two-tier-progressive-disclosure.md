---
story_key: 2-1
title: "Term Detail Page with Two-Tier Progressive Disclosure"
epic: "Epic 2: Term Detail Experience"
size: L
status: in-progress
---

# Story 2.1: Term Detail Page with Two-Tier Progressive Disclosure

As a user who found a term through search or browsing,
I want to see its full definition, usage guidance, and metadata in a clear, scannable layout,
So that I get the answer I need immediately and can explore deeper context if I want.

## Acceptance Criteria

**Given** I navigate to a term detail page (e.g., by clicking a search result)
**When** the page loads
**Then** I see breadcrumb navigation showing: Home > {Category} > {Term Name}

**Given** I am viewing a term detail page
**When** I look at the Tier 1 (always visible) section
**Then** I see the term name as the page heading
**And** the status badge (Canonical/Draft/In Review/Deprecated)
**And** the category tag
**And** the full definition
**And** usage guidance (when provided) in a distinct section with clear formatting
**And** the freshness signal ("Updated 3 days ago") and version badge ("v4")

**Given** the term has a "Why it exists" explanation
**When** I view Tier 1
**Then** it appears below the definition as a brief contextual note

**Given** the term has synonyms
**When** I view Tier 1
**Then** synonyms are displayed as inline tags/chips

**Given** I am viewing a term detail page
**When** I look below Tier 1
**Then** I see collapsible Tier 2 sections that are collapsed by default: "Examples", "Version History", "Related Principles"

**Given** a Tier 2 section exists (e.g., "Examples")
**When** I click the section header
**Then** it expands to reveal its content
**And** other Tier 2 sections remain in their current state (independent toggles)

**Given** the term has good examples and bad examples
**When** I expand the "Examples" section
**Then** I see good examples with a green indicator and bad examples with a red indicator
**And** each example has clear formatting distinguishing it from prose

**Given** I am using a screen reader
**When** I navigate the page
**Then** the page has a logical heading hierarchy (h1 for term name, h2 for sections)
**And** Tier 2 sections use `aria-expanded` to communicate their state
**And** all interactive elements have accessible labels

**Given** the term is in "Deprecated" status
**When** I view the detail page
**Then** I see an amber banner at the top of the page with the text "This term has been deprecated"
**And** if a replacement term exists, the banner includes a link: "See {replacement term name} instead"

**Given** I want to suggest an improvement
**When** I see the "Suggest an edit" link on the page
**Then** clicking it navigates me to the proposal form with all current term fields pre-filled

## Dev Notes

- TierSection component: collapsible with `aria-expanded`, smooth transition (respects `prefers-reduced-motion`)
- UsageGuidance component: distinct formatting (e.g., background, border-left accent) to separate from definition
- Breadcrumb: derived from route context + term's category, uses `nav` element with `aria-label="Breadcrumb"`
- Page title: "{Term Name} — Katalyst Lexicon" (AR14)
- "Suggest an edit" link: `GET /api/terms/:id` fetches full data, navigates to `/propose?editTermId={id}` (AR19)
- `data-testid` on: breadcrumb, term name, status badge, definition, usage guidance, each Tier 2 toggle, deprecated banner, suggest-edit link

## Dev Agent Record

- Agent Model Used: Claude 4.6 Opus
- Completion Notes: (pending)
- File List: (pending)
- LSP Status: (pending)
- Visual Verification: (pending)
