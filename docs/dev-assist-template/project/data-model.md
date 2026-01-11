# Data Model

*Created using Guide #5: Schema-First Data Modeling*

## Overview

[Brief description of the data model and its purpose]

## Entities

### [Entity Name]

**Purpose:** [What this entity represents]

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [field] | [type] | [Yes/No] | [Description] |
| [field] | [type] | [Yes/No] | [Description] |
| [field] | [type] | [Yes/No] | [Description] |
| createdAt | Timestamp | Yes | Creation time |
| updatedAt | Timestamp | Yes | Last modification |

**Relationships:**
- [Has many / Belongs to] [Other Entity]
- [Has many / Belongs to] [Other Entity]

---

### [Entity Name]

**Purpose:** [What this entity represents]

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [field] | [type] | [Yes/No] | [Description] |
| [field] | [type] | [Yes/No] | [Description] |

**Relationships:**
- [Relationship description]

---

### [Entity Name]

**Purpose:** [What this entity represents]

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | UUID | Yes | Primary key |
| [field] | [type] | [Yes/No] | [Description] |

---

## Enumerations

### [Enum Name]
**Used by:** [Entity.field]
**Values:**
- `value1` - [Description]
- `value2` - [Description]
- `value3` - [Description]

---

## Relationship Diagram

```
[Entity1] 1 ──── * [Entity2]
    │
    └── * [Entity3]

[Entity4] * ──── * [Entity5] (via [JoinTable])
```

---

## Notes

- [Important consideration about the data model]
- [Constraint or validation rule]
- [Future considerations]

---

*Created: [Date]*
*Last Updated: [Date]*
