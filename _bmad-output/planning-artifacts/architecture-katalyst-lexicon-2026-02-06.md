---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd-katalyst-lexicon-2026-02-06.md
  - _bmad-output/project-context.md
  - shared/schema.ts
  - server/routes.ts
  - server/storage.ts
  - client/src/App.tsx
workflowType: 'architecture'
date: 2026-02-06
author: User
status: complete
migratedFrom: existing-codebase
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

## Known Architectural Gaps

| Gap | Impact | Priority | Recommended Resolution |
|-----|--------|----------|----------------------|
| Auth not wired | All write endpoints unprotected | High | Wire Passport.js middleware per AD-1 plan |
| No database transactions | Proposal approval is not atomic (multi-table) | Medium | Wrap approve flow in `db.transaction()` |
| `mockData.ts` exists | Legacy file in `client/src/lib/` | Low | Remove if no longer referenced |
| No rate limiting | API endpoints unbounded | Low | Add express-rate-limit middleware |
| Term deletion cascades | Deleting a term removes all versions and links | Medium | Consider soft-delete pattern |
| No input sanitization | XSS risk in markdown/text fields | Medium | Sanitize on output (render) side |

---

*Generated: 2026-02-06*
*Architecture type: Brownfield documentation of existing implementation*
*Source: Direct codebase analysis of running application*
