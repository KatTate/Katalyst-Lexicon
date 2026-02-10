---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd-katalyst-lexicon-2026-02-06.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/project-context.md
  - shared/schema.ts
  - server/routes.ts
  - server/storage.ts
  - client/src/App.tsx
workflowType: 'architecture'
date: 2026-02-06
lastUpdated: 2026-02-10
author: User
status: complete
migratedFrom: existing-codebase
uxAddendum: true
---

# Architecture Document — Katalyst Lexicon

**Author:** User
**Date:** 2026-02-06

---

## System Context

### Purpose

Katalyst Lexicon is a single-server web application serving as the canonical source of truth for organizational vocabulary, terminology, and guiding principles. It provides governed editorial workflows for term proposal and approval, version history, principle-term linking, and role-based access.

### System Boundary

```
┌─────────────────────────────────────────────────┐
│                 External Users                   │
│   (Members, Approvers, Admins — via Browser)     │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS (port 5000)
                    ▼
┌─────────────────────────────────────────────────┐
│            Katalyst Lexicon Server               │
│                                                  │
│  ┌──────────┐   ┌──────────┐   ┌─────────────┐  │
│  │  Vite    │   │  Express │   │  Static     │  │
│  │  Dev HMR │   │  API     │   │  Assets     │  │
│  │  (dev)   │   │  Routes  │   │  (prod)     │  │
│  └──────────┘   └────┬─────┘   └─────────────┘  │
│                      │                            │
│               ┌──────┴──────┐                     │
│               │  Storage    │                     │
│               │  Interface  │                     │
│               └──────┬──────┘                     │
│                      │                            │
│               ┌──────┴──────┐                     │
│               │  Drizzle    │                     │
│               │  ORM        │                     │
│               └──────┬──────┘                     │
└──────────────────────┼────────────────────────────┘
                       │ TCP (DATABASE_URL)
                       ▼
              ┌────────────────┐
              │  PostgreSQL    │
              │  (Neon)        │
              └────────────────┘
```

### Actors

| Actor | Channel | Auth Required |
|-------|---------|---------------|
| Any User (anonymous) | Browser | No — public read |
| Member | Browser | Yes — propose terms |
| Approver | Browser | Yes — review proposals |
| Admin | Browser | Yes — user/category/settings management |

### External Dependencies

| Dependency | Purpose | Integration |
|------------|---------|-------------|
| PostgreSQL (Neon) | Data persistence | Drizzle ORM via `DATABASE_URL` |
| Google Workspace SSO | Authentication (planned) | Passport.js (installed, not wired) |

---

## Architecture Decisions

### AD-1: Monolithic Single-Server Architecture

**Decision:** Single Express server serves both the API and the frontend from a single process on port 5000.

**Rationale:** The application is an internal tool with modest concurrency requirements. A monolith reduces operational complexity, eliminates CORS issues, simplifies deployment, and keeps the development feedback loop fast.

**Consequences:**
- All scaling is vertical (single process)
- Frontend and API share the same deployment lifecycle
- No separate CDN or reverse proxy needed for development

### AD-2: Storage Interface Abstraction

**Decision:** All database operations are accessed through `IStorage` interface in `server/storage.ts`, with a `DatabaseStorage` implementation using Drizzle ORM.

**Rationale:** Decouples business logic from database specifics. Routes remain thin and testable. Enables swapping storage implementations (e.g., in-memory for testing) without touching route handlers.

**Consequences:**
- Routes must never import `db` directly — always use `storage.*` methods
- New entities require adding methods to both `IStorage` interface and `DatabaseStorage` class
- Storage methods handle version history creation internally (e.g., `createTerm` auto-creates a `TermVersion`)

### AD-3: Schema-First Shared Types

**Decision:** The Drizzle schema in `shared/schema.ts` is the single source of truth for all data types. Both client and server import types from this file.

**Rationale:** Prevents type drift between frontend and backend. Zod schemas from `drizzle-zod` provide runtime validation that matches compile-time types.

**Consequences:**
- Schema changes propagate to both sides automatically via TypeScript
- Insert schemas omit auto-generated fields (id, timestamps) using `.omit()`
- Both `InsertXxx` (for writes) and `Xxx` (select type, for reads) exported per entity

### AD-4: Client-Side Routing with Wouter

**Decision:** Use Wouter (not React Router) for client-side routing.

**Rationale:** Lightweight (~2KB), simple API, sufficient for the application's flat navigation structure. Already established in the codebase.

**Consequences:**
- All routes defined in `client/src/App.tsx` using `<Switch>` and `<Route>`
- No nested routing or route loaders — data fetching handled by TanStack Query
- Server returns `index.html` for all non-API paths (SPA catch-all)

### AD-5: TanStack Query for Server State

**Decision:** Use TanStack React Query for all API data fetching and caching.

**Rationale:** Provides automatic caching, background refetching, loading/error states, and cache invalidation. Eliminates manual state management for server data.

**Consequences:**
- All API calls go through query hooks or `apiRequest` utility
- Cache keys follow `["/api/resource"]` convention
- Mutations invalidate related queries via `queryClient.invalidateQueries()`

### AD-6: Tailwind CSS v4 with Inline Theme

**Decision:** Use Tailwind CSS v4 with `@theme inline` configuration in `client/src/index.css`.

**Rationale:** Tailwind v4 simplifies configuration by moving theme definitions into CSS. The inline theme approach keeps all design tokens in one place.

**Consequences:**
- Custom colors defined as `--color-*` CSS variables (e.g., `--color-kat-basque`)
- Do NOT use `tailwind.config.js` — configuration lives in CSS
- Vite plugin `@tailwindcss/vite` replaces PostCSS plugin

### AD-7: Component Library — shadcn/ui (Radix Primitives)

**Decision:** Use shadcn/ui components built on Radix UI primitives, installed as source code in `client/src/components/ui/`.

**Rationale:** Provides accessible, unstyled primitives that are fully customizable. Components live in the project (not node_modules), so they can be modified freely.

**Consequences:**
- UI components are project-owned files, not external dependencies
- New UI primitives added by copying from shadcn registry
- Custom components (`Layout.tsx`, `StatusBadge.tsx`, `TermCard.tsx`) sit alongside `ui/` directory

### AD-8: UUID Primary Keys

**Decision:** All entities use UUID primary keys generated by PostgreSQL (`gen_random_uuid()`).

**Rationale:** Avoids sequential ID guessing, enables distributed ID generation, prevents enumeration attacks.

**Consequences:**
- Primary keys are `varchar` type in Drizzle schema (not `uuid` type due to Drizzle compatibility)
- IDs are URL-safe strings
- No auto-increment sequences

### AD-9: Automatic Version History

**Decision:** Term modifications automatically create `TermVersion` records containing a JSON snapshot of the complete term state at that point.

**Rationale:** Provides immutable audit trail without requiring manual version management. Users always see the full history of how a term evolved.

**Consequences:**
- `storage.createTerm()` and `storage.updateTerm()` internally create version snapshots
- Version numbers are sequential per term (not global)
- `snapshotJson` stores the full term object as JSONB
- Deleting a term cascades to delete its version history

### AD-10: Seed Data for Development

**Decision:** The application runs a seed function on startup that populates initial categories, terms, users, proposals, settings, and principles if the database is empty.

**Rationale:** Provides a consistent starting state for development and demos. Seed only runs when tables are empty, so it's safe to call on every startup.

**Consequences:**
- `server/seed.ts` contains all seed data
- Seed checks `categories` table count — if > 0, skips entirely
- Categories must be seeded before terms (terms reference category names)

---

## Implementation Patterns

### Pattern 1: API Route Structure

All routes follow a consistent pattern:

```typescript
app.METHOD("/api/resource", async (req, res) => {
  try {
    // 1. Parse/validate input (Zod for POST/PATCH)
    // 2. Call storage.method()
    // 3. Return JSON response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: "Failed to ..." });
  }
});
```

**Rules:**
- Routes MUST NOT contain business logic
- Routes MUST validate POST/PATCH bodies with Zod schemas from `@shared/schema`
- Routes MUST use `storage.*` for all data operations
- Routes MUST return meaningful HTTP status codes (201 for create, 204 for delete, 404 for not found)

### Pattern 2: Frontend Data Fetching

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["/api/resource"],
  queryFn: () => apiRequest("GET", "/api/resource"),
});
```

**Rules:**
- Query keys MUST match the API path
- Mutations MUST invalidate related query keys
- Loading and error states MUST be handled in UI

### Pattern 3: Page Component Structure

```typescript
export default function PageName() {
  // 1. TanStack Query hooks for data
  // 2. Local state for UI (forms, filters)
  // 3. Event handlers
  // 4. Return <Layout> wrapper with content
}
```

**Rules:**
- Every page wraps content in `<Layout>` component
- Interactive elements MUST have `data-testid` attributes
- Forms use React Hook Form + Zod resolver

### Pattern 4: Proposal Approval Flow

```
Proposal (pending) → Approve → Creates/Updates Term + Creates TermVersion
                   → Reject → Updates proposal status, adds reviewComment
                   → Request Changes → Updates proposal status, adds reviewComment
```

**Rules:**
- Approval of type="new" proposals creates a new term with status "Canonical"
- Approval of type="edit" proposals updates the existing term (via `termId`)
- All proposal decisions are recorded with reviewer comments

---

## Consistency Rules for AI Agents

### Import Rules

1. Schema imports use `@shared/schema` (path alias)
2. Component imports use `@/components/...` (path alias)
3. Never import `db` in route handlers — use `storage.*`
4. Client-side API calls use `apiRequest()` from `@/lib/api`

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Page files | PascalCase | `TermDetail.tsx` |
| UI components | PascalCase | `StatusBadge.tsx` |
| API routes | kebab-case paths | `/api/terms/:id/versions` |
| Database columns | snake_case | `why_exists`, `submitted_at` |
| TypeScript fields | camelCase | `whyExists`, `submittedAt` |
| CSS variables | `--color-kat-*` | `--color-kat-basque` |
| Route paths (client) | kebab-case | `/principle/:slug` |

### Schema Change Protocol

1. Modify table definition in `shared/schema.ts`
2. Update insert schema (`.omit()` any auto fields)
3. Export new insert type (`InsertXxx`) and select type (`Xxx`)
4. Add methods to `IStorage` interface
5. Implement in `DatabaseStorage` class
6. Add route handlers in `server/routes.ts`
7. Run `npm run db:push` to apply changes

### File Placement Rules

| What | Where |
|------|-------|
| New page | `client/src/pages/PageName.tsx` + register in `App.tsx` |
| New UI primitive | `client/src/components/ui/component.tsx` |
| New domain component | `client/src/components/ComponentName.tsx` |
| New API route | `server/routes.ts` (grouped by entity section) |
| New storage method | `server/storage.ts` (interface + implementation) |
| New entity | `shared/schema.ts` (table + insert schema + types) |
| New utility | `client/src/lib/utilName.ts` or `server/` |

---

## Project Structure

```
katalyst-lexicon/
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript strict mode config
├── vite.config.ts                  # Vite + React + Tailwind v4 plugins
├── drizzle.config.ts               # Drizzle Kit → PostgreSQL connection
├── replit.md                       # Project documentation / agent memory
│
├── shared/                         # Shared between client and server
│   └── schema.ts                   # Drizzle tables, Zod schemas, TS types
│
├── server/                         # Express backend
│   ├── index.ts                    # App bootstrap, middleware, server start
│   ├── routes.ts                   # All API route handlers (thin)
│   ├── storage.ts                  # IStorage interface + DatabaseStorage
│   ├── db.ts                       # Drizzle client + pg Pool
│   ├── seed.ts                     # Development seed data
│   ├── vite.ts                     # Vite dev middleware (HMR)
│   └── static.ts                   # Production static file serving
│
├── client/                         # React frontend (Vite root)
│   ├── index.html                  # SPA entry point + meta tags
│   └── src/
│       ├── main.tsx                # React DOM render entry
│       ├── App.tsx                 # Router (Wouter) + providers
│       ├── index.css               # Tailwind v4 @theme inline + globals
│       │
│       ├── pages/                  # Route page components (11 pages)
│       │   ├── Home.tsx            # Search & discover landing
│       │   ├── Browse.tsx          # Browse terms by category
│       │   ├── TermDetail.tsx      # Term full detail + history
│       │   ├── ProposeTerm.tsx     # Proposal form
│       │   ├── ReviewQueue.tsx     # Approver review queue
│       │   ├── BrowsePrinciples.tsx # Principles list
│       │   ├── PrincipleDetail.tsx # Principle detail + linked terms
│       │   ├── ManageCategories.tsx # Admin category management
│       │   ├── Settings.tsx        # Admin system settings
│       │   ├── DesignSystem.tsx    # Internal design reference
│       │   └── not-found.tsx       # 404 page
│       │
│       ├── components/             # Reusable components
│       │   ├── Layout.tsx          # Page wrapper (nav, sidebar, footer)
│       │   ├── StatusBadge.tsx     # Term status indicator
│       │   ├── TermCard.tsx        # Term summary card
│       │   └── ui/                 # shadcn/ui primitives (60+ files)
│       │
│       ├── lib/                    # Client utilities
│       │   ├── api.ts              # apiRequest() fetch wrapper
│       │   ├── queryClient.ts      # TanStack Query client config
│       │   ├── mockData.ts         # Legacy mock data (to be removed)
│       │   └── utils.ts            # cn() classname merge utility
│       │
│       └── hooks/                  # React hooks
│           ├── use-mobile.tsx      # Responsive breakpoint hook
│           └── use-toast.ts        # Toast notification hook
│
├── migrations/                     # Drizzle Kit migration output
│
├── docs/                           # Original planning documentation
│   └── dev-assist/
│       └── project/                # Pre-BMAD planning docs (migrated)
│
├── _bmad/                          # BMAD Method framework
│   ├── core/                       # Core workflows & personas
│   └── bmm/                        # BMAD Method Manager
│
└── _bmad-output/                   # BMAD artifacts (generated)
    ├── project-context.md          # AI agent implementation rules
    └── planning-artifacts/
        ├── brownfield-assessment.md
        ├── product-brief-*.md
        ├── prd-*.md
        └── architecture-*.md       # This document
```

### Requirements to Structure Mapping

| Capability Area | Frontend | Backend | Data |
|----------------|----------|---------|------|
| Term Management | `Browse.tsx`, `TermDetail.tsx` | `routes.ts` (TERMS section) | `terms`, `termVersions` tables |
| Search & Discovery | `Home.tsx` | `routes.ts` (search endpoint) | `storage.searchTerms()` |
| Proposal Workflow | `ProposeTerm.tsx`, `ReviewQueue.tsx` | `routes.ts` (PROPOSALS section) | `proposals` table |
| Principles | `BrowsePrinciples.tsx`, `PrincipleDetail.tsx` | `routes.ts` (PRINCIPLES section) | `principles`, `principleTermLinks` tables |
| User Management | (planned) | `routes.ts` (USERS section) | `users` table |
| Category Management | `ManageCategories.tsx` | `routes.ts` (CATEGORIES section) | `categories` table |
| System Settings | `Settings.tsx` | `routes.ts` (SETTINGS section) | `settings` table |

---

## API Surface

### RESTful Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/terms` | No | List all terms |
| GET | `/api/terms/search?q=` | No | Search terms by keyword |
| GET | `/api/terms/:id` | No | Get term by ID |
| GET | `/api/terms/:id/versions` | No | Get term version history |
| GET | `/api/terms/:id/principles` | No | Get principles linked to term |
| GET | `/api/terms/category/:category` | No | Get terms by category name |
| POST | `/api/terms` | Yes* | Create term |
| PATCH | `/api/terms/:id` | Yes* | Update term |
| DELETE | `/api/terms/:id` | Yes* | Delete term + versions + links |
| GET | `/api/categories` | No | List categories (sorted) |
| GET | `/api/categories/:id` | No | Get category by ID |
| POST | `/api/categories` | Yes* | Create category |
| PATCH | `/api/categories/:id` | Yes* | Update category |
| DELETE | `/api/categories/:id` | Yes* | Delete category |
| GET | `/api/proposals` | No | List proposals (optional `?status=`) |
| GET | `/api/proposals/:id` | No | Get proposal by ID |
| POST | `/api/proposals` | Yes* | Create proposal |
| PATCH | `/api/proposals/:id` | Yes* | Update proposal |
| POST | `/api/proposals/:id/approve` | Yes* | Approve proposal → create/update term |
| POST | `/api/proposals/:id/reject` | Yes* | Reject proposal with comment |
| POST | `/api/proposals/:id/request-changes` | Yes* | Request changes with comment |
| DELETE | `/api/proposals/:id` | Yes* | Delete proposal |
| GET | `/api/users` | Yes* | List users |
| GET | `/api/users/:id` | Yes* | Get user by ID |
| POST | `/api/users` | Yes* | Create user |
| PATCH | `/api/users/:id` | Yes* | Update user |
| DELETE | `/api/users/:id` | Yes* | Delete user |
| GET | `/api/settings` | Yes* | List all settings |
| POST | `/api/settings` | Yes* | Upsert single setting |
| POST | `/api/settings/batch` | Yes* | Upsert multiple settings |
| GET | `/api/principles` | No | List principles (sorted) |
| GET | `/api/principles/:id` | No | Get principle by ID or slug |
| POST | `/api/principles` | Yes* | Create principle |
| PATCH | `/api/principles/:id` | Yes* | Update principle |
| DELETE | `/api/principles/:id` | Yes* | Delete principle + links |
| GET | `/api/principles/:id/terms` | No | Get terms linked to principle |
| POST | `/api/principles/:id/terms` | Yes* | Link term to principle |
| DELETE | `/api/principles/:principleId/terms/:termId` | Yes* | Unlink term from principle |

*\*Auth required per PRD but currently unprotected (auth not wired)*

---

## Data Flow

### Read Flow (Public)

```
Browser → GET /api/resource → Express Route → storage.getResource() → Drizzle Query → PostgreSQL → JSON Response
```

### Write Flow (Term Creation via Proposal Approval)

```
Browser → POST /api/proposals/:id/approve
  → Express Route
    → storage.getProposal(id)
    → storage.updateProposal(id, { status: "approved" })
    → IF type="new":
        → storage.createTerm(proposalData)
          → db.insert(terms)
          → db.insert(termVersions)  ← automatic snapshot
    → IF type="edit":
        → storage.updateTerm(termId, proposalData)
          → db.update(terms)  ← increments version
          → db.insert(termVersions)  ← automatic snapshot
  → JSON { success: true }
```

### Search Flow

```
Browser → GET /api/terms/search?q=query
  → Express Route
    → storage.searchTerms(query)
      → ILIKE across: name, definition, whyExists, usedWhen, notUsedWhen
      → array_to_string for: synonyms, examplesGood, examplesBad
    → JSON [Term[]]
```

---

## Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Runtime | Node.js | 20.x | Server runtime |
| Language | TypeScript | 5.6.3 | Full-stack type safety (strict mode) |
| Server | Express | 4.21.2 | HTTP API framework |
| ORM | Drizzle | 0.39.3 | Type-safe database queries |
| Database | PostgreSQL | (Neon) | Persistent data storage |
| Frontend | React | 19.2.0 | UI framework |
| Router | Wouter | 3.3.5 | Client-side routing |
| Data Fetching | TanStack Query | 5.60.5 | Server state management |
| Styling | Tailwind CSS | 4.1.14 | Utility-first CSS |
| Components | shadcn/ui (Radix) | — | Accessible UI primitives |
| Build | Vite | 6.x | Dev server + production bundler |
| Validation | Zod + drizzle-zod | — | Runtime request validation |
| Forms | React Hook Form | — | Form state management |

---

## UX-Driven Architecture Decisions

_Added 2026-02-10 after completing the UX Design Specification. These decisions extend the original brownfield architecture (AD-1 through AD-10) with frontend experience architecture driven by the comprehensive UX spec._

### AD-11: Search-First UI Architecture

**Decision:** The home page uses a SearchHero component as the primary interaction point. Search implements the WAI-ARIA combobox pattern with debounced API calls, ranked results, and two rendering modes (dropdown on desktop, Spotlight overlay on mobile).

**Rationale:** The UX spec establishes that 80% of usage is the Lookup Job (search → read → done). The search experience is the product's defining interaction and must feel instant. The combobox pattern provides accessibility compliance while supporting results-as-you-type behavior.

**Consequences:**
- Search input uses `role="combobox"` with `aria-expanded`, `aria-activedescendant`, and `aria-live="polite"` for result count
- Client uses `useDebounce` hook (200ms delay) combined with TanStack Query for search state
- Minimum 2 characters before triggering search API call
- Max 10 results in dropdown; "View all results" link for overflow
- `storage.searchTerms()` must return results ranked: exact name match → name contains → definition/synonym match
- Mobile search renders as full-screen Sheet overlay (Spotlight pattern) triggered by search icon in header

### AD-12: Domain Component System

**Decision:** 7 custom domain components are built as composites on top of shadcn/ui primitives. Domain components live in `client/src/components/` (alongside the existing `Layout.tsx`, `StatusBadge.tsx`, `TermCard.tsx`), not inside the `ui/` subdirectory.

**Rationale:** Domain components encode business-specific design decisions (status colors, term card layout, librarian voice copy) while delegating low-level UI behavior (focus management, accessibility, animations) to Radix/shadcn primitives. Keeping them separate from `ui/` makes the boundary clear: `ui/` = generic primitives, `components/` = Katalyst-specific.

**Component Inventory:**

| Component | Composes | Purpose |
|-----------|----------|---------|
| StatusBadge | `badge.tsx` | Term status indicator (Canonical/Deprecated/Draft/In Review) with icon + color + text |
| TermCard | `card.tsx`, StatusBadge | Term summary card for browse/search results with freshness signal |
| SearchHero | `input.tsx`, `popover.tsx` or `sheet.tsx` | Home page search with results-as-you-type dropdown or Spotlight overlay |
| TierSection | `collapsible.tsx` | Expandable term detail section with aria-expanded |
| UsageGuidance | — | Side-by-side "When to use" / "When NOT to use" with responsive stacking |
| ProposalForm | `form.tsx`, `input.tsx`, `textarea.tsx`, `select.tsx`, `collapsible.tsx`, `alert.tsx` | Guided proposal form with progressive disclosure and duplicate detection |
| EmptyState | — | Librarian-voice empty states with optional CTA bridging to governance |

**Consequences:**
- All domain components must include `data-testid` attributes on interactive and display elements
- All domain components must support dark mode via CSS custom properties
- All domain components adapt responsively via Tailwind classes internally — no separate mobile/desktop component files
- `className` override supported via `cn()` merge utility on all components

### AD-13: Two-Tier Progressive Disclosure

**Decision:** Term detail pages use a two-tier information architecture. Tier 1 (always visible) contains the "use this term correctly" fields. Tier 2 (expandable accordion sections) contains the "understand this term deeply" fields.

**Rationale:** The UX spec identifies that most users need definition + usage guidance only (Tier 1). Deeper content (examples, history, principles) serves onboarding and exploration use cases. Progressive disclosure keeps the primary journey fast while preserving depth for power users.

**Tier Structure:**

| Tier | Fields | Visibility | Rationale |
|------|--------|------------|-----------|
| Tier 1 | definition, usedWhen, notUsedWhen, status, visibility, synonyms, category | Always visible | Content creators need these to use a term confidently |
| Tier 2 | examplesGood, examplesBad, version history, linked principles, whyExists | Expandable (Radix Accordion) | Deeper context for onboarding/exploration |

**Consequences:**
- Full term data loaded in a single API call (no lazy loading for tiers)
- Tier 2 sections use Radix Accordion with `aria-expanded` state
- On mobile, Tier 2 accordion sections stack below Tier 1 content (vertical scroll, no tabs)
- UsageGuidance component renders side-by-side on md+ breakpoint, single column on mobile

### AD-14: Responsive Interaction Strategy

**Decision:** Components adapt internally via responsive Tailwind classes. The `useMediaQuery` hook is used only when a fundamentally different interaction pattern is required (Spotlight overlay vs search dropdown). No separate mobile/desktop component files.

**Rationale:** Most responsive behavior is purely layout (grid columns, padding, stacking direction) and is well-handled by Tailwind responsive prefixes. Only the search interaction requires a fundamentally different component tree on mobile (Sheet overlay) vs desktop (Popover dropdown).

**Breakpoint Behavior:**

| Breakpoint | Search | Sidebar | Term Grid | Navigation |
|-----------|--------|---------|-----------|------------|
| < 768px (mobile) | Spotlight overlay (Sheet) | Hidden, Sheet drawer via hamburger | Single column | Hamburger menu |
| 768px–1023px (tablet) | Inline dropdown | Toggleable Sheet drawer | 2-column grid | Condensed nav links |
| 1024px+ (desktop) | Inline dropdown | Persistent (~240px) | 3-column grid | Full nav links |

**Consequences:**
- `useMediaQuery("(max-width: 767px)")` determines search rendering mode in SearchHero
- `useMediaQuery` (or `use-mobile.tsx` hook already in codebase) determines sidebar rendering in Layout
- Sheet component from shadcn/ui serves dual purpose: mobile sidebar drawer + Spotlight search overlay
- All spacing, grid columns, and stacking use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`)
- Max content width: 1200px (`max-w-7xl` or custom `max-w-[1200px]`)
- Form max width: ~680px on desktop for readable line length

### AD-15: Accessibility-First Component Design

**Decision:** All components follow WCAG 2.1 Level AA compliance. Radix UI primitives provide baseline ARIA behavior. Custom domain components add application-specific ARIA attributes.

**Rationale:** The app is a daily-use productivity tool for a 30-50 person team. Accessibility compliance ensures usability for all team members and follows industry best practices. Radix UI handles the hard parts (focus management, keyboard interaction); domain components add semantic labeling.

**ARIA Implementation Map:**

| Component | ARIA Requirements |
|-----------|-------------------|
| SearchHero | `role="combobox"`, `aria-expanded`, `aria-activedescendant`, `aria-live="polite"` region for result count |
| StatusBadge | `aria-label="Status: Canonical"` (never color alone) |
| TierSection | `aria-expanded="true/false"` on toggle, linked content via `aria-controls` |
| Layout | Skip link ("Skip to main content") as first focusable element, `<main>`, `<nav>`, `<aside>` landmarks |
| ProposalForm | `aria-describedby` linking errors to fields, `aria-invalid="true"` on invalid fields |
| Toasts | `role="status"` or `aria-live="polite"` |
| Modals/Sheets | Focus trapped inside, Escape to close, focus returns to trigger on close |

**Consequences:**
- Skip link must be the first DOM element inside `<body>` (or root component)
- `prefers-reduced-motion` media query disables Framer Motion animations, accordion slide transitions, toast transitions
- All interactive elements have visible focus indicators (2px solid ring)
- Minimum touch target: 44x44px for all tappable elements on mobile
- Page title updates on route change: `document.title = "Term Name — Katalyst Lexicon"`
- Destructive confirmation dialogs: Enter does NOT confirm (prevents accidental destruction)
- `eslint-plugin-jsx-a11y` recommended for static ARIA validation

### AD-16: Empty State Governance Bridge

**Decision:** Empty states serve as growth loops connecting the Lookup Job to the Governance Job. The EmptyState component accepts optional CTA props with pre-fill data. Client-side routing passes pre-fill values via query parameters.

**Rationale:** The UX spec identifies empty states as critical adoption-killer defenses. If the lexicon feels empty or dead, users won't return. Empty states that invite contribution create a natural growth loop: search miss → propose term → term added → future search succeeds.

**Bridge Flows:**

| Empty State | CTA | Pre-fill |
|-------------|-----|----------|
| No search results | "Propose this term" | `?name={searchQuery}` |
| Empty category | "Propose the first term" | `?category={categoryName}` |
| Empty review queue | None (positive: "All caught up!") | — |
| Term detail "Suggest an edit" | "Suggest an edit" | `?termId={id}&type=edit` |

**Consequences:**
- ProposeTerm page reads query params on mount to pre-fill form fields
- EmptyState component is reusable with configurable icon, heading, description, and CTA button
- "Suggest an edit" link on term detail creates a governance bridge without a new API endpoint (uses existing `POST /api/proposals` with `type: "edit"`)
- Route: `/propose?name=xxx&category=yyy` or `/propose?termId=xxx&type=edit`

---

## UX-Driven Implementation Patterns

### Pattern 5: Domain Component Contract

All domain components follow this implementation contract:

```typescript
interface DomainComponentContract {
  // 1. Props use shared schema types
  props: InferredFromSharedSchema;
  // 2. Interactive elements have data-testid
  testIds: "data-testid on all interactive + display elements";
  // 3. className override via cn() merge
  className?: string; // merged with cn()
  // 4. Responsive layout via Tailwind
  responsive: "Tailwind responsive prefixes, no separate mobile component";
  // 5. ARIA attributes for accessibility
  aria: "Component-specific ARIA attributes";
  // 6. Dark mode via CSS custom properties
  darkMode: "Uses semantic color tokens, not raw hex";
}
```

**Rules:**
- Props MUST use types from `@shared/schema` (e.g., `Term`, `Category`, `Proposal`)
- Components MUST NOT fetch their own data — data flows in via props from page components
- Components MUST compose shadcn/ui primitives where applicable, not reimplent
- Components MUST handle empty/undefined data gracefully (no crashes on missing optional fields)

### Pattern 6: Client-Side Search State

Search uses a debounce + TanStack Query pattern:

```typescript
// In SearchHero or search hook:
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 200);

const { data: results, isLoading } = useQuery({
  queryKey: ["/api/terms/search", debouncedQuery],
  queryFn: () => apiRequest("GET", `/api/terms/search?q=${encodeURIComponent(debouncedQuery)}`),
  enabled: debouncedQuery.length >= 2,
});
```

**Rules:**
- Query key includes the search term for proper cache management
- `enabled: false` when query is under 2 characters (prevents empty searches)
- Loading state shows skeleton cards (not a full-page spinner)
- Results are displayed in a Popover (desktop) or Sheet (mobile) — never a separate page for live search
- "View all results" link navigates to `/browse?q={query}` for full results
- Empty results show EmptyState with "Propose this term" CTA

### Pattern 7: Responsive Behavior Pattern

```typescript
// ONLY use useMediaQuery for fundamentally different interaction patterns:
const isMobile = useMediaQuery("(max-width: 767px)");

// Mobile: Spotlight overlay (Sheet + full-screen search input + results)
// Desktop: Inline search with Popover dropdown results

// For layout-only changes, use Tailwind responsive prefixes:
// className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
// className="flex flex-col md:flex-row"
// className="p-4 md:p-6 lg:p-8"
```

**Rules:**
- NEVER create separate `MobileSearchHero` / `DesktopSearchHero` files
- SearchHero internally renders different sub-trees based on `isMobile`
- Layout component internally renders sidebar as persistent `<aside>` on lg+ or Sheet on smaller viewports
- All other responsive behavior uses Tailwind prefixes exclusively

### Pattern 8: Form Progressive Disclosure

```typescript
// Proposal forms split into required + optional sections:
<form>
  {/* Required fields — always visible */}
  <FormField name="name" label="What's the term?" required />
  <FormField name="category" label="Which category?" required />
  <FormField name="definition" label="What does it mean?" required />
  <FormField name="changeRationale" label="Why are you proposing this?" required />

  {/* Optional fields — behind collapsible */}
  <Collapsible>
    <CollapsibleTrigger>
      Add more detail (4 optional fields)
    </CollapsibleTrigger>
    <CollapsibleContent>
      <FormField name="usedWhen" label="When should someone use this?" />
      <FormField name="notUsedWhen" label="When should they NOT use this?" />
      <FormField name="examplesGood" label="Good usage examples" />
      <FormField name="examplesBad" label="Bad usage examples" />
    </CollapsibleContent>
  </Collapsible>
</form>
```

**Rules:**
- Required fields use green asterisk indicator
- Optional fields show italic "(optional)" label suffix
- Field labels use librarian voice (conversational tone, not technical labels)
- Validate on blur, not on keystroke
- Duplicate detection: debounced check on term name field blur → `GET /api/terms/search?q={name}` → show amber warning if similar terms found
- Submit actions pinned at bottom: Primary ("Submit Proposal") + Secondary ("Save Draft")
- Form max-width ~680px on desktop, full-width on mobile

### Pattern 9: Feedback & Notification Pattern

```typescript
// Toast notifications for state-changing actions:
// Success: green accent, 4s auto-dismiss, top-right
toast({ title: "Proposal submitted", description: "An approver will review it soon." });

// Error: red accent, persists until dismissed
toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });

// Inline field errors (on blur validation):
<FormField error="Definition should be at least 10 characters" />

// Inline warnings (amber, non-blocking):
<Alert variant="warning">Heads up — a similar term "Scope" already exists.</Alert>
```

**Rules:**
- Toasts appear top-right, auto-dismiss after 4 seconds (except errors)
- Toast copy pattern: "Done — [what happened]. [What happens next]."
- No confirmation dialogs for positive actions (approve, submit, save) — immediate action + toast
- Destructive actions (reject, delete, deprecate) always require confirmation dialog
- Confirmation dialog: Cancel (secondary, left) + Confirm (destructive, right)
- Confirmation dialog: Escape to cancel, Enter does NOT confirm

### Pattern 10: UX Consistency — Button Hierarchy

| Level | Usage | Style |
|-------|-------|-------|
| Primary | Submit Proposal, Approve, Save | `bg-kat-green text-white` — one per section |
| Secondary | Save Draft, Cancel, Request Changes | `border border-kat-gray text-kat-charcoal bg-white` |
| Destructive | Reject Proposal, Delete Term | `bg-destructive text-destructive-foreground` — dialogs only |
| Ghost | "Suggest an edit", "View all", links | `text-kat-green hover:underline` |

**Rules:**
- Maximum 2 visible action buttons per context (primary + secondary)
- Destructive actions never standalone on a page — always behind confirmation dialog
- On mobile, full-width buttons in forms; inline elsewhere
- All buttons minimum 44px touch target height on mobile

---

## Updated Project Structure

### New/Modified Files from UX Architecture

```
client/src/
├── components/
│   ├── Layout.tsx              # Updated: responsive sidebar (persistent lg+ / Sheet mobile)
│   ├── StatusBadge.tsx         # Updated: icon + color + text + aria-label
│   ├── TermCard.tsx            # Updated: freshness signal, category tag, definition preview
│   ├── SearchHero.tsx          # NEW: search-hero with combobox pattern + Spotlight mobile
│   ├── TierSection.tsx         # NEW: expandable term detail section with aria-expanded
│   ├── UsageGuidance.tsx       # NEW: do/don't side-by-side with responsive stacking
│   ├── ProposalForm.tsx        # NEW: progressive disclosure form with duplicate detection
│   ├── EmptyState.tsx          # NEW: librarian-voice empty states with CTA bridge
│   └── ui/                    # Existing shadcn/ui primitives (unchanged)
│
├── hooks/
│   ├── use-mobile.tsx          # Existing: responsive breakpoint hook
│   ├── use-toast.ts            # Existing: toast notification hook
│   ├── use-debounce.ts         # NEW: debounce hook for search input
│   └── use-search.ts           # NEW: search state management (debounce + query + results)
│
├── pages/
│   ├── Home.tsx                # Updated: SearchHero + recently updated grid
│   ├── Browse.tsx              # Updated: responsive sidebar + status filters
│   ├── TermDetail.tsx          # Updated: two-tier layout with TierSection
│   ├── ProposeTerm.tsx         # Updated: uses ProposalForm with query param pre-fill
│   ├── ReviewQueue.tsx         # Updated: EmptyState for empty queue
│   └── ...                    # Other pages unchanged
```

### Updated Requirements to Structure Mapping

| Capability Area | Frontend | Backend | Data |
|----------------|----------|---------|------|
| Term Lookup (80% job) | `Home.tsx` (SearchHero), `TermDetail.tsx` (TierSection, UsageGuidance) | `routes.ts` (search endpoint with ranking) | `storage.searchTerms()` with ORDER BY scoring |
| Browse & Discover | `Browse.tsx` (responsive sidebar, TermCard grid), `EmptyState` | `routes.ts` (terms by category) | `terms`, `categories` |
| Proposal Workflow | `ProposeTerm.tsx` (ProposalForm), `ReviewQueue.tsx` | `routes.ts` (proposals CRUD + approve/reject) | `proposals` table |
| "Suggest an Edit" Bridge | `TermDetail.tsx` → `/propose?termId=xxx&type=edit` | Uses existing proposal endpoint | `proposals` with `type: "edit"` |
| Status Communication | `StatusBadge` (used in TermCard, TermDetail, ReviewQueue) | Term status field | `terms.status` enum |
| Empty State Bridges | `EmptyState` (search, category, review queue) | — | — |
| Responsive Experience | `SearchHero` (Spotlight vs dropdown), `Layout` (sidebar modes) | — | — |
| Accessibility | All components (ARIA, focus, skip link, reduced motion) | — | — |

---

## Known Architectural Gaps

| Gap | Impact | Priority | Recommended Resolution |
|-----|--------|----------|----------------------|
| Auth not wired | All write endpoints unprotected | High | Wire Passport.js middleware per AD-1 plan |
| No database transactions | Proposal approval is not atomic (multi-table) | Medium | Wrap approve flow in `db.transaction()` |
| Search result ranking | Results not ranked by relevance | High | Add ORDER BY scoring in `searchTerms()`: exact name match → name contains → definition/synonym |
| Duplicate detection endpoint | No dedicated check for proposal duplicates | Medium | Add `GET /api/terms/check-duplicate?name=xxx` or reuse search endpoint with client-side matching |
| Page title updates | Route changes don't update document.title | Low | Add `useEffect` in each page to set `document.title = "PageName — Katalyst Lexicon"` |
| `mockData.ts` exists | Legacy file in `client/src/lib/` | Low | Remove if no longer referenced |
| No rate limiting | API endpoints unbounded | Low | Add express-rate-limit middleware |
| Term deletion cascades | Deleting a term removes all versions and links | Medium | Consider soft-delete pattern |
| No input sanitization | XSS risk in markdown/text fields | Medium | Sanitize on output (render) side |

---

*Generated: 2026-02-06*
*Updated: 2026-02-10 — UX-driven architecture addendum (AD-11 through AD-16, Patterns 5-10, updated structure)*
*Architecture type: Brownfield documentation of existing implementation + UX design specification integration*
*Source: Direct codebase analysis + UX Design Specification (2026-02-09)*
