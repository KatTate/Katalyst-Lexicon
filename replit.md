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