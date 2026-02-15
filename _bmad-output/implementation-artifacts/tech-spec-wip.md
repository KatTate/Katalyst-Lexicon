---
title: 'Katalyst Lexicon Chrome Extension'
slug: 'katalyst-lexicon-chrome-extension'
created: '2026-02-15'
status: 'in-progress'
stepsCompleted: [1, 2]
tech_stack:
  - 'Chrome Extension Manifest V3'
  - 'JavaScript (ES modules)'
  - 'Chrome APIs: storage, identity, sidePanel, contextMenus, alarms, notifications, scripting'
  - 'Shadow DOM for content script UI isolation'
  - 'Existing Katalyst Lexicon API: Express 4.21 + PostgreSQL (Neon) + Drizzle ORM 0.39'
  - 'Replit Auth (OIDC) — existing session-based auth for the web app'
files_to_modify:
  - 'server/routes.ts — add GET /api/terms/index endpoint, add CORS middleware for extension origin'
  - 'server/storage.ts — add getTermIndex() method to IStorage interface and DatabaseStorage'
  - 'server/index.ts — add CORS middleware before routes'
  - 'extension/ — entire new directory (manifest, service worker, popup, side panel, options, content script, shared utilities)'
code_patterns:
  - 'Backend: IStorage interface → DatabaseStorage implementation → thin routes with Zod validation'
  - 'Backend: requirePermission() / isAuthenticated middleware for auth enforcement'
  - 'Backend: Express session via connect-pg-simple, Replit OIDC, domain restriction via ALLOWED_EMAIL_DOMAIN env var'
  - 'Extension: Service worker as central message router (all API calls go through background script)'
  - 'Extension: Shadow DOM for in-page UI (clipper, tooltips) to avoid CSS conflicts'
  - 'Extension: chrome.storage.managed for admin-configured settings, chrome.storage.sync for user preferences'
test_patterns:
  - 'Playwright E2E tests for web app features (existing in tests/e2e/)'
  - 'Extension testing: manual load via chrome://extensions, limited Playwright applicability for extension UIs'
  - 'Backend endpoint testing: curl/API integration tests for new /api/terms/index endpoint'
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
- New backend CORS configuration to allow extension cross-origin requests
- New backend extension auth middleware for Chrome Identity-based requests
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

**Backend (Express + Drizzle + PostgreSQL):**

- All database operations go through the `IStorage` interface in `server/storage.ts`. The `DatabaseStorage` class implements it using Drizzle ORM queries. Routes in `server/routes.ts` are thin — they validate input with Zod, delegate to storage, and return JSON.
- Auth uses Replit OIDC via Passport.js with session cookies stored in PostgreSQL (`connect-pg-simple`). Sessions are `httpOnly` and `secure`. The `isAuthenticated` middleware checks the OIDC session and refreshes tokens if expired. The `requirePermission()` middleware looks up the user in the `users` table and checks role-based permissions.
- Domain restriction: the `ALLOWED_EMAIL_DOMAIN` env var (default: `@katgroupinc.com`) validates email domains during OIDC callback.
- **No CORS is currently configured** — the Express server only serves its own React frontend. This is the #1 backend change required.

**Extension (Manifest V3 — new code):**

- The prototype follows a clean architecture: service worker as central message router, separate popup/sidepanel/options pages, content script for in-page features.
- All API calls from popup/sidepanel/options go through `chrome.runtime.sendMessage()` → service worker → `api-client.js` → fetch to backend. This centralizes error handling and keeps the service worker as the single point of API interaction.
- Content script uses Shadow DOM for the clipper UI to avoid CSS conflicts with host pages.
- Shared constants (`MSG`, `STORAGE_KEYS`, `STATUS_COLORS`, etc.) in `shared/constants.js` ensure consistency across all extension components.

**Key data models consumed by the extension:**

- `Term`: id, name, category, definition, whyExists, usedWhen, notUsedWhen, examplesGood[], examplesBad[], synonyms[], status, visibility, owner, version, updatedAt
- `Category`: id, name, description, color, sortOrder
- `Proposal`: id, termId, termName, category, type, status, submittedBy, definition, whyExists, usedWhen, notUsedWhen, examplesGood[], examplesBad[], synonyms[], reviewComment, submittedAt, changesSummary
- `Principle`: id, title, slug, summary, body, status, visibility, owner, tags[], sortOrder

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `server/routes.ts` | All API routes — read endpoints are public, write endpoints require auth |
| `server/storage.ts` | `IStorage` interface + `DatabaseStorage` — all DB operations |
| `server/index.ts` | Express setup, session config, auth init — where CORS middleware goes |
| `server/middleware/auth.ts` | `requireRole()`, `requirePermission()`, `optionalAuth` middleware |
| `server/replit_integrations/auth/replitAuth.ts` | Replit OIDC setup, session management, domain validation |
| `shared/schema.ts` | Drizzle table definitions, Zod insert schemas, TypeScript types |
| `shared/permissions.ts` | Role-permission matrix (Member, Approver, Admin) |
| `attached_assets/manifest_*.json` | Prototype extension manifest |
| `attached_assets/service-worker_*.js` | Prototype service worker (message router, alarms, context menus) |
| `attached_assets/api-client_*.js` | Prototype API client (fetch wrapper) |
| `attached_assets/popup_*.{html,js,css}` | Prototype popup UI |
| `attached_assets/sidepanel_*.{html,js,css}` | Prototype side panel UI (browse, search, principles, term detail) |
| `attached_assets/options_*.{html,js,css}` | Prototype options page |
| `attached_assets/content-script_*.js` | Prototype content script (clipper only) |
| `attached_assets/constants_*.js` | Shared constants (MSG types, storage keys, status colors) |
| `attached_assets/utils_*.js` | Shared utilities (messaging, DOM helpers, formatting, markdown) |
| `attached_assets/DEPLOYMENT_*.md` | Google Workspace deployment guide |

### Technical Decisions

**1. Authentication Strategy (CRITICAL)**

The existing backend uses Replit OIDC session cookies (`httpOnly`, `secure`). The Chrome extension runs from `chrome-extension://` origin, so it **cannot** share these cookies. Solution:

- **Read operations** (GET terms, categories, principles, search): Already public endpoints, no auth needed. Just need CORS headers.
- **Write operations** (POST proposals): Use `chrome.identity.getProfileUserInfo()` to get the user's Google Workspace email. Send it as `X-Extension-User-Email` header. Backend validates the domain matches `@katgroupinc.com` and looks up or creates the user.
- **Extension identification**: Include a custom header `X-Extension-Id` with the extension's ID. The backend can optionally allowlist the extension ID for additional trust.
- **Trust boundary**: Since the extension is only installable by Workspace users (force-installed via admin console), the trust model is: "if you have the extension, you're a Katalyst team member."

**2. CORS Configuration**

Add CORS middleware to `server/index.ts` that allows:
- Origin: `chrome-extension://*` (or specific extension ID after publishing)
- Methods: GET, POST
- Headers: Content-Type, X-Extension-User-Email, X-Extension-Id
- No credentials needed (extension doesn't use cookies)

**3. Extension Auth Middleware**

New middleware in `server/middleware/extensionAuth.ts` that:
- Checks for `X-Extension-User-Email` header
- Validates email domain against `ALLOWED_EMAIL_DOMAIN`
- Looks up user by email in the database (creates if not found, with "Member" role)
- Attaches `req.dbUser` for downstream route handlers
- Used as an alternative to `isAuthenticated` for extension-originated requests

**4. Managed Storage for Zero-Config**

- `extension/managed_schema.json` defines `apiBaseUrl` as a managed property
- Manifest references it via `"storage": { "managed_schema": "managed_schema.json" }`
- Options page reads `chrome.storage.managed` first, falls back to `chrome.storage.sync`
- Google Workspace admin sets the value: `{"apiBaseUrl": {"Value": "https://katalyst-lexicon.replit.app"}}`

**5. Term Index Cache for Highlighting**

- New backend endpoint: `GET /api/terms/index` returns `[{id, name, synonyms}]` — lightweight (~1KB for 100 terms)
- Service worker fetches on install/update, then every 30 minutes via `chrome.alarms`
- Stored in `chrome.storage.local` as `{termIndex: [...], lastUpdated: timestamp}`
- Content script reads from `chrome.storage.local` on page load
- Matching uses case-insensitive word-boundary matching to avoid partial matches

**6. Content Script Architecture**

Single content script handles three responsibilities:
- **Term highlighting**: Scans visible text, wraps matches in `<span class="kl-highlight">`, shows tooltip on hover
- **Clipper overlay**: Shadow DOM form for proposing terms, triggered by context menu or popup button
- **Message listener**: Responds to service worker messages (SHOW_CLIPPER, GET_SELECTION)

Performance guardrails:
- Use `TreeWalker` to traverse only text nodes
- Skip `<input>`, `<textarea>`, `<code>`, `<pre>`, `<script>`, `<style>`, `[contenteditable]`
- Scan only visible viewport using `IntersectionObserver`
- Debounce rescans on scroll/DOM mutations (500ms)
- Per-site toggle stored in `chrome.storage.sync` keyed by hostname

**7. Notification Strategy**

- Service worker polls `GET /api/proposals?status=pending` every N minutes via `chrome.alarms`
- Sets badge count on extension icon
- Desktop notification when new proposals appear (comparing to last known count)
- Clicking notification opens the web app review page in a new tab (not the extension side panel)
- Notifications only work if the extension has obtained the user's email (for authenticated request to proposals endpoint)

**8. Review Queue Removed**

The review queue was removed from the extension scope. Approvers use the full web app for reviewing proposals. The extension only shows notification badges to alert approvers that proposals are pending.

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
- The prototype's review queue code (in sidepanel.js) should be stripped out and replaced with a simple "N proposals pending" notice that links to the web app
- The `proposals` endpoint requires auth — the extension will need the extension auth middleware to poll for pending proposal count (for notifications)
