# Brownfield Assessment: Katalyst Lexicon

**Date:** 2026-02-06
**Assessed by:** BMad Method v6.0.0-Beta.7

---

## Replit Environment

| Resource | Status | Details |
|---|---|---|
| Server/Workflow | Running | Express + Vite dev server on port 5000 (`npm run dev`) |
| Database | Configured (secrets present) | PostgreSQL via Neon — DATABASE_URL, PGHOST, PGPORT, PGUSER, PGPASSWORD. DB may need re-provisioning. |
| Environment Variables | Configured | SESSION_SECRET, REPLIT_DOMAINS, REPLIT_DEV_DOMAIN, REPL_ID + all PG vars |
| Deployment | Not deployed | Build script exists (`tsx script/build.ts`), production start: `node dist/index.cjs` |

## Technology Stack

### Languages & Runtimes

| Technology | Version | Role |
|---|---|---|
| TypeScript | 5.6.3 | Primary language (full stack) |
| Node.js | (runtime) | Server runtime |
| React | 19.2.0 | Frontend UI library |

### Frameworks & Libraries

| Package | Version | Purpose |
|---|---|---|
| Express | 4.21.2 | HTTP server / REST API |
| Vite | 7.1.9 | Frontend build tool & dev server |
| Drizzle ORM | 0.39.3 | Database ORM (PostgreSQL) |
| Tailwind CSS | 4.1.14 | Utility-first CSS framework |
| Wouter | 3.3.5 | Client-side routing |
| TanStack React Query | 5.60.5 | Server state management |
| Radix UI | various | Headless UI component library (full suite) |
| Framer Motion | 12.23.24 | Animations |
| Recharts | 2.15.4 | Charts / data visualization |
| Zod | 3.25.76 | Schema validation |
| React Hook Form | 7.66.0 | Form management |
| Sonner | 2.0.7 | Toast notifications |
| Lucide React | 0.545.0 | Icon library |
| Passport | 0.7.0 | Authentication (passport-local) — deps installed, not fully wired |

### Development Tools

| Tool | Configuration | Notes |
|---|---|---|
| drizzle-kit | 0.31.4 | DB migrations via `drizzle.config.ts` |
| esbuild | 0.25.0 | Production bundler |
| tsx | 4.20.5 | TypeScript execution |
| PostCSS | 8.5.6 | CSS processing |

## Project Structure

```
client/                     # Frontend (React SPA)
├── index.html              # Entry HTML with OG/Twitter meta tags
├── public/                 # Static assets (favicon, opengraph)
├── src/
│   ├── App.tsx             # Router: 10 routes
│   ├── components/         # Layout, StatusBadge, TermCard, ui/
│   ├── hooks/              # use-mobile, use-toast
│   ├── lib/                # api, mockData, queryClient, utils
│   └── pages/              # 11 pages (Home, Browse, TermDetail, ProposeTerm, DesignSystem, ReviewQueue, ManageCategories, Settings, BrowsePrinciples, PrincipleDetail, not-found)
server/                     # Backend (Express)
├── index.ts                # Server entry + middleware + seed
├── routes.ts               # REST API routes (~500 lines, full CRUD)
├── storage.ts              # IStorage interface + DatabaseStorage (~340 lines)
├── db.ts                   # Drizzle + pg Pool connection
├── seed.ts                 # Seed data (7 categories, 5 terms, 5 users, 3 proposals, 8 settings, 2 principles)
├── static.ts               # Static file serving (production)
├── vite.ts                 # Vite dev server middleware
shared/
└── schema.ts               # Drizzle schema: 8 tables, 6 enums, Zod insert schemas, TypeScript types
docs/
└── dev-assist/             # Planning documentation
    ├── AI-GUIDE.md
    ├── README.md
    ├── project/            # problem-statement, user-stories, mvp-scope, data-model, user-flows
    └── ux-methods/
```

## Architecture Patterns

### Code Organization
- Clean client/server/shared three-layer separation
- Shared schema drives types across the full stack (single source of truth)
- Storage interface pattern (IStorage) abstracts DB operations from routes
- Routes are thin — validation + delegation to storage layer

### Data Flow
- Client: React Query → fetch → `/api/*` endpoints
- Server: Express routes → Zod validation → IStorage methods → Drizzle ORM → PostgreSQL
- Shared types flow from `shared/schema.ts` to both client and server

### Authentication
- Passport + passport-local dependencies installed
- express-session + connect-pg-simple for session storage
- SESSION_SECRET configured
- **Not fully wired:** No auth middleware visible in routes, no login/register endpoints

### API Patterns
- RESTful CRUD for all entities
- Consistent error handling with try/catch in all handlers
- Zod schema validation on POST/PATCH requests
- Special workflow endpoints: proposal approve/reject/request-changes
- Term versioning with snapshot JSON on every create/update

## Current State Assessment

### Working Features
1. **Term Management** — Full CRUD with versioning, version history, search, category filtering
2. **Category Management** — CRUD with auto-incrementing sort order
3. **Proposal Workflow** — Submit, review, approve (auto-creates/updates term), reject, request changes
4. **User Management** — CRUD with roles (Member, Approver, Admin)
5. **Principles Management** — CRUD with slug-based lookup, term linking (many-to-many)
6. **Settings Management** — Key/value settings with upsert and batch operations
7. **Database Seeding** — Conditional seeding with realistic sample data for all entities
8. **Frontend Routing** — 10 routes covering all major features

### Partial / In-Progress Features
- **Authentication** — Dependencies installed but not wired into the application
- **Design System Page** — Exists as a route, likely a component showcase/reference
- **Mock Data** — `client/src/lib/mockData.ts` exists, suggesting some features may still reference local data

### Known Issues
- Database may need re-provisioning (secrets exist but DB status shows not provisioned)
- No auth protection on any API endpoints
- `mockData.ts` may create confusion vs. real DB data

### Code Quality Signals

| Signal | Assessment | Evidence |
|---|---|---|
| Tests | None | No test files, no test configuration, no test scripts |
| Error Handling | Good | Consistent try/catch in all routes, Zod validation on inputs |
| Documentation | Good | Planning docs in `docs/dev-assist/` (problem statement, user stories, MVP scope, data model, user flows) |
| Consistency | Strong | Uniform patterns across all entities — same schema → storage → routes pattern |

## BMAD Phase Mapping

| Phase | Status | Evidence |
|---|---|---|
| 1 — Analysis | Complete | Problem statement, user stories exist in `docs/dev-assist/project/` |
| 2 — Planning | Complete | MVP scope, user flows, data model documented |
| 3 — Solutioning | Mostly Complete | Architecture is implemented (schema, storage, routes, pages), but no formal architecture doc |
| 4 — Implementation | In Progress | Core CRUD features built, auth not wired, no tests, not deployed |

## Recommended Path

**Path:** Enter at Phase 4 — Implementation (with a brief Phase 3 checkpoint)
**Rationale:** The core application is well-built with mature patterns. Analysis and planning are done. The remaining work is completing implementation: wiring authentication, removing mock data, adding tests, and preparing for deployment.

### Workflow Sequence

1. **Generate Project Context (GPC)** — Capture the existing architecture into a formal BMAD architecture artifact
2. **Create Epics (CE)** — Break remaining work into epics (Auth, Testing, Polish, Deploy)
3. **Sprint Planning (SP)** — Plan the implementation sprint for remaining features
4. **Dev Story (DS)** — Implement stories (auth wiring, mock data cleanup, testing, deployment)

## Notes & Caveats

- The existing `docs/dev-assist/` planning documentation may overlap with BMAD artifacts — consider referencing rather than duplicating
- The Passport setup suggests authentication was planned but deferred — the infrastructure is in place
- The seed file provides excellent test data for development but should be disabled or gated in production
- The application name "Katalyst Lexicon" and domain context (organizational vocabulary management) are well-established
