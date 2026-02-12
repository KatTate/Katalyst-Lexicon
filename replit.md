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

## Recent Changes

### Epic 6: Review & Approve Workflow (Feb 2026)
- Stories 6.1-6.4 implemented: proposal review queue, review decisions, audit trail, proposer revision flow
- BMAD code review completed, all HIGH and MEDIUM issues fixed:
  - AC7 permission checks added to ReviewQueue and Layout sidebar
  - Transaction boundaries corrected (inline tx.insert/tx.update instead of storage method calls)
  - Audit events moved inside transaction scope for atomicity
  - request-changes endpoint made symmetric with approve/reject
- ProposalEvents table tracks full audit trail (submitted, changes_requested, resubmitted, approved, rejected, withdrawn)
- LOW issues deferred: missing aria-live on empty state, missing aria-label on audit events, `as any` cast on withdrawn status, missing dedicated storage methods for resubmit/withdraw
- TanStack Query uses staleTime: Infinity — full page reloads required after API mutations to see updated data
- Mock auth uses MOCK_CURRENT_USER constant (duplicated in ReviewQueue and Layout)