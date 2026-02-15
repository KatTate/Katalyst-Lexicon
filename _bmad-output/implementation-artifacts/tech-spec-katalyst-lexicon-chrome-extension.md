---
title: 'Katalyst Lexicon Chrome Extension'
slug: 'katalyst-lexicon-chrome-extension'
created: '2026-02-15'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack:
  - 'Chrome Extension Manifest V3'
  - 'JavaScript (ES modules)'
  - 'Chrome APIs: storage, identity, sidePanel, contextMenus, alarms, notifications, scripting'
  - 'Shadow DOM for content script UI isolation'
  - 'Existing Katalyst Lexicon API: Express 4.21 + PostgreSQL (Neon) + Drizzle ORM 0.39'
  - 'Replit Auth (OIDC) — existing session-based auth for the web app'
files_to_modify:
  - 'server/routes.ts — add GET /api/terms/index endpoint with ETag support'
  - 'server/storage.ts — add getTermIndex() method to IStorage interface and DatabaseStorage'
  - 'server/index.ts — add CORS middleware before routes'
  - 'server/middleware/extensionAuth.ts — new file: extension auth middleware'
  - 'extension/ — entire new directory (manifest, service worker, popup, side panel, options, content script, shared utilities)'
code_patterns:
  - 'Backend: IStorage interface → DatabaseStorage implementation → thin routes with Zod validation'
  - 'Backend: requirePermission() / isAuthenticated middleware for auth enforcement'
  - 'Backend: Express session via connect-pg-simple, Replit OIDC, domain restriction via ALLOWED_EMAIL_DOMAIN env var'
  - 'Extension: Service worker as central message router (all API calls go through background script)'
  - 'Extension: Shadow DOM for in-page UI (clipper, tooltips) to avoid CSS conflicts'
  - 'Extension: chrome.storage.managed for admin-configured settings, chrome.storage.sync for user preferences'
  - 'Extension: All state via chrome.storage — never module-level variables (MV3 ephemeral service worker)'
  - 'Extension: Typed message constants via MSG object for all chrome.runtime.sendMessage calls'
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

**Feature Tiers (Implementation Priority):**

- **Tier 1 — Must Ship:** Term highlighting + hover tooltips (ambient discovery), popup search, context menus ("Search Lexicon for..." / "Propose as Lexicon Term"), managed storage config, backend CORS + extension auth middleware, `/api/terms/index` endpoint
- **Tier 2 — Ship If Time:** Side panel browsing (Browse, Search, Principles tabs, term detail view), options page
- **Tier 3 — Fast Follow:** In-page clipper overlay, notification polling + badge count

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
- Shared constants (`MSG`, `STORAGE_KEYS`, `STATUS_COLORS`, etc.) in `shared/constants.js` ensure consistency across all extension components. **Every `chrome.runtime.sendMessage` call must use a typed action constant from the `MSG` object** — untyped messages are a debugging nightmare in extensions.

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
| `server/replit_integrations/auth/storage.ts` | `upsertUser` pattern — reuse for extension auth |
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
- Origin: `chrome-extension://<EXTENSION_ID>` (pin to published extension ID in production; use wildcard `chrome-extension://*` only during development)
- Methods: GET, POST
- Headers: Content-Type, X-Extension-User-Email, X-Extension-Id
- No credentials needed (extension doesn't use cookies)
- **Security note:** CORS only prevents browser-originated cross-origin requests. The `X-Extension-User-Email` header is spoofable via non-browser HTTP clients (curl, Postman). This is acceptable for an internal tool behind a corporate network with force-installed extension, but the tradeoff should be documented.

**3. Extension Auth Middleware**

New middleware in `server/middleware/extensionAuth.ts` that:
- Checks for `X-Extension-User-Email` header
- Validates email domain against `ALLOWED_EMAIL_DOMAIN`
- Looks up user by email in the database (creates if not found, with "Member" role)
- **Must reuse the existing `upsertUser` pattern** from `replitAuth.ts` to prevent duplicate user records when someone uses both the web app and extension
- Attaches `req.dbUser` for downstream route handlers
- Used as an alternative to `isAuthenticated` for extension-originated requests

**4. Managed Storage for Zero-Config**

- `extension/managed_schema.json` defines `apiBaseUrl` as a managed property
- Manifest references it via `"storage": { "managed_schema": "managed_schema.json" }`
- Options page reads `chrome.storage.managed` first, falls back to `chrome.storage.sync`
- Google Workspace admin sets the value: `{"apiBaseUrl": {"Value": "https://katalyst-lexicon.replit.app"}}`

**5. Term Index Cache for Highlighting**

- New backend endpoint: `GET /api/terms/index` returns `[{id, name, synonyms}]` — lightweight (~1KB for 100 terms)
- **ETag/If-None-Match support** on this endpoint for conditional requests — saves bandwidth when lexicon hasn't changed (which is most of the time)
- Service worker fetches on install/update, then every 30 minutes via `chrome.alarms`
- Stored in `chrome.storage.local` as `{termIndex: [...], lastUpdated: timestamp, etag: string}`
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
- **Skip nodes inside foreign Shadow DOMs**: guard with `if (node.getRootNode() !== document) skip` to avoid unexpected behavior on pages with open Shadow roots
- Scan only visible viewport using `IntersectionObserver`
- Debounce rescans on scroll/DOM mutations (500ms) with a **hard cap of 1 scan per 2 seconds** to prevent CPU burn on mutation-heavy SPAs (Slack, Google Docs)
- Per-site toggle stored in `chrome.storage.sync` keyed by hostname

**CRITICAL: MV3 Service Worker Lifecycle**
- Chrome kills MV3 service workers after ~30 seconds of inactivity
- **All state must go through `chrome.storage`** — never use module-level variables for persistent state
- Alarms, message listeners, and context menu handlers re-register on service worker activation
- The prototype may have in-memory state patterns — these must be converted to `chrome.storage`

**7. Notification Strategy**

- Service worker polls `GET /api/proposals?status=pending` every N minutes via `chrome.alarms`
- Sets badge count on extension icon
- Desktop notification when new proposals appear (comparing to last known count)
- Clicking notification opens the web app review page in a new tab (not the extension side panel)
- Notifications only work if the extension has obtained the user's email (for authenticated request to proposals endpoint)

**8. Review Queue Removed**

The review queue was removed from the extension scope. Approvers use the full web app for reviewing proposals. The extension only shows notification badges to alert approvers that proposals are pending.

## Acceptance Criteria

### Tier 1 — Must Ship

**AC-1: Backend CORS allows extension requests**
- Given a Chrome extension making a GET request to `/api/terms`, when the request includes `Origin: chrome-extension://<id>`, then the response includes `Access-Control-Allow-Origin` matching the extension origin and the response body contains term data.
- Given a Chrome extension making a preflight OPTIONS request, when the request includes `Access-Control-Request-Headers: X-Extension-User-Email`, then the response includes the header in `Access-Control-Allow-Headers`.

**AC-2: Backend `/api/terms/index` endpoint returns lightweight term index**
- Given terms exist in the database, when a GET request is made to `/api/terms/index`, then the response is a JSON array of objects with only `id`, `name`, and `synonyms` fields.
- Given the same term data, when the request includes `If-None-Match` matching the current ETag, then the response is `304 Not Modified` with no body.
- Given term data has changed since the last ETag, when the request includes an outdated `If-None-Match`, then the response is `200 OK` with the updated index and a new `ETag` header.

**AC-3: Extension auth middleware authenticates via email header**
- Given a POST request to `/api/proposals` with `X-Extension-User-Email: user@katgroupinc.com`, when the user exists in the database, then `req.dbUser` is populated with that user and the route handler executes normally.
- Given a POST request with `X-Extension-User-Email: user@katgroupinc.com`, when the user does NOT exist in the database, then a new user is created with role "Member" and `req.dbUser` is populated.
- Given a POST request with `X-Extension-User-Email: user@otherdomain.com`, then the response is `403 Forbidden` with an appropriate error message.
- Given a POST request with no `X-Extension-User-Email` header, then the middleware falls through to the existing OIDC session auth (no disruption to web app).

**AC-4: Popup search returns results from the API**
- Given the extension popup is open and the user types "brand" into the search field, when at least 2 characters are entered, then matching terms appear as a list below the search input within 500ms.
- Given the popup shows search results, when the user clicks a term, then the side panel opens showing the full term detail.
- Given the popup is open, when the user has not typed anything, then the popup shows recently viewed terms (from `chrome.storage.local`) or an empty state message.

**AC-5: Highlighting toggle works per-site**
- Given the popup is open, when the user toggles "Enable Highlighting" ON, then the content script scans the current page and highlights matching terms with a visible background color.
- Given highlighting is enabled, when the user hovers over a highlighted term, then a tooltip appears showing the term's definition, category, and a "View full details" link.
- Given highlighting is enabled on `example.com`, when the user navigates to `other.com`, then highlighting state is independent — it respects the per-site toggle stored in `chrome.storage.sync`.
- Given the user toggles highlighting OFF, then all `<span class="kl-highlight">` elements on the page are unwrapped (restored to original text nodes) without losing page content.

**AC-6: Term highlighting matches correctly and performs safely**
- Given a page containing the text "We use Brand Voice in all communications", when "Brand Voice" is a term in the index, then "Brand Voice" is highlighted but not partial matches like "Brand" alone (unless "Brand" is also a separate term).
- Given a page with `<input>`, `<textarea>`, `<code>`, `<pre>`, `<script>`, `<style>`, or `[contenteditable]` elements, then the content script never modifies text inside these elements.
- Given a mutation-heavy SPA page (e.g., Slack), when many DOM mutations fire rapidly, then the content script rescans no more than once per 2 seconds.

**AC-7: Context menus appear and route correctly**
- Given any web page, when the user right-clicks selected text, then "Search Lexicon for '[selected text]'" appears in the context menu.
- Given the user clicks "Search Lexicon for '[text]'", then the side panel opens with the search tab pre-filled with the selected text.
- Given any web page, when the user right-clicks selected text, then "Propose as Lexicon Term" appears in the context menu.
- Given the user clicks "Propose as Lexicon Term", then the clipper overlay (Tier 3) opens with the term name pre-filled, OR (if clipper not yet built) the side panel opens to a "propose" form.

**AC-8: Managed storage provides zero-config API URL**
- Given the extension is force-installed with a managed policy setting `apiBaseUrl`, when the extension loads, then all API calls use that URL with no user action required.
- Given no managed policy is set, when the extension loads, then it falls back to `chrome.storage.sync` (set via options page) or a hardcoded default.

**AC-9: Service worker manages term index cache**
- Given the extension is installed, when the `onInstalled` event fires, then the service worker fetches `/api/terms/index` and stores the result in `chrome.storage.local`.
- Given the `REFRESH_TERM_INDEX` alarm fires (every 30 minutes), when the service worker is alive, then it fetches `/api/terms/index` with `If-None-Match` and only updates storage if data changed (200 response).
- Given the service worker was killed and restarted, then it re-registers alarms and message listeners without losing cached data (data is in `chrome.storage.local`, not in-memory).

### Tier 2 — Ship If Time

**AC-10: Side panel shows Browse, Search, and Principles tabs**
- Given the side panel is open, when the user clicks the "Browse" tab, then all terms are displayed grouped by category with category headers and counts.
- Given the side panel is open, when the user clicks the "Search" tab and types a query, then results appear from the `/api/terms/search` endpoint, ranked by relevance.
- Given the side panel is open, when the user clicks the "Principles" tab, then all published principles are displayed with their titles, summaries, and linked term counts.
- Given the user clicks a term in any tab, then the side panel navigates to a detail view showing all term fields (definition, why it exists, when to use, when not to use, good/bad examples, synonyms, category, status, version).

**AC-11: Options page allows manual API URL configuration**
- Given the options page is open, when the user enters a new API URL and clicks Save, then the URL is stored in `chrome.storage.sync` and used for subsequent API calls.
- Given a managed policy sets `apiBaseUrl`, when the options page loads, then the API URL field shows the managed value and is either read-only or indicates it's admin-controlled.

### Tier 3 — Fast Follow

**AC-12: Clipper overlay enables term proposals**
- Given the user triggers "Propose as Lexicon Term" (via context menu or popup), then a Shadow DOM overlay appears on the page with fields for: term name (pre-filled if text was selected), category (dropdown from API), definition, why it exists, when to use/not use, examples, synonyms, and a summary of changes.
- Given the user fills out the clipper form and clicks Submit, then a POST request to `/api/proposals` is sent with `X-Extension-User-Email` header and the overlay closes with a success message.
- Given the API returns a validation error, then the clipper displays the error inline without closing.
- Given the user clicks Cancel or presses Escape, then the clipper overlay closes without submitting.

**AC-13: Notification polling alerts approvers**
- Given the user's email is available (via `chrome.identity`), when the `CHECK_PROPOSALS` alarm fires, then the service worker fetches `GET /api/proposals?status=pending` with auth headers.
- Given there are N pending proposals and the last known count was less than N, then a Chrome notification is shown: "N proposals need review" and the badge shows the count.
- Given the user clicks the notification, then a new tab opens to the web app's review page.

## Implementation Guidance

### Architecture Patterns to Follow

**Backend changes:**
- Follow the existing `IStorage` interface pattern: add `getTermIndex()` to the interface, implement it in `DatabaseStorage`, call it from a thin route.
- CORS middleware goes in `server/index.ts` BEFORE `setupAuth(app)` (line 65) so it applies to all routes including preflight OPTIONS.
- Extension auth middleware follows the same pattern as `requirePermission()` in `server/middleware/auth.ts` — check header, look up user, attach `req.dbUser`, call `next()`.
- For routes that need to accept EITHER session auth OR extension auth, create a combined middleware: `requireAuthOrExtension()` that tries OIDC session first, falls back to extension email header.

**Extension architecture:**
- Mirror the prototype's file structure: `extension/manifest.json`, `extension/service-worker.js`, `extension/popup/`, `extension/sidepanel/`, `extension/options/`, `extension/content/`, `extension/shared/`.
- Service worker is the **sole API caller** — popup/sidepanel/content script send messages via `chrome.runtime.sendMessage({ action: MSG.SEARCH_TERMS, query })`, service worker handles them and sends responses.
- All UI pages (popup, sidepanel, options) use vanilla HTML/CSS/JS — no framework. The prototype demonstrates this pattern.
- Content script injects a Shadow DOM host element for any UI (tooltips, clipper). All extension CSS stays inside the Shadow DOM to avoid conflicts.
- Use the `MSG` constants object for all message types. Add new message types as needed but always in `shared/constants.js`.

**Naming conventions:**
- Extension files: kebab-case (`service-worker.js`, `api-client.js`, `content-script.js`)
- Constants: SCREAMING_SNAKE_CASE (`MSG.SEARCH_TERMS`, `STORAGE_KEYS.TERM_INDEX`)
- CSS classes in content script: prefix with `kl-` (`kl-highlight`, `kl-tooltip`, `kl-clipper`)
- Backend files: camelCase matching existing patterns (`extensionAuth.ts`)

### Anti-Patterns and Constraints

**DO NOT:**
- Store any state in service worker module-level variables. Chrome kills MV3 service workers after ~30s of inactivity. All state goes through `chrome.storage`.
- Use `manifest_version: 2`. This extension is MV3 only.
- Modify text inside `<input>`, `<textarea>`, `<code>`, `<pre>`, `<script>`, `<style>`, or `[contenteditable]` elements during highlighting.
- Enter foreign Shadow DOMs during TreeWalker traversal. Guard: `node.getRootNode() !== document`.
- Scan the DOM more than once per 2 seconds, even if MutationObserver fires continuously.
- Use `chrome.identity.getAuthToken()` — we're using `getProfileUserInfo()` which doesn't require OAuth setup.
- Add a `cors` npm package. The CORS middleware is 10 lines of custom code — no dependency needed.
- Modify the existing OIDC auth flow. The extension auth middleware is additive, not a replacement.
- Use `eval()`, `new Function()`, or inline scripts in the extension — MV3 CSP forbids them.
- Build a review queue in the extension. Approvers use the full web app.

**Files NOT to modify (unless adding CORS/routes):**
- `server/replit_integrations/auth/replitAuth.ts` — do not change the OIDC flow
- `shared/schema.ts` — no new tables needed for the extension
- `client/` — the web app frontend is unchanged
- `server/seed.ts` — no seed data changes needed

**Performance constraints:**
- Popup must render search results within 500ms of typing.
- Term index cache refresh must use conditional requests (ETag) to minimize bandwidth.
- Content script highlighting scan must complete within 100ms for pages with <1000 text nodes.
- Content script must not increase page memory usage by more than 5MB (term index + highlight spans).

### File Change Summary

**Backend (modify existing):**

| File | Changes |
| ---- | ------- |
| `server/index.ts` | Add CORS middleware (custom, ~10 lines) before `setupAuth(app)` |
| `server/routes.ts` | Add `GET /api/terms/index` route with ETag support; update `POST /api/proposals` to accept extension auth |
| `server/storage.ts` | Add `getTermIndex()` to `IStorage` interface and `DatabaseStorage` implementation |

**Backend (new files):**

| File | Purpose |
| ---- | ------- |
| `server/middleware/extensionAuth.ts` | Extension auth middleware: validate email header, lookup/create user, attach `req.dbUser` |

**Extension (all new files in `extension/` directory):**

| File | Purpose |
| ---- | ------- |
| `extension/manifest.json` | MV3 manifest with permissions, content scripts, service worker, side panel |
| `extension/managed_schema.json` | Managed storage schema for `apiBaseUrl` |
| `extension/service-worker.js` | Central message router, alarm handler, context menu setup, API caller |
| `extension/shared/constants.js` | MSG types, STORAGE_KEYS, STATUS_COLORS, default config |
| `extension/shared/utils.js` | Shared utilities (messaging helpers, formatters) |
| `extension/shared/api-client.js` | Fetch wrapper with base URL resolution, auth headers, error handling |
| `extension/popup/popup.html` | Popup UI structure |
| `extension/popup/popup.js` | Popup logic: search, recent terms, highlighting toggle |
| `extension/popup/popup.css` | Popup styles |
| `extension/sidepanel/sidepanel.html` | Side panel UI structure |
| `extension/sidepanel/sidepanel.js` | Side panel logic: Browse/Search/Principles tabs, term detail view |
| `extension/sidepanel/sidepanel.css` | Side panel styles |
| `extension/options/options.html` | Options page UI |
| `extension/options/options.js` | Options logic: API URL config, managed storage display |
| `extension/options/options.css` | Options page styles |
| `extension/content/content-script.js` | Content script: highlighting, tooltips, clipper, message listener |
| `extension/content/content-styles.css` | Injected styles for highlighting and tooltips (also embedded in Shadow DOM) |
| `extension/icons/` | Extension icons (16, 32, 48, 128px — copy from `attached_assets/`) |

### Dependencies

**Backend:**
- No new npm packages required. CORS middleware is custom code (~10 lines). Extension auth uses existing `storage` and `db` imports.

**Extension:**
- No external dependencies. Pure vanilla JS/HTML/CSS using Chrome extension APIs.
- Chrome APIs used: `chrome.storage` (local, sync, managed), `chrome.identity`, `chrome.sidePanel`, `chrome.contextMenus`, `chrome.alarms`, `chrome.notifications`, `chrome.scripting`, `chrome.runtime`, `chrome.action`, `chrome.tabs`

**Data dependencies:**
- Extension reads: `GET /api/terms`, `GET /api/terms/search`, `GET /api/terms/:id`, `GET /api/terms/index` (new), `GET /api/categories`, `GET /api/principles`
- Extension writes: `POST /api/proposals` (with extension auth header)
- Extension polls: `GET /api/proposals?status=pending` (with extension auth header, Tier 3)

**Deployment dependencies:**
- Google Workspace admin console access (for force-install policy)
- Chrome Web Store developer account (for publishing, even unlisted)
- Published extension ID (for pinning CORS origin in production)

### Testing Guidance

**Backend endpoint testing (automated):**
- Test `GET /api/terms/index` returns correct shape `[{id, name, synonyms}]`
- Test ETag: first request gets 200 + ETag header; same ETag in `If-None-Match` gets 304; after a term update, same ETag gets 200 with new data
- Test CORS: request with `Origin: chrome-extension://testid` gets appropriate `Access-Control-Allow-Origin` response header
- Test extension auth: request with valid `X-Extension-User-Email` + valid domain creates user and succeeds; invalid domain gets 403; missing header falls through to OIDC check

**Extension testing (manual + structured):**
- Load unpacked extension from `extension/` directory in `chrome://extensions` (enable Developer Mode)
- **Popup test:** Open popup, type search query, verify results appear. Click result, verify side panel opens with detail.
- **Highlighting test:** Toggle highlighting on. Navigate to a page with known term text. Verify terms are highlighted. Hover to see tooltip. Toggle off, verify highlights removed.
- **Context menu test:** Select text on any page, right-click, verify "Search Lexicon for..." and "Propose as Lexicon Term" appear. Click "Search" and verify side panel opens.
- **Side panel test:** Open side panel. Switch between Browse, Search, Principles tabs. Click a term. Verify detail view renders all fields.
- **Managed storage test:** Set `apiBaseUrl` via `chrome.storage.managed` (requires enterprise policy or dev override). Verify extension uses the configured URL.
- **Service worker lifecycle test:** Open extension, wait 60 seconds (idle timeout), then trigger an action. Verify it still works (state recovered from `chrome.storage`).

**Edge case testing:**
- Pages with heavy mutations (Gmail, Slack) — verify no CPU spike, highlighting still works
- Pages with Shadow DOM components — verify no errors, foreign Shadow DOMs are skipped
- Empty term index — verify highlighting gracefully does nothing
- API server unreachable — verify extension shows offline state, cached data still works for highlighting

### Notes

**High-risk items:**
- Content script performance on complex pages (Gmail, Google Docs, Notion) — the 2-second scan cap mitigates this but needs real-world testing
- Service worker ephemeral lifecycle — any missed state persistence will cause silent failures. Audit all module-level `let`/`const` for state that should be in `chrome.storage`
- User auto-provisioning via extension auth — if the web app admin later changes a user's role, the extension middleware should respect the existing role, not reset to "Member"

**Known limitations:**
- Highlighting does not work inside `<iframe>` elements (content scripts don't automatically inject into iframes; would need `"all_frames": true` in manifest which has performance implications)
- Highlighting does not work inside closed Shadow DOM roots (by design — no access)
- Extension auth relies on domain validation only — there is no cryptographic proof that the email comes from Chrome Identity API vs. a forged header (acceptable for internal tool, documented tradeoff)
- The proposals endpoint requires auth for polling — if the user has not been auto-provisioned, notification polling silently fails and badge stays at 0

**Future considerations (out of scope):**
- AI-powered term suggestions ("Did you mean to use 'Brand Voice' instead of 'brand messaging'?")
- Inline editing of terms from the extension (edit button → opens web app in new tab for now)
- Cross-browser support (Firefox MV3 is maturing but not a priority)
- Term usage analytics (tracking which terms are most viewed/highlighted)

**Prototype reference files:**
- Early prototype files available in `attached_assets/` as reference for UI structure, styling, and API client patterns
- Deployment guide already drafted in `attached_assets/DEPLOYMENT_1771178370051.md`
- Extension icons (16, 32, 48, 128px) already available in `attached_assets/`
- The prototype's review queue code (in sidepanel.js) should be stripped out and replaced with a simple "N proposals pending" notice that links to the web app
- The `proposals` endpoint requires auth — the extension will need the extension auth middleware to poll for pending proposal count (for notifications)
