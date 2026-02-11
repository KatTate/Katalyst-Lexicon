# Data Model

*Source: Original design document + current implementation + validation 2026-01-10*

## Overview

The Katalyst Lexicon data model supports term management, principles, editorial workflows, categorization, and user governance. The current implementation uses PostgreSQL with Drizzle ORM.

## Entities

### Term

**Purpose:** Core vocabulary entry - the central entity of the system.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| name | String | Yes | Canonical term name |
| category | String | Yes | Domain classification |
| definition | Text | Yes | Non-circular definition |
| whyExists | Text | Yes | Problem this term solves |
| usedWhen | Text | No | Inclusion rules |
| notUsedWhen | Text | No | Exclusion rules |
| examplesGood | String[] | No | Good usage examples |
| examplesBad | String[] | No | Bad usage examples |
| synonyms | String[] | No | Alternate names mapping to this term |
| status | Enum | Yes | Draft, In Review, Canonical, Deprecated |
| visibility | Enum | Yes | Internal, Client-Safe, Public |
| owner | String | No | Steward responsible for this term |
| version | Integer | Yes | Current version number |
| updatedAt | Timestamp | Yes | Last modification time |

**Status Values:**
- `Draft`: Not yet submitted for review
- `In Review`: Pending approval
- `Canonical`: Approved and authoritative
- `Deprecated`: Replaced by another term

**Visibility Values:**
- `Internal`: Only for internal team
- `Client-Safe`: Can be shared with clients
- `Public`: Can be published externally

**Relationships:**
- Belongs to Category (via category name)
- Has many Proposals (via termId)
- Has many Principles (via principleTermLinks)
- *[NEEDED]* Has many TermVersions for history
- *[NEEDED]* Has parent Term (for hierarchy)
- *[NEEDED]* Replaces/Replaced by Term (for deprecation)

---

### TermVersion (TO BE BUILT)

**Purpose:** Full version history with snapshots for audit trail.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| termId | UUID | Yes | FK to Term |
| versionNumber | Integer | Yes | Sequential version |
| snapshotJson | JSON | Yes | Complete term state at this version |
| changeNote | Text | Yes | Why this change was made |
| changedBy | String | Yes | Who made the change |
| changedAt | Timestamp | Yes | When the change was made |

**Note:** This entity needs to be created. Currently only a version counter exists.

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
| whyExists | Text | Yes | Proposed why it exists |
| usedWhen | Text | No | Proposed inclusion rules |
| notUsedWhen | Text | No | Proposed exclusion rules |
| reviewComment | Text | No | Reviewer feedback |
| submittedAt | Timestamp | Yes | When proposed |

**Status Values:**
- `pending`: Awaiting review
- `in_review`: Being reviewed
- `changes_requested`: Needs revision
- `approved`: Accepted, ready to publish
- `rejected`: Declined

**GAPS - Fields needed:**
- `examplesGood`: String[] - Good usage examples
- `examplesBad`: String[] - Bad usage examples  
- `synonyms`: String[] - Alternate names

---

### Principle

**Purpose:** Longer-form philosophies and manifestos that complement individual terms.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| title | String | Yes | Principle title |
| slug | String | Yes | URL-friendly identifier |
| summary | Text | Yes | Brief description |
| body | Text | Yes | Full content (markdown) |
| status | Enum | Yes | Draft, Published, Archived |
| visibility | Enum | Yes | Internal, Client-Safe, Public |
| owner | String | Yes | Who maintains this |
| tags | String[] | No | Categorization tags |
| sortOrder | Integer | Yes | Display order |
| createdAt | Timestamp | Yes | Creation time |
| updatedAt | Timestamp | Yes | Last modification |

**Status:** ✅ Implemented

---

### PrincipleTermLink

**Purpose:** Join table connecting principles to related terms (bidirectional).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| principleId | UUID | Yes | FK to Principle |
| termId | UUID | Yes | FK to Term |

**Status:** ✅ Implemented

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

**Role Permissions (Confirmed):**
- `Member`: Browse, search, propose new terms/edits
- `Approver`: All Member permissions + review and publish
- `Admin`: All permissions + system configuration

**Status:** ✅ Implemented

---

### Setting

**Purpose:** Key-value configuration store.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| key | String | Yes | Setting name (unique) |
| value | Boolean | Yes | Setting value |

**Current Settings:**
- `require_approver_signoff`
- `require_change_note`
- `allow_self_approval`
- `weekly_digest`
- `new_proposal_alerts`
- `changes_requested_alerts`
- `enable_client_portal`
- `enable_public_glossary`

---

## Relationship Diagram

```
Category 1 ──── * Term
                   │
                   ├── * Proposal
                   │
                   ├── * TermVersion (TO BUILD)
                   │
                   └── * PrincipleTermLink * ──── 1 Principle

Term ──── Term (parent/child - TO BUILD)
Term ──── Term (replaces - TO BUILD)

User (roles control access to all entities)

Setting (system configuration)
```

---

## Schema Gaps To Address

| Gap | Description | Priority |
|-----|-------------|----------|
| TermVersion entity | Full version history with snapshots | High |
| Proposal examples/synonyms | Missing fields on proposal form | High |
| Term.parentId | Self-reference for hierarchy | Medium |
| Term.replacesId | Points to replacement term | Medium |
| TermRelationship entity | For related_to relationships | Low |

---

*Created: 2026-01-10*
*Validated: 2026-01-10 - Identified gaps for version history and relationships*
