---
project_name: 'Katalyst Lexicon'
user_name: 'User'
date: '2026-02-06'
sections_completed:
  ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'quality_rules', 'workflow_rules', 'anti_patterns']
status: 'complete'
rule_count: 42
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

| Technology | Version | Notes |
|---|---|---|
| TypeScript | 5.6.3 | Strict mode enabled, ESNext modules, bundler resolution |
| React | 19.2.0 | Functional components only, no class components |
| Vite | 7.1.9 | Dev server + production bundler, Tailwind v4 plugin |
| Express | 4.21.2 | Single server serves API + static files |
| Drizzle ORM | 0.39.3 | Schema in `shared/schema.ts`, push migrations via `drizzle-kit push` |
| PostgreSQL | (Neon) | Connected via `DATABASE_URL` env var |
| Tailwind CSS | 4.1.14 | v4 syntax — uses `@theme inline` and `@import "tailwindcss"`, NOT v3 `@tailwind` directives |
| Wouter | 3.3.5 | Client routing — NOT react-router |
| TanStack React Query | 5.60.5 | `staleTime: Infinity`, `retry: false`, query keys are URL paths |
| Zod | 3.25.76 | Validation on both client and server via `drizzle-zod` |
| Radix UI / shadcn | various | Headless primitives in `client/src/components/ui/` |
| Framer Motion | 12.23.24 | Animation library |
| Lucide React | 0.545.0 | Icon library — NOT heroicons, NOT react-icons |

## Critical Implementation Rules

### Language-Specific Rules

- **TypeScript strict mode is ON** — no implicit `any`, no unchecked index access
- **ES modules throughout** — use `import`/`export`, never `require()`
- **Path aliases** — `@/*` maps to `client/src/*`, `@shared/*` maps to `shared/*`
- **Drizzle array columns** — MUST use `.array()` as method: `text().array()` NOT `array(text())`
- **Drizzle insert schemas** — always use `createInsertSchema(table).omit({ id: true })` pattern from `drizzle-zod`
- **Type sharing** — use `typeof table.$inferSelect` for select types, `z.infer<typeof insertSchema>` for insert types
- **Enums** — define with `pgEnum()` in `shared/schema.ts`, share across client/server
- **UUID primary keys** — all tables use `varchar("id").primaryKey().default(sql\`gen_random_uuid()\`)`

### Framework-Specific Rules

#### React / Frontend

- **Wouter for routing** — use `Link` and `useLocation` from `wouter`, NOT react-router
- **React Query for data fetching** — query keys are REST URL paths like `["/api/terms"]`
- **API client** — use `api.*` methods from `client/src/lib/api.ts`, NOT raw fetch
- **`apiRequest()` wrapper** — in `client/src/lib/queryClient.ts`, handles JSON + error throwing
- **`cn()` utility** — always use for className merging: `cn("base-class", conditional && "extra")`
- **shadcn/ui components** — import from `@/components/ui/*`, follow existing component patterns
- **Custom fonts** — Montserrat for headers (`font-header`), Roboto for body (`font-sans`), Roboto Mono for code (`font-mono`)
- **Katalyst brand colors** — use semantic tokens (`text-primary`, `bg-kat-green`, `text-kat-charcoal`, etc.), NOT hex values
- **`data-testid` required** — all interactive elements and meaningful display elements MUST have `data-testid` attributes
- **Page structure** — pages wrap content in `<Layout>` component, which provides sidebar navigation

#### Express / Backend

- **Storage interface pattern** — ALL database operations go through `IStorage` interface in `server/storage.ts`
- **Routes are thin** — `server/routes.ts` handles validation + delegation to storage, no business logic in routes
- **Zod validation on input** — all POST/PATCH handlers parse body with `insertSchema.parse(req.body)`
- **Consistent error handling** — every route handler wrapped in try/catch, returns `{ error: "message" }`
- **Single server on port 5000** — Express serves both API (`/api/*`) and frontend (Vite dev middleware or static files)
- **Seed data** — `server/seed.ts` conditionally seeds if tables are empty; never overwrites existing data

### Testing Rules

- **No test framework currently configured** — when adding tests, use Playwright for e2e
- **`data-testid` naming convention** — interactive: `{action}-{target}` (e.g., `button-submit`), display: `{type}-{content}` (e.g., `text-username`), dynamic: append ID (e.g., `card-term-${termId}`)
- **Test against real database** — use PostgreSQL, not in-memory mocks
- **Seed data available** — 7 categories, 5 terms, 5 users, 3 proposals, 8 settings, 2 principles seeded on startup

### Code Quality & Style Rules

- **File naming** — PascalCase for React components (`TermCard.tsx`), camelCase for utilities (`queryClient.ts`), kebab-case for CSS
- **Component organization** — reusable components in `client/src/components/`, page-level components in `client/src/pages/`
- **Minimize file count** — collapse similar components into a single file where practical
- **No comments unless asked** — keep code self-documenting
- **Tailwind v4 syntax** — `@theme inline {}` block for custom properties, `@import "tailwindcss"` (NOT `@tailwind base/components/utilities`)
- **Dark mode** — uses `.dark` class variant, CSS custom properties swap between light/dark palettes

### Development Workflow Rules

- **Dev command** — `npm run dev` starts Express + Vite on port 5000
- **DB migrations** — `npm run db:push` (drizzle-kit push), no manual SQL migrations
- **Build** — `npm run build` bundles client (Vite) + server (esbuild) to `dist/`
- **Production** — `npm start` runs `node dist/index.cjs`
- **Environment** — all secrets via Replit Secrets (DATABASE_URL, SESSION_SECRET, etc.)

### Critical Don't-Miss Rules

- **NEVER use react-router** — this project uses Wouter
- **NEVER use `@tailwind` directives** — this is Tailwind v4, uses `@import "tailwindcss"` and `@theme inline`
- **NEVER put business logic in routes** — delegate to storage interface
- **NEVER access DB directly in routes** — always go through `storage.*` methods
- **NEVER hardcode colors** — use Katalyst brand tokens (`kat-green`, `kat-charcoal`, etc.)
- **NEVER duplicate types** — frontend `api.ts` has its own interfaces, but schema truth is `shared/schema.ts`
- **mockData.ts exists but is LEGACY** — `client/src/lib/mockData.ts` uses snake_case field names inconsistent with the API (which uses camelCase). Do NOT reference this file in new code.
- **Auth is NOT wired** — Passport deps are installed but no auth middleware exists. All API routes are currently unprotected.
- **Proposals auto-create/update terms on approval** — the `POST /api/proposals/:id/approve` endpoint creates or updates the corresponding term automatically

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Update this file if new patterns emerge

**For Humans:**

- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

Last Updated: 2026-02-06
