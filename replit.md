

<!-- PROTECTION NOTE FOR REPLIT AGENT: The content between BMAD-METHOD-START and BMAD-METHOD-END markers is part of the BMad Method framework and MUST NOT be modified, overwritten, or removed during any replit.md updates. When updating this file, only modify the "Project Documentation" section AFTER the BMAD-METHOD-END marker. Always preserve both sections intact. -->

<!-- BMAD-METHOD-START -->
# BMad Method v6.0.0-beta.8-replit.4 — Agent Configuration

## IMPORTANT: How You Must Operate in This Project

This is a **BMad Method** project. BMAD workflows are activated through **Replit Agent Skills** installed in `.agents/skills/bmad-*/`. You MUST follow these rules in every conversation:

1. **BMAD skills handle workflow activation.** When a user's message matches a BMAD skill trigger (e.g., "create PRD", "code review", "party mode"), the skill will activate and provide instructions for loading the correct workflow files. Follow those instructions exactly.
2. **When a skill activates, load the referenced files and follow them.** Do not answer in your own words. Load the workflow or agent file specified in the skill and execute it.
3. **For workflows:** The skill will instruct you to either load `_bmad/core/tasks/workflow.xml` (the execution engine) with a workflow YAML config, or load a workflow markdown file directly. Execute ALL steps IN ORDER. When a step says WAIT for user input, STOP and WAIT.
4. **For agents:** Load the agent file, adopt that persona completely, and present the agent's menu.
5. **Never skip, summarize, or improvise** workflow steps. Never auto-proceed past WAIT points.
6. **If no skill activates,** respond normally but remain aware that this is a BMAD project. If the user seems to be asking about project planning, development, or process, suggest the relevant BMAD workflow. Say "help" or "BH" anytime for guidance.
7. **If unsure whether a BMAD workflow applies,** ask: "Would you like me to run the [workflow name] workflow for that?"

## BMad File Structure

```
_bmad/                    # BMad Method toolkit
├── core/                 # Core engine (workflow executor, help, brainstorming)
│   ├── agents/           # BMad Master agent
│   ├── tasks/            # Help, workflow engine, editorial tasks
│   └── workflows/        # Brainstorming, party mode, elicitation
├── bmm/                  # BMad Methodology Module
│   ├── agents/           # 9 specialist agent personas
│   ├── workflows/        # All phase workflows (analysis → implementation)
│   ├── data/             # Templates and context files
│   └── teams/            # Team configurations for party mode
├── _config/              # Manifests, help catalog, customization
└── _memory/              # Agent memory (tech writer standards)

.agents/skills/bmad-*/    # Replit Agent Skills (workflow activation)

_bmad-output/             # Generated artifacts go here
├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs
└── implementation-artifacts/  # Sprint plans, stories, reviews
```

## BMad Configuration

- **BMAD config:** `_bmad/bmm/config.yaml` (skill level, output paths — BMAD-specific settings only)
- **Help catalog:** `_bmad/_config/bmad-help.csv` (phase-sequenced workflow guide)
- **Platform values:** User name, project name, and language are resolved automatically from Replit environment ($REPLIT_USER, $REPL_SLUG, $LANG)

**IMPORTANT:** Do NOT embed the contents of BMad config files (config.yaml, etc.) into this replit.md. Only reference them by file path above. Read them from disk when needed.
<!-- BMAD-METHOD-END -->
# Katalyst Lexicon

## Overview

Katalyst Lexicon is an internal web application designed to be the definitive source for organizational vocabulary and terminology. Its primary purpose is to establish a centralized glossary system that incorporates editorial workflows, robust search functionality, and governance mechanisms. This aims to minimize ambiguity, expedite decision-making, and ensure consistent language across all facets of the organization, including strategy, planning, delivery, and culture.

Key capabilities include:
- Browsing terms by category.
- Proposing new terms.
- Reviewing and approving term proposals.
- Managing organizational vocabulary with version control and deprecation features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript.
- **Routing**: Wouter.
- **State Management**: TanStack React Query for server state and caching.
- **UI Components**: shadcn/ui built on Radix UI primitives.
- **Styling**: Tailwind CSS v4, utilizing custom Katalyst brand colors and design tokens.
- **Build Tool**: Vite.

### Backend
- **Runtime**: Node.js with Express.js.
- **Language**: TypeScript (ES modules).
- **API Design**: RESTful JSON API (`/api/*` routes).
- **Server**: Single Express server for both API and static assets in production; Vite dev server integration for development.

### Data Layer
- **ORM**: Drizzle ORM for type-safe schema definitions.
- **Database**: PostgreSQL.
- **Schema**: Defined in `shared/schema.ts`, including Zod validation schemas.
- **Migrations**: Drizzle Kit.

### Key Data Models
- **Terms**: Core vocabulary entries with attributes like name, definition, category, status (Draft, In Review, Canonical, Deprecated), visibility, synonyms, and versioning.
- **Categories**: Groupings for terms, including color coding and sort order.
- **Proposals**: Workflow for new term submissions and edits, managing approval states.
- **Principles**: Long-form content (e.g., philosophies, manifestos) with markdown support, linking to multiple terms via `principleTermLinks`.
- **Users**: Role-based access control (Member, Approver, Admin).
- **Settings**: Key-value store for application configuration.

### Project Structure
- `client/`: React frontend application.
- `server/`: Express backend.
- `shared/`: Code shared between client and server (e.g., schema, types).
- `docs/`: Documentation and UX design guides.

### Build and Deployment
- Development environment uses Vite for HMR, proxied through Express.
- Production build bundles the client with Vite and the server with esbuild.
- Production server serves static files from `dist/public`.

## External Dependencies

### Database
- **PostgreSQL**: Primary database.
- **connect-pg-simple**: PostgreSQL session store for Express.

### UI/Styling
- **Radix UI**: Headless UI components.
- **Lucide React**: Icon library.
- **class-variance-authority**: Utility for variant-based styling.
- **tailwindcss**: CSS framework.

### Form Management & Validation
- **react-hook-form**: Form state management.
- **@hookform/resolvers**: Zod resolver for form validation.
- **zod**: Schema validation library.

### Data Fetching
- **@tanstack/react-query**: Server state management and caching.

### Testing
- **Vitest**: Test runner for API integration tests.
- **Playwright**: E2E browser testing (via Replit run_test tool).

### Development Tools
- **Vite**: Build tool and dev server.
- **tsx**: TypeScript execution for Node.js.
- **drizzle-kit**: Database migration tool.

### Authentication & Authorization
- **Auth Provider**: Replit Auth (OIDC) via `server/replit_integrations/auth/`
- **Session**: Express sessions backed by PostgreSQL (`sessions` table)
- **User provisioning**: First user to sign in gets Admin role; subsequent users default to Member
- **Permissions**: `shared/permissions.ts` defines role-permission matrix (Read: public, Propose: Member+, Review: Approver+, Admin: Admin only)
- **Middleware**: `server/middleware/auth.ts` provides `requireRole()`, `requirePermission()`, and `optionalAuth` middleware
- **Frontend hook**: `useAuth()` from `client/src/hooks/use-auth.ts` returns user with role
- **Login/Logout**: Navigate to `/api/login` and `/api/logout` (no custom forms)
- **Route protection**: All write routes require authentication; admin routes require Admin role; review routes require Approver+ role; read routes for terms/categories/principles are public

### Theming & Accessibility
- **Dark Mode**: System preference detection + manual toggle + localStorage persistence via `useTheme()` hook (`client/src/hooks/use-theme.ts`)
- **FOWT Prevention**: Inline script in `client/index.html` applies dark class from localStorage before React hydrates
- **Semantic Tokens**: All components use `text-foreground`, `text-muted-foreground`, `bg-card`, `bg-background` — never hardcoded brand tokens (`text-kat-black`, `bg-white`) directly
- **Theme Toggle**: Sun/Moon icons in sidebar header (desktop) and mobile header bar
- **Skip Link**: Skip-to-content link on all pages (`data-testid="skip-link"`)
- **Page Titles**: Each page sets `document.title` via inline `useEffect` pattern
- **Reduced Motion**: CSS `prefers-reduced-motion: reduce` disables transitions and animations (with targeted selectors, not blanket `*`)
- **WCAG 2.1 AA**: Compliant — 48 issues found and fixed in comprehensive audit. Automated axe-core scans pass on all pages in light and dark mode

### Domain Restriction
- **Email Domain Validation**: Auth verify callback checks email domain against `ALLOWED_EMAIL_DOMAIN` env var (default: `@katgroupinc.com`)
- **Development**: Set `ALLOWED_EMAIL_DOMAIN=*` to allow all domains during development
- **Production**: Restricts sign-in to `@katgroupinc.com` emails only
- **Failure Redirect**: Rejected users redirected to `/?auth_error=domain`

### Testing
- **E2E Tests**: Playwright test suite (`tests/e2e/`) covering 8 user journeys
- **Accessibility Tests**: `tests/e2e/accessibility.spec.ts` — axe-core WCAG 2.1 AA scans at 3 viewports (375px, 768px, 1280px)
- **Run Tests**: `npm run test:e2e` (requires running dev server on port 5000)

### Shared Types
- `PrincipleWithCount` type defined in both `shared/schema.ts` (server, Drizzle types with Date) and `client/src/lib/api.ts` (client, JSON types with string dates) — frontend pages import from `api.ts`

## Recent Changes

### Action Item Fixes (Feb 2026)
- Domain restriction (AC8/AC9) resolved: email domain validation in auth verify callback with `ALLOWED_EMAIL_DOMAIN` env var
- GET /api/principles refactored to use `storage.getPrinciplesWithCounts()` instead of direct DB query
- `<a>` replaced with wouter `<Link>` in SearchHero.tsx "Propose this term" CTA
- `PrincipleWithCount` type consolidated into `shared/schema.ts` (removed duplicate definitions)
- Toast REMOVE_DELAY fixed from 1000000ms (16 min) to 5000ms (5 seconds)
- DesignSystem.tsx hardcoded `text-kat-black`/`text-kat-charcoal` replaced with semantic tokens
- Color picker buttons in ManageCategories.tsx given proper `aria-label` attributes
- Multi-viewport axe-core accessibility tests added (375px, 768px, 1280px)
- Mobile Spotlight ARIA compliance test added at 375px viewport

### Epic 8: Quality & Testing (Feb 2026)
- Story 8.1: Dark mode system with theme toggle and localStorage persistence
- Story 8.2: Skip-to-content link, page titles, and reduced motion support
- Story 8.3: Playwright E2E test suite covering 8 user journeys
- Story 8.4: WCAG 2.1 AA compliance audit — 48 issues found and fixed (28 Critical + 15 Major + 5 from code review)

### Epic 7: Administration & Governance (Feb 2026)
- Replit Auth (OIDC) integration with Google sign-in
- Role-based access enforcement (Member, Approver, Admin)
- User management, category management, principles authoring, system settings pages

### Epic 6: Review & Approve Workflow (Feb 2026)
- Proposal review queue, review decisions, audit trail, proposer revision flow
- ProposalEvents table tracks full audit trail
