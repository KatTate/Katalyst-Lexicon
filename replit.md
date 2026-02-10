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
# BMad Method v6.0.0-beta.7-replit.2 -- Agent Configuration

## IMPORTANT: How You Must Operate in This Project

This is a **BMad Method** project. You MUST follow these rules in every conversation:

1. **Check every user message against the routing tables below.** Trigger phrases are not exact-match-only -- use intent matching. If the user's message contains or implies a trigger phrase, activate that route. Example: "should we do sprint planning for Epic 2?" contains the intent "sprint planning" and MUST activate the SP workflow with the Scrum Master persona.
2. **When a route matches, load the referenced file and follow it.** Do not answer the question in your own words. Load the workflow or agent file and execute it.
3. **For workflows:** First load `_bmad/core/tasks/workflow.xml` (the execution engine), then load the matched workflow file. Execute ALL steps IN ORDER. When a step says WAIT for user input, STOP and WAIT.
4. **For agents:** Load the agent file, adopt that persona completely, and present the agent's menu.
5. **Never skip, summarize, or improvise** workflow steps. Never auto-proceed past WAIT points.
6. **If no route matches,** respond normally but remain aware that this is a BMAD project. If the user seems to be asking about project planning, development, or process, suggest the relevant BMAD workflow.
7. **If unsure whether a route matches,** ask: "Would you like me to run the [workflow name] workflow for that?"

## Agent Routing

| Trigger Phrases | Agent | File |
|---|---|---|
| "act as analyst", "be the analyst", "I need Mary", "business analysis", "brainstorm" | Mary — 📊 Business Analyst | `_bmad/bmm/agents/analyst.md` |
| "act as PM", "be the PM", "I need John", "product manager", "create PRD", "product requirements" | John — 📋 Product Manager | `_bmad/bmm/agents/pm.md` |
| "act as architect", "be the architect", "I need Winston", "architecture", "technical design" | Winston — 🏗️ Architect | `_bmad/bmm/agents/architect.md` |
| "act as UX designer", "be the designer", "I need Sally", "UX design", "user experience" | Sally — 🎨 UX Designer | `_bmad/bmm/agents/ux-designer.md` |
| "act as dev", "be the developer", "I need Amelia", "implement story", "dev story" | Amelia — 💻 Developer Agent | `_bmad/bmm/agents/dev.md` |
| "act as QA", "be QA", "I need Quinn", "quality assurance", "test" | Quinn — 🧪 QA Engineer | `_bmad/bmm/agents/qa.md` |
| "act as scrum master", "be the SM", "I need Bob", "sprint planning", "sprint status" | Bob — 🏃 Scrum Master | `_bmad/bmm/agents/sm.md` |
| "act as tech writer", "be the writer", "I need Paige", "documentation", "write document" | Paige — 📚 Technical Writer | `_bmad/bmm/agents/tech-writer/tech-writer.md` |
| "act as quick flow dev", "quick flow", "I need Barry", "solo dev", "quick build" | Barry — 🚀 Quick Flow Solo Dev | `_bmad/bmm/agents/quick-flow-solo-dev.md` |
| "act as BMad", "BMad master", "start BMad", "begin", "initialize" | BMad Master | `_bmad/core/agents/bmad-master.md` |

## Workflow Routing — Phase 0: Assessment (Brownfield)

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "assess brownfield", "AB", "scan existing project", "brownfield assessment", "assess this project", "what do I have here?" | AB | Assess Brownfield | `_bmad/bmm/workflows/0-assess/assess-brownfield/workflow.md` |

## Workflow Routing — Phase 1: Analysis

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "brainstorm", "brainstorm project", "BP", "generate ideas" | BP | Brainstorm Project | `_bmad/core/workflows/brainstorming/workflow.md` |
| "market research", "MR", "competitive analysis", "market analysis" | MR | Market Research | `_bmad/bmm/workflows/1-analysis/research/workflow-market-research.md` |
| "domain research", "DR", "industry research", "domain deep dive" | DR | Domain Research | `_bmad/bmm/workflows/1-analysis/research/workflow-domain-research.md` |
| "technical research", "TR", "tech feasibility", "technology research" | TR | Technical Research | `_bmad/bmm/workflows/1-analysis/research/workflow-technical-research.md` |
| "create brief", "CB", "product brief", "project brief" | CB | Create Brief | `_bmad/bmm/workflows/1-analysis/create-product-brief/workflow.md` |

## Workflow Routing — Phase 2: Planning

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "create PRD", "CP", "product requirements", "requirements document" | CP | Create PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-create-prd.md` |
| "validate PRD", "VP", "review PRD", "check PRD" | VP | Validate PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-validate-prd.md` |
| "edit PRD", "EP", "update PRD", "modify PRD" | EP | Edit PRD | `_bmad/bmm/workflows/2-plan-workflows/create-prd/workflow-edit-prd.md` |
| "create UX", "CU", "UX design", "design the UX", "user experience design" | CU | Create UX | `_bmad/bmm/workflows/2-plan-workflows/create-ux-design/workflow.md` |

## Workflow Routing — Phase 3: Solutioning

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "create architecture", "CA", "architect the solution", "technical architecture" | CA | Create Architecture | `_bmad/bmm/workflows/3-solutioning/create-architecture/workflow.md` |
| "create epics", "CE", "epics and stories", "create stories", "break into stories" | CE | Create Epics and Stories | `_bmad/bmm/workflows/3-solutioning/create-epics-and-stories/workflow.md` |
| "check readiness", "IR", "implementation readiness", "ready to implement?" | IR | Check Implementation Readiness | `_bmad/bmm/workflows/3-solutioning/check-implementation-readiness/workflow.md` |

## Workflow Routing — Phase 4: Implementation

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "sprint planning", "SP", "plan the sprint", "create sprint plan" | SP | Sprint Planning | `_bmad/bmm/workflows/4-implementation/sprint-planning/workflow.yaml` |
| "sprint status", "SS", "where are we?", "what's the sprint status?" | SS | Sprint Status | `_bmad/bmm/workflows/4-implementation/sprint-status/workflow.yaml` |
| "create story", "CS", "prepare next story", "next story" | CS | Create Story | `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml` |
| "validate story", "VS", "check story", "story ready?" | VS | Validate Story | `_bmad/bmm/workflows/4-implementation/create-story/workflow.yaml` |
| "dev story", "DS", "implement story", "build the story", "code the story" | DS | Dev Story | `_bmad/bmm/workflows/4-implementation/dev-story/workflow.yaml` |
| "QA test", "QA", "automate tests", "create tests", "test automation" | QA | QA Automation Test | `_bmad/bmm/workflows/qa/automate/workflow.yaml` |
| "code review", "CR", "review code", "review my code" | CR | Code Review | `_bmad/bmm/workflows/4-implementation/code-review/workflow.yaml` |
| "retrospective", "ER", "epic retro", "what went well?" | ER | Retrospective | `_bmad/bmm/workflows/4-implementation/retrospective/workflow.yaml` |

## Workflow Routing — Anytime

| Trigger Phrases | Code | Workflow | File |
|---|---|---|---|
| "document project", "DP", "analyze codebase", "scan project" | DP | Document Project | `_bmad/bmm/workflows/document-project/workflow.yaml` |
| "generate project context", "GPC", "project context", "scan codebase for context" | GPC | Generate Project Context | `_bmad/bmm/workflows/generate-project-context/workflow.md` |
| "quick spec", "QS", "quick architecture", "fast spec" | QS | Quick Spec | `_bmad/bmm/workflows/bmad-quick-flow/quick-spec/workflow.md` |
| "quick dev", "QD", "quick build", "just build it", "quick implementation" | QD | Quick Dev | `_bmad/bmm/workflows/bmad-quick-flow/quick-dev/workflow.md` |
| "correct course", "CC", "change direction", "pivot", "we need to change" | CC | Correct Course | `_bmad/bmm/workflows/4-implementation/correct-course/workflow.yaml` |
| "write document", "WD", "create document", "draft document" | WD | Write Document | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "update standards", "US", "documentation standards", "update writing rules" | US | Update Standards | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "mermaid", "MG", "create diagram", "generate diagram" | MG | Mermaid Generate | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "validate document", "VD", "review document", "check document quality" | VD | Validate Document | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "explain concept", "EC", "explain this", "break it down" | EC | Explain Concept | `_bmad/bmm/agents/tech-writer/tech-writer.agent.yaml` |
| "party mode", "PM", "multi-agent", "agent discussion", "group review" | PM | Party Mode | `_bmad/core/workflows/party-mode/workflow.md` |
| "what should I do next?", "help", "BH", "what's next?", "I'm stuck" | BH | BMad Help | `_bmad/core/tasks/help.md` |
| "index docs", "ID", "create index", "index documents" | ID | Index Docs | `_bmad/core/tasks/index-docs.xml` |
| "shard document", "SD", "split document", "break up document" | SD | Shard Document | `_bmad/core/tasks/shard-doc.xml` |
| "editorial review prose", "review prose", "polish writing" | — | Editorial Review - Prose | `_bmad/core/tasks/editorial-review-prose.xml` |
| "editorial review structure", "review structure", "reorganize document" | — | Editorial Review - Structure | `_bmad/core/tasks/editorial-review-structure.xml` |
| "adversarial review", "AR", "critical review", "find weaknesses" | AR | Adversarial Review | `_bmad/core/tasks/review-adversarial-general.xml` |

## Routing Priority

1. **Exact code match** — If user types a 2-letter code (BP, CP, CA, etc.), route directly to that workflow
2. **Agent name match** — If user mentions an agent by name (Mary, John, Winston, etc.), load that agent
3. **Keyword/intent match** — Match against trigger phrases in the tables above. Use intent matching, not just exact phrases. Example: "should we do sprint planning for Epic 2?" contains the intent "sprint planning" and matches the SP workflow.
4. **Ambiguous request** — If unclear, ask the user to clarify or suggest the most likely match
5. **"What's next?" / "help"** — Always route to `_bmad/core/tasks/help.md`

## Execution Protocol

When a route is matched:
1. Read the target file completely before responding
2. For agents: adopt the persona and present their menu
3. For workflows: load and execute following `_bmad/core/tasks/workflow.xml` as the execution engine — read the COMPLETE file, execute ALL steps IN ORDER, never skip steps
4. For tasks: execute the task directly
5. Load BMAD settings from `_bmad/bmm/config.yaml`; resolve user/project/language from Replit environment ($REPLIT_USER, $REPL_SLUG, $LANG)
6. When a workflow says WAIT for user input, STOP and WAIT — do not auto-proceed, simulate responses, or skip ahead

## Project State

- **Current Phase:** Phase 3 — Solutioning (entered via brownfield assessment)
- **Project Type:** brownfield
- **Completed Artifacts:** brownfield-assessment.md, project-context.md, product-brief-katalyst-lexicon-2026-02-06.md, prd-katalyst-lexicon-2026-02-06.md, architecture-katalyst-lexicon-2026-02-06.md, epics-katalyst-lexicon-2026-02-06.md, ux-design-specification.md, ux-design-directions.html

## BMad File Structure

```
_bmad/                    # BMad Method toolkit
├── core/                 # Core engine (workflow executor, help, brainstorming)
│   ├── agents/           # BMad Master agent
│   ├── tasks/            # Help, workflow engine, editorial tasks
│   └── workflows/        # Brainstorming, party mode, elicitation
├── bmm/                  # BMad Methodology Module
│   ├── agents/           # 9 specialist agent personas
│   ├── workflows/        # All phase workflows (analysis -> implementation)
│   ├── data/             # Templates and context files
│   └── teams/            # Team configurations for party mode
├── _config/              # Manifests, help catalog, customization
├── _memory/              # Agent memory (tech writer standards)
└── replit-routing.md     # Routing source (auto-inlined into replit.md on install)

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
