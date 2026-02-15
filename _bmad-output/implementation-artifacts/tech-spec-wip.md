---
title: 'Katalyst Lexicon Chrome Extension'
slug: 'katalyst-lexicon-chrome-extension'
created: '2026-02-15'
status: 'in-progress'
stepsCompleted: [1]
tech_stack:
  - 'Chrome Extension Manifest V3'
  - 'JavaScript (ES modules)'
  - 'Chrome APIs (storage, identity, sidePanel, contextMenus, alarms, notifications, scripting)'
  - 'Shadow DOM (content script isolation)'
  - 'Existing Katalyst Lexicon API (Express + PostgreSQL)'
files_to_modify: []
code_patterns: []
test_patterns: []
---

# Tech-Spec: Katalyst Lexicon Chrome Extension

**Created:** 2026-02-15

## Overview

### Problem Statement

The Katalyst Lexicon web app contains valuable organizational vocabulary, but team members don't use it because it requires leaving their current workflow to visit a separate website. The lexicon needs to be embedded where people already work — in the browser — to become the ambient knowledge layer the team actually relies on.

### Solution

Build a Chrome extension (Manifest V3) that brings the full lexicon experience into the browser — quick search via popup, deep browsing via side panel, contextual term proposals via in-page clipper, and ambient term discovery via inline highlighting and hover tooltips. Force-installed across the organization via Google Workspace with zero user configuration required.

### Scope

**In Scope:**

- Popup with search, recent terms, and highlighting toggle
- Side panel with Browse, Search, and Principles tabs plus full term detail view
- Right-click context menus ("Search Lexicon for..." and "Propose as Lexicon Term")
- In-page clipper overlay (Shadow DOM isolated) for proposing new terms
- Ambient discovery: automatic term highlighting on web pages with hover tooltips showing definitions
- Per-site highlighting toggle
- Local term index cache with periodic refresh strategy
- Notification polling + badge count for pending proposals (clicking opens web app, not in-extension review)
- Chrome Identity API for user identification on write operations (proposals)
- Zero-config install via `storage.managed_schema.json` and Google Workspace policy
- New backend endpoint `GET /api/terms/index` for lightweight term name/synonym index
- Extension source code in `extension/` directory within the existing repo
- Google Workspace deployment guide (already drafted)

**Out of Scope:**

- Review queue in the extension (approvers use the full web app)
- Full OAuth2 authentication flow
- Inline editing of terms from the extension
- Mobile browser support
- Firefox or other browser support

## Context for Development

### Codebase Patterns

{codebase_patterns}

### Files to Reference

| File | Purpose |
| ---- | ------- |

{files_table}

### Technical Decisions

- **Authentication**: Chrome Identity API (`chrome.identity.getProfileUserInfo()`) provides user email/name. Read operations are unauthenticated. Write operations (proposals) send identity as a request header; backend validates `@katgroupinc.com` domain.
- **Managed Storage**: `storage.managed_schema.json` defines `apiBaseUrl` as admin-configurable. Options page reads `chrome.storage.managed` first, falls back to `chrome.storage.sync`. Google Workspace admin sets the value via extension policy JSON.
- **Content Script Scope**: `<all_urls>` — the clipper and highlighting need to work on any page. Content script is lightweight; highlighting only activates when toggled on.
- **Term Index Cache**: Service worker fetches lightweight term index on install/update, refreshes every 30 minutes via alarm. Stored in `chrome.storage.local`. New `GET /api/terms/index` endpoint returns `[{id, name, synonyms}]`.
- **DOM Mutation Safety**: Highlighting wraps matched terms in `<span>` elements. Must skip `<input>`, `<textarea>`, `<code>`, and `contenteditable` elements. Use `IntersectionObserver` for visibility-based scanning. Per-site toggle stored in `chrome.storage.sync`.
- **Review Queue**: Removed from extension. Notifications link directly to the web app's review page.

## Acceptance Criteria

{acceptance_criteria}

## Implementation Guidance

### Architecture Patterns to Follow

{architecture_patterns}

### Anti-Patterns and Constraints

{anti_patterns}

### File Change Summary

{file_change_summary}

### Dependencies

{dependencies}

### Testing Guidance

{testing_guidance}

### Notes

- Early prototype files available in `attached_assets/` as reference for UI structure, styling, and API client patterns
- Deployment guide already drafted in `attached_assets/DEPLOYMENT_1771178370051.md`
- Extension icons (16, 32, 48, 128px) already available in `attached_assets/`
