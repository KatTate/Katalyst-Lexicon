# Schema-First Data Modeling

Define your data structure before writing code. Start with what information needs to exist, then build from there.

---

## AI Facilitation Guide

### When To Use This
- After MVP scope and user flows are defined
- Before implementing any features that store data
- When adding new features that require new data
- When existing data structure is causing problems

### How To Facilitate

**Duration:** 20-30 minutes

**Your approach:**
1. Walk through each user flow and identify what data is needed
2. Ask about the nouns - what "things" exist in this system?
3. For each thing, ask what information we need to store
4. Identify relationships between things
5. Consider what changes over time vs what's static

**Opening script:**
> "Before we start building, let's figure out what data we need to store. I'll ask about the 'things' in your app and what we need to know about each one. This becomes the foundation everything else is built on."

**Key questions to ask:**
1. "What are the main 'things' in this app? (People, items, events, etc.)"
2. "For each thing: what information do we need to track?"
3. "How do these things relate to each other?"
4. "Does this information change over time, or is it set once?"
5. "Who can see this information? Who can change it?"

**Extracting entities from user stories:**

| User Story | Entities Implied |
|------------|------------------|
| "As a user, I want to create posts" | User, Post |
| "As an admin, I want to organize items into categories" | Item, Category |
| "As a customer, I want to add products to my cart" | Customer (User), Product, Cart, CartItem |
| "As a user, I want to see who commented on my post" | User, Post, Comment |

**Watch for:**
- Missing timestamps (usually need createdAt, updatedAt)
- Missing status fields (often things have states: draft, published, archived)
- Missing relationships (how do things connect?)
- Over-engineering (don't add fields "just in case")

**Closing script:**
> "Here's our data model: [list entities and key fields]. These become your database tables. Each entity has the fields we identified. Ready to move on to planning the UI components?"

---

## The Data Modeling Process

### Step 1: Identify Entities

An entity is a "thing" your app needs to track. Common patterns:

| Category | Examples |
|----------|----------|
| **Users** | User, Account, Profile, Team, Organization |
| **Content** | Post, Article, Comment, Message, Document |
| **Items** | Product, Item, Asset, File, Media |
| **Transactions** | Order, Payment, Booking, Subscription |
| **Organization** | Category, Tag, Folder, Collection |
| **Events** | Log, Activity, Notification, Audit |
| **Configuration** | Setting, Preference, Permission |

### Step 2: Define Fields For Each Entity

For each entity, identify:

| Field Type | Purpose | Examples |
|------------|---------|----------|
| **ID** | Unique identifier | id (UUID or auto-increment) |
| **Core Data** | Essential information | name, email, title, description |
| **Status** | Current state | status, isActive, isPublished |
| **Relationships** | Links to other entities | userId, categoryId, parentId |
| **Metadata** | System information | createdAt, updatedAt, createdBy |
| **Computed** | Derived values (optional) | commentCount, totalPrice |

### Step 3: Define Relationships

| Relationship | Meaning | Example |
|--------------|---------|---------|
| **One-to-One** | Each A has exactly one B | User → Profile |
| **One-to-Many** | Each A has many Bs | User → Posts |
| **Many-to-Many** | As and Bs can connect freely | Posts ↔ Tags |

For many-to-many, you need a join table:
- Posts ↔ Tags becomes: Posts → PostTags ← Tags

---

## Data Model Template

### Entity Definition Format

```markdown
## Entity: [Name]

**Purpose:** [Why this exists]

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [field] | [type] | [Yes/No] | [What it stores] |
| createdAt | Timestamp | Yes | When created |
| updatedAt | Timestamp | Yes | When last modified |

**Relationships:**
- [Relationship description]

**Status Values (if applicable):**
- [status1]: [meaning]
- [status2]: [meaning]
```

---

## Common Field Types

| Type | Use For | Examples |
|------|---------|----------|
| **String/Text** | Names, titles, short text | name, email, title |
| **Text/Long Text** | Long content | description, body, notes |
| **Integer** | Counts, quantities | quantity, sortOrder, version |
| **Decimal** | Money, precise numbers | price, rating |
| **Boolean** | Yes/no flags | isActive, isPublished, isAdmin |
| **Timestamp** | Dates and times | createdAt, dueDate, publishedAt |
| **UUID** | Unique identifiers | id, externalId |
| **Enum** | Limited set of values | status, role, type |
| **JSON/Array** | Flexible structured data | tags, metadata, settings |

---

## Template For `docs/project/data-model.md`

```markdown
# Data Model

## Overview

[Brief description of the data architecture]

## Entities

### [Entity Name]

**Purpose:** [Why this entity exists]

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [field] | [type] | [Yes/No] | [Description] |
| [field] | [type] | [Yes/No] | [Description] |
| createdAt | Timestamp | Yes | Creation timestamp |
| updatedAt | Timestamp | Yes | Last update timestamp |

**Relationships:**
- Has many [OtherEntity] (via [foreignKey])
- Belongs to [OtherEntity] (via [foreignKey])

**Status Values:**
- `draft`: [meaning]
- `published`: [meaning]
- `archived`: [meaning]

---

### [Next Entity]

[Repeat the pattern]

---

## Relationship Diagram

```
[Entity A] 1 ──── * [Entity B]
    │
    └── 1 ──── 1 [Entity C]

[Entity D] * ──── * [Entity E]
           (via [JoinTable])
```

## Notes

- [Any important notes about data design decisions]
- [Constraints or rules to remember]

---

*Created: [Date]*
*Last Updated: [Date]*
```

---

## Example: Blog Platform

```markdown
## Entity: User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| email | String | Yes | Login email, unique |
| name | String | Yes | Display name |
| role | Enum | Yes | 'user', 'admin' |
| createdAt | Timestamp | Yes | When registered |
| updatedAt | Timestamp | Yes | Last profile update |

## Entity: Post

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| authorId | UUID | Yes | FK to User |
| title | String | Yes | Post title |
| slug | String | Yes | URL-friendly title |
| body | Text | Yes | Post content |
| status | Enum | Yes | 'draft', 'published' |
| publishedAt | Timestamp | No | When published |
| createdAt | Timestamp | Yes | When created |
| updatedAt | Timestamp | Yes | Last edit |

**Relationships:**
- Belongs to User (authorId)
- Has many Comments
- Has many Tags (via PostTags)
```

---

## Transition To Next Step

Once the data model is defined:

> "The data model looks solid. Now let's plan the UI components we'll need to display and interact with this data. We'll create an inventory of reusable components. Ready?"

→ Proceed to **Component Inventory**
