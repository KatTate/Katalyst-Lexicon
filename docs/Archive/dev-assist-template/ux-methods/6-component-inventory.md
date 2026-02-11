# Component Inventory

Plan the reusable UI building blocks before you start building. This prevents inconsistency and reduces rework.

---

## AI Facilitation Guide

### When To Use This
- After data model is defined
- Before implementing UI
- When UI feels inconsistent and needs cleanup
- When planning a design system

### How To Facilitate

**Duration:** 15-25 minutes

**Your approach:**
1. Walk through the user flows and identify repeating UI patterns
2. List the "nouns" that need visual representation
3. Identify common actions and their UI patterns
4. Group similar elements into reusable components
5. Define variations (sizes, states, themes)

**Opening script:**
> "Let's plan the UI building blocks we'll need. By identifying reusable components upfront, we'll build faster and keep the interface consistent. I'll walk through the flows and we'll catalog what UI pieces we need."

**Key questions to ask:**
1. "How should [entity] appear when shown in a list?"
2. "What does the detail view of [entity] look like?"
3. "What actions can users take, and how are those presented?"
4. "Are there elements that appear on every page? (header, navigation, etc.)"
5. "What states do things have? (loading, empty, error, success)"

**Pattern recognition prompts:**
- "This looks similar to what we described earlier - can we reuse that?"
- "I see three places where we show a list of items - should those be consistent?"
- "What happens in this component when there's no data?"

**Watch for:**
- Redundant components that should be unified
- Missing states (loading, error, empty)
- Overly complex components that should be broken down
- Missing feedback elements (success messages, confirmations)

**Closing script:**
> "Here's our component inventory: [list major components]. These are the building blocks for the whole app. When we build each one, we'll use it consistently everywhere it appears. Ready to start implementation planning?"

---

## Component Categories

### Layout Components
The structural skeleton of the app.

| Component | Purpose |
|-----------|---------|
| **Page Layout** | Overall page structure (header, main, footer) |
| **Navigation** | Primary navigation menu |
| **Sidebar** | Secondary navigation or filters |
| **Content Area** | Main content container |
| **Modal/Dialog** | Overlay for focused tasks |
| **Drawer** | Slide-out panel |

### Display Components
Show information to users.

| Component | Purpose |
|-----------|---------|
| **Card** | Contained unit of related information |
| **List** | Vertical sequence of items |
| **Table** | Structured data in rows/columns |
| **Detail View** | Full information about one item |
| **Badge** | Status indicator, label, or count |
| **Avatar** | User or entity representation |
| **Empty State** | What to show when there's no data |

### Form Components
Collect input from users.

| Component | Purpose |
|-----------|---------|
| **Form** | Container for input collection |
| **Text Input** | Single-line text entry |
| **Text Area** | Multi-line text entry |
| **Select/Dropdown** | Choose from options |
| **Checkbox/Toggle** | Boolean choice |
| **Radio Group** | Single choice from options |
| **Date Picker** | Date/time selection |
| **File Upload** | File attachment |

### Action Components
Let users do things.

| Component | Purpose |
|-----------|---------|
| **Button** | Primary action trigger |
| **Link** | Navigation action |
| **Menu** | List of actions |
| **Icon Button** | Compact action trigger |
| **Floating Action** | Persistent, prominent action |

### Feedback Components
Communicate status to users.

| Component | Purpose |
|-----------|---------|
| **Toast/Notification** | Temporary status message |
| **Alert** | Important inline message |
| **Progress Indicator** | Loading or completion status |
| **Skeleton** | Loading placeholder |
| **Error Boundary** | Graceful error display |
| **Confirmation Dialog** | Verify destructive actions |

---

## Component Definition Template

```markdown
## Component: [Name]

**Purpose:** [What it's for]

**Used in:** [Pages/contexts where it appears]

**Variants:**
- [Variant 1]: [When to use]
- [Variant 2]: [When to use]

**States:**
- Default
- Hover
- Loading
- Disabled
- Error
- Empty

**Props/Data needed:**
- [prop]: [type] - [description]
- [prop]: [type] - [description]

**Actions:**
- [Action]: [What happens]

**Notes:**
[Any special considerations]
```

---

## Template For `docs/project/components.md`

```markdown
# Component Inventory

## Overview

[Brief description of the component architecture and design approach]

## Layout Components

### [Component Name]
**Purpose:** [What it's for]
**Used in:** [Where it appears]
**Variants:** [List variations]

---

## Display Components

### [Entity] Card
**Purpose:** Display [entity] summary in lists
**Used in:** [Page names]
**States:** Default, Loading, Empty

**Data needed:**
- [field]: [description]
- [field]: [description]

**Actions:**
- Click → Navigate to detail
- [Other actions]

---

### [Entity] List
**Purpose:** Display collection of [entity] cards
**Used in:** [Page names]
**States:** Loading, Empty, Error, Has Data

**Empty state message:** "[What to show when no items]"

---

### [Entity] Detail
**Purpose:** Full view of single [entity]
**Used in:** [Entity] detail page
**Sections:**
- [Section 1]
- [Section 2]

---

## Form Components

### [Entity] Form
**Purpose:** Create/Edit [entity]
**Used in:** Create page, Edit modal
**Fields:**
- [field]: [input type]
- [field]: [input type]

**Validation:**
- [Rule 1]
- [Rule 2]

**Submit behavior:**
- Create: [What happens]
- Edit: [What happens]

---

## Feedback Components

### Toast Messages
**Success:** "[Message pattern]"
**Error:** "[Message pattern]"
**Info:** "[Message pattern]"

---

## Design Tokens

### Colors
- Primary: [Use for]
- Secondary: [Use for]
- Success: [Use for]
- Warning: [Use for]
- Error: [Use for]

### Spacing
- [Spacing system notes]

### Typography
- [Font choices and usage]

---

*Created: [Date]*
*Last Updated: [Date]*
```

---

## Example: Task Manager Components

```markdown
## Display Components

### Task Card
**Purpose:** Show task summary in lists
**Used in:** Task List, Dashboard, Search Results
**States:** Default, Completed, Overdue

**Data needed:**
- title: Task name
- dueDate: When due
- status: Current status
- assignee: Who's responsible

**Actions:**
- Click → Open task detail
- Checkbox → Toggle complete

---

### Task List
**Purpose:** Display filtered collection of tasks
**Used in:** My Tasks, Project View
**States:** Loading, Empty, Has Data

**Empty state:** "No tasks yet. Create your first task to get started."

**Filtering:**
- By status
- By assignee
- By due date

---

## Form Components

### Task Form
**Purpose:** Create or edit a task
**Used in:** New Task modal, Edit Task page
**Fields:**
- title (text, required)
- description (textarea, optional)
- dueDate (date picker, optional)
- assignee (user select, optional)
- status (select, required)

**Validation:**
- Title required, min 3 characters
```

---

## Transition To Next Step

Once the component inventory is complete:

> "We have a clear picture of what we're building. Now let's break this into a delivery plan - the order we'll build things so we have something working as quickly as possible. Ready?"

→ Proceed to **Incremental Delivery Checklist**
