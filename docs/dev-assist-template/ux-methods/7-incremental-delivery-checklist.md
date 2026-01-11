# Incremental Delivery Checklist

Break your project into shippable chunks. Build in layers so you have something working at each stage.

---

## AI Facilitation Guide

### When To Use This
- After scope, flows, data, and components are defined
- When starting implementation
- When project feels overwhelming
- When recovering from scope creep

### How To Facilitate

**Duration:** 15-20 minutes

**Your approach:**
1. Review all the pieces we've designed
2. Identify the critical path - what must work first
3. Organize work into layers (foundation → features → polish)
4. Create concrete tasks for each layer
5. Set mini-milestones to celebrate progress

**Opening script:**
> "We've got a solid design. Now let's figure out the order to build things so we have a working app as early as possible. We'll start with the foundation and add features in layers. At each step, you'll have something that works."

**Key questions to ask:**
1. "What's the absolute minimum we need for the app to run?"
2. "What's the first thing a user should be able to do?"
3. "What depends on what? What must exist before we can build the next thing?"
4. "What can we stub out or simplify in the first pass?"
5. "Where do we want to pause and test before continuing?"

**Ordering principles:**
- Data layer before UI (need a place to store things)
- Read before write (display data before editing it)
- Core flow before edge cases
- Happy path before error handling
- Function before beauty

**Watch for:**
- Jumping to polish before core works
- Building features that depend on unbuilt foundations
- Trying to do everything at once
- Paralysis from too many options

**Closing script:**
> "Here's our build order: [summarize layers]. Each layer builds on the last. After each one, we'll have something that works. Ready to start with Layer 1?"

---

## The Layered Approach

### Layer 0: Foundation
Get the basic app running with data.

- [ ] Project setup (dependencies, configuration)
- [ ] Database schema and migrations
- [ ] Basic data seeding for development
- [ ] Health check endpoint
- [ ] App runs without crashing

**Milestone:** App starts and connects to database

### Layer 1: Core Data Display
Show the main content (read-only).

- [ ] Fetch main entities from database
- [ ] Display list of entities
- [ ] Display detail view of single entity
- [ ] Basic navigation between list and detail
- [ ] Loading states

**Milestone:** User can browse and view content

### Layer 2: Primary User Action
Enable the core action users will do most.

- [ ] Form for creating/submitting
- [ ] Save to database
- [ ] Success/error feedback
- [ ] New item appears in list
- [ ] Basic validation

**Milestone:** User can create new content

### Layer 3: Edit and Delete
Complete the CRUD cycle.

- [ ] Edit existing items
- [ ] Delete items (with confirmation)
- [ ] Proper state updates after changes

**Milestone:** Full create, read, update, delete working

### Layer 4: Organization and Filtering
Help users find and organize content.

- [ ] Categories or groupings
- [ ] Filters (by status, category, etc.)
- [ ] Search functionality
- [ ] Sort options

**Milestone:** User can find what they're looking for

### Layer 5: Additional Features
Add remaining MVP features.

- [ ] [Feature from MVP scope]
- [ ] [Feature from MVP scope]
- [ ] [Feature from MVP scope]

**Milestone:** All MVP features functional

### Layer 6: Polish and Edge Cases
Handle real-world messiness.

- [ ] Empty states for all views
- [ ] Error handling and messages
- [ ] Form validation improvements
- [ ] Mobile responsiveness
- [ ] Performance optimization
- [ ] Accessibility basics

**Milestone:** App handles edge cases gracefully

### Layer 7: Launch Prep
Get ready for real users.

- [ ] Final testing pass
- [ ] Remove any test data/code
- [ ] Environment configuration
- [ ] Deployment verification

**Milestone:** Ready to ship!

---

## Task Breakdown Template

For each task, capture:

```markdown
### [Task Name]

**Layer:** [Which layer this belongs to]

**Description:** [What needs to happen]

**Dependencies:** [What must be done first]

**Files likely involved:**
- [file path]
- [file path]

**Definition of done:**
- [ ] [Specific completion criteria]
- [ ] [Another criterion]
- [ ] Works in browser without console errors

**Notes:**
[Any context or decisions]
```

---

## Template For `docs/project/delivery-plan.md`

```markdown
# Delivery Plan

## Overview

[Brief summary of the build approach]

## Layer 0: Foundation

### Task: Project Setup
**Status:** [ ] Not Started / [ ] In Progress / [x] Done
**Description:** Initialize project, install dependencies
**Done when:**
- [x] Dependencies installed
- [x] App runs locally

---

### Task: Database Schema
**Status:** [ ] Not Started / [x] In Progress / [ ] Done
**Description:** Create all tables based on data model
**Dependencies:** Project setup
**Done when:**
- [x] All entities have tables
- [ ] Migrations run successfully
- [ ] Seed data works

---

## Layer 1: Core Data Display

### Task: [Entity] List View
**Status:** [ ] Not Started / [ ] In Progress / [ ] Done
**Description:** Display all [entities] in a list
**Dependencies:** Database schema
**Done when:**
- [ ] API endpoint returns [entities]
- [ ] Page displays list
- [ ] Loading state shows while fetching

---

### Task: [Entity] Detail View
**Status:** [ ] Not Started / [ ] In Progress / [ ] Done
**Description:** Display full details of one [entity]
**Dependencies:** List view
**Done when:**
- [ ] Click from list navigates to detail
- [ ] All fields displayed
- [ ] Back navigation works

---

## Layer 2: Primary User Action

[Continue the pattern...]

---

## Milestones

| Milestone | Target | Status |
|-----------|--------|--------|
| Foundation complete | [Date] | [ ] |
| Core display working | [Date] | [ ] |
| Can create content | [Date] | [ ] |
| Full CRUD working | [Date] | [ ] |
| MVP complete | [Date] | [ ] |
| Ready to ship | [Date] | [ ] |

---

*Created: [Date]*
*Last Updated: [Date]*
```

---

## Dependency Ordering

When tasks depend on each other:

```
[Schema] ─────┬───→ [API Endpoints]
              │
              └───→ [Seed Data]

[API Endpoints] ──→ [List View] ──→ [Detail View]
                          │
                          └─────────→ [Create Form]
```

Build from left to right, top to bottom.

---

## Transition To Next Step

Once implementation layers are complete:

> "Nice work, we have a working app! Before we call it done, let's do a structured walkthrough to catch any issues. This is our quality check. Ready?"

→ Proceed to **QA Walkthrough Template**
