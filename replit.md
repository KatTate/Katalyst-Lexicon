# Katalyst Lexicon

## Overview

Katalyst Lexicon is an internal web application that serves as the canonical source of truth for organization-wide vocabulary and terminology. It provides a centralized glossary system with editorial workflows, search capabilities, and governance features to reduce ambiguity, accelerate decision-making, and enforce consistent language across strategy, planning, delivery, and culture.

The application allows users to browse terms by category, propose new terms, review and approve proposals, and manage organizational vocabulary with version control and deprecation support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom Katalyst brand colors and design tokens
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful JSON API with `/api/*` routes
- **Server Setup**: Single Express server serving both API and static files in production; Vite dev server middleware in development

### Data Layer
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` contains all table definitions and Zod validation schemas
- **Migrations**: Drizzle Kit for database migrations (`drizzle-kit push`)

### Key Data Models
- **Terms**: Core vocabulary entries with name, definition, category, status (Draft/In Review/Canonical/Deprecated), visibility levels, synonyms, and versioning
- **Categories**: Organizational groupings for terms with color coding and sort order
- **Proposals**: Editorial workflow for new term submissions and edits with approval states
- **Principles**: Longer-form philosophies and manifestos (title, slug, summary, body with markdown, status, visibility, tags) that can link to multiple related terms via the principleTermLinks join table
- **PrincipleTermLinks**: Join table connecting principles to related terms (bidirectional relationship)
- **Users**: Role-based access (Member/Approver/Admin)
- **Settings**: Key-value configuration store

### Project Structure
```
client/           # React frontend application
  src/
    components/   # Reusable UI components
    pages/        # Route-level page components
    lib/          # Utilities, API client, query configuration
    hooks/        # Custom React hooks
server/           # Express backend
  index.ts        # Server entry point
  routes.ts       # API route definitions
  storage.ts      # Database access layer
  db.ts           # Database connection
  seed.ts         # Initial data seeding
shared/           # Shared code between client and server
  schema.ts       # Drizzle schema and Zod validators
docs/             # Documentation and methodologies
  ux-methods/     # Reusable UX design guides
```

### Build and Deployment
- Development runs Vite dev server with HMR proxied through Express
- Production build bundles client with Vite and server with esbuild
- Server serves static files from `dist/public` in production

## External Dependencies

### Database
- **PostgreSQL**: Primary data store, connected via `DATABASE_URL` environment variable
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI Framework
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant styling
- **tailwindcss**: Utility-first CSS framework

### Form Handling
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Zod resolver for form validation
- **zod**: Schema validation for both client and server

### Data Fetching
- **@tanstack/react-query**: Server state management and caching

### Development Tools
- **Vite**: Build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **drizzle-kit**: Database migration tooling

---

<!-- BMAD-METHOD-START -->
# BMad Method v6.0.0-Beta.7 — Agent Configuration

## Overview

This project uses the **BMad Method** — an AI-driven agile development framework. It provides structured agent personas and workflows that guide projects from idea through implementation.

**How to use:** Just speak naturally. Say things like "act as the PM", "create a PRD", "what should I do next?", or use any 2-letter code (BP, CP, CA, etc.).

## Routing

When the user's message matches a BMAD trigger phrase, agent name, or workflow code:

1. **Read the routing table:** `_bmad/replit-routing.md`
2. **Match the request** to an agent or workflow using the trigger phrases listed there
3. **Load the matched file** and follow its instructions
4. **For workflows:** Execute using `_bmad/core/tasks/workflow.xml` as the execution engine
5. **For agents:** Adopt the persona and present the agent's menu
6. **For "what's next?" or "help":** Execute `_bmad/core/tasks/help.md`

## Quick Reference — Agents

| Say | Agent | Role |
|---|---|---|
| "act as analyst" or "Mary" | Business Analyst | Brainstorming, research, briefs |
| "act as PM" or "John" | Product Manager | PRDs, epics, stories |
| "act as architect" or "Winston" | Architect | Technical architecture |
| "act as UX designer" or "Sally" | UX Designer | User experience design |
| "act as dev" or "Amelia" | Developer | Story implementation |
| "act as QA" or "Quinn" | QA Engineer | Testing and quality |
| "act as SM" or "Bob" | Scrum Master | Sprint planning and management |
| "act as tech writer" or "Paige" | Technical Writer | Documentation |
| "quick flow" or "Barry" | Quick Flow Solo Dev | Fast builds, simple projects |
| "start BMad" | BMad Master | Initialize and get oriented |

## Quick Reference — Key Workflows

| Say | Code | What It Does |
|---|---|---|
| "assess brownfield" | AB | Scan existing project, find best BMAD entry point |
| "brainstorm" | BP | Generate and explore ideas |
| "create brief" | CB | Nail down the product idea |
| "create PRD" | CP | Product requirements document |
| "create architecture" | CA | Technical architecture |
| "create epics" | CE | Break work into epics and stories |
| "sprint planning" | SP | Plan the implementation sprint |
| "dev story" | DS | Implement a story |
| "code review" | CR | Review implemented code |
| "what's next?" | BH | Get guidance on next steps |
| "quick spec" | QS | Fast technical spec (simple projects) |
| "quick dev" | QD | Fast implementation (simple projects) |

## Project State

- **Current Phase:** Phase 3 — Solutioning (entered via brownfield assessment)
- **Project Type:** brownfield
- **Brownfield Path:** Custom — Full BMAD Adoption + Testing
- **Completed Artifacts:** brownfield-assessment.md
- **Technology Stack:** TypeScript, React 19, Express, Drizzle ORM, PostgreSQL, Tailwind CSS, Radix UI
- **Next Workflow:** Generate Project Context (GPC)
- **Migration Source:** `docs/dev-assist/project/` (problem-statement, user-stories, mvp-scope, user-flows, data-model)

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
├── _memory/              # Agent memory (tech writer standards)
└── replit-routing.md     # Trigger phrase → file routing table

_bmad-output/             # Generated artifacts go here
├── planning-artifacts/   # Briefs, PRDs, architecture, UX docs
└── implementation-artifacts/  # Sprint plans, stories, reviews
```

## BMad Configuration

- **User config:** `_bmad/core/config.yaml` (user name, language)
- **Project config:** `_bmad/bmm/config.yaml` (project name, skill level, output paths)
- **Help catalog:** `_bmad/_config/bmad-help.csv` (phase-sequenced workflow guide)
<!-- BMAD-METHOD-END -->
