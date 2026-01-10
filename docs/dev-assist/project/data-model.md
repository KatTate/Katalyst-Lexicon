# Data Model

*Extracted from: `attached_assets/Pasted--Design-Document-Katalyst-Lexicon...txt` (Section 8) + Current Implementation*

## Overview

The Katalyst Lexicon data model supports term management, editorial workflows, categorization, and user governance. The current implementation uses PostgreSQL with Drizzle ORM.

## Entities

### Term

**Purpose:** Core vocabulary entry - the central entity of the system.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | String | Yes | Canonical term name |
| category | String | Yes | Domain classification |
| definition | Text | Yes | Non-circular definition |
| whyExists | Text | No | Problem this term solves |
| usedWhen | Text | No | Inclusion rules |
| notUsedWhen | Text | No | Exclusion rules |
| examplesGood | String[] | No | Good usage examples |
| examplesBad | String[] | No | Bad usage examples |
| synonyms | String[] | No | Alternate names mapping to this term |
| status | Enum | Yes | Draft, In Review, Canonical, Deprecated |
| visibility | Enum | Yes | Internal, Client-Safe, Public |
| owner | String | No | Steward responsible for this term |
| version | Integer | Yes | Version number |
| updatedAt | Timestamp | Yes | Last modification time |

**Relationships:**
- Belongs to Category (via category name)
- Has many Proposals (via termId)
- Can be linked to Principles (via principleTermLinks)

**Status Values:**
- `Draft`: Not yet submitted for review
- `In Review`: Pending approval
- `Canonical`: Approved and authoritative
- `Deprecated`: Replaced by another term

**Visibility Values:**
- `Internal`: Only for internal team
- `Client-Safe`: Can be shared with clients
- `Public`: Can be published externally

---

### Category

**Purpose:** Organizational grouping for terms by domain.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | String | Yes | Category name |
| description | Text | No | What this category covers |
| color | String | No | UI color class |
| sortOrder | Integer | Yes | Display order |

**Taxonomy Domains (7 categories):**
1. Organizational - Structure and daily business
2. Planning & Execution - Project management terms
3. Commercial - Client and sales terms
4. Financial - Billing, costing, performance
5. Cultural - Values and philosophy
6. Methodology - Process and approach terms
7. Systems - Tool-specific terminology

---

### Proposal

**Purpose:** Editorial workflow for term changes and new submissions.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| termId | UUID | No | FK to existing term (null for new) |
| termName | String | Yes | Proposed term name |
| category | String | Yes | Proposed category |
| type | Enum | Yes | 'new' or 'edit' |
| status | Enum | Yes | Workflow state |
| submittedBy | String | Yes | Who proposed this |
| assignedTo | String | No | Who is reviewing |
| changesSummary | Text | No | What changed and why |
| definition | Text | Yes | Proposed definition |
| whyExists | Text | No | Proposed why it exists |
| usedWhen | Text | No | Proposed inclusion rules |
| notUsedWhen | Text | No | Proposed exclusion rules |
| reviewComment | Text | No | Reviewer feedback |
| submittedAt | Timestamp | Yes | When proposed |

**Status Values:**
- `pending`: Awaiting review
- `approved`: Accepted, ready to publish
- `rejected`: Declined
- `changes_requested`: Needs revision

---

### Principle

**Purpose:** Longer-form philosophies and manifestos that complement individual terms.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| title | String | Yes | Principle title |
| slug | String | Yes | URL-friendly identifier |
| summary | Text | No | Brief description |
| body | Text | Yes | Full content (markdown) |
| status | Enum | Yes | Draft, Published, Archived |
| visibility | Enum | Yes | Internal, Client-Safe, Public |
| tags | String[] | No | Categorization tags |
| createdAt | Timestamp | Yes | Creation time |
| updatedAt | Timestamp | Yes | Last modification |

**Relationships:**
- Has many Terms (via principleTermLinks)

---

### PrincipleTermLink

**Purpose:** Join table connecting principles to related terms.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| principleId | UUID | Yes | FK to Principle |
| termId | UUID | Yes | FK to Term |

---

### User

**Purpose:** System users with role-based access.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | String | Yes | Display name |
| email | String | Yes | Login email (unique) |
| role | Enum | Yes | Member, Approver, Admin |
| status | Enum | Yes | active, invited, inactive |

**Role Permissions:**
- `Member`: Browse, search, propose new terms/edits
- `Approver`: All Member permissions + review and publish
- `Admin`: All permissions + system configuration

---

### Setting

**Purpose:** Key-value configuration store.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| key | String | Yes | Setting name (unique) |
| value | JSON | Yes | Setting value |

**Current Settings:**
- `require_approver_signoff`: Boolean
- `require_change_note`: Boolean
- `allow_self_approval`: Boolean
- `weekly_digest`: Boolean
- `new_proposal_alerts`: Boolean
- `changes_requested_alerts`: Boolean
- `enable_client_portal`: Boolean
- `enable_public_glossary`: Boolean

---

## Relationship Diagram

```
Category 1 ──── * Term
                   │
                   ├── * Proposal
                   │
                   └── * PrincipleTermLink * ──── 1 Principle

User (roles control access to all entities)

Setting (system configuration)
```

---

## Notes

- Terms use category name as string reference rather than FK for flexibility
- Version field on Term tracks edit count, not full version snapshots
- Proposal holds a complete snapshot of proposed changes
- The original design included TermVersion and Relationship entities for more complex versioning and term relationships - these are candidates for V2

---

*Created: 2026-01-10*
*Source: Original Design Document (Section 8) + shared/schema.ts*
