---
story_key: 2-2
title: "Version History in Term Detail"
epic: "Epic 2: Term Detail Experience"
size: M
status: ready-for-dev
---

# Story 2.2: Version History in Term Detail

As a user exploring a term,
I want to view how its definition has changed over time with author and timestamp,
So that I understand the term's evolution and can trust it reflects current organizational thinking.

## Acceptance Criteria

**Given** I am on a term detail page with version history
**When** I expand the "Version History" Tier 2 section
**Then** I see a chronological list of versions, most recent first
**And** each version entry shows: version number, author name, date, and change notes

**Given** there are two or more versions
**When** I view the version list
**Then** I can see what changed between versions by reading the change notes
**And** the current version is visually marked (e.g., "Current" badge)

**Given** a version entry exists
**When** I click "View full snapshot" on a past version
**Then** I see the complete term definition, usage guidance, and metadata as it existed at that version

**Given** a term has only one version (just created)
**When** I expand "Version History"
**Then** I see a single entry marked as "v1 — Original" with the creation date and author

**Given** I am using a screen reader
**When** I navigate the version list
**Then** each version entry is announced with its version number, author, and date

## Dev Notes

- Endpoint: `GET /api/terms/:id/versions` returns version array sorted by version number descending
- Version snapshot view could be a modal or inline expansion — keep it simple for MVP
- `data-testid="version-entry-{versionNumber}"` on each version row
- Change notes field may be empty for early versions — display "No change notes" in muted text

## Dev Agent Record

- Agent Model Used: Claude 4.6 Opus
- Completion Notes: (pending)
- File List: (pending)
- LSP Status: (pending)
- Visual Verification: (pending)
