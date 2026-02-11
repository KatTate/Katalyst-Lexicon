# Dev-Assist Template

A portable framework for AI-assisted software development. Contains methodology guides and blank project documentation templates.

---

## Quick Start

1. **Copy this entire folder** to your new project's `docs/` directory
2. **Rename** from `dev-assist-template` to `dev-assist`
3. **Start building** - the AI will read `AI-GUIDE.md` and guide you through the process

**Note:** The `project/` folder contains blank templates with placeholders. Fill them in as you work through each phase.

---

## For AI Agents

**Start here:** Read [`AI-GUIDE.md`](./AI-GUIDE.md) first. It explains how to use this framework to guide users through building software.

---

## Framework Overview

This framework walks creators through 5 phases:

```
DISCOVER → DEFINE → DESIGN → BUILD → VALIDATE
```

Each phase has methodology guides that provide step-by-step processes and templates.

---

## Methodology Guides

Located in `ux-methods/`:

| # | Guide | Phase | Purpose |
|---|-------|-------|---------|
| 1 | [Problem Statement Canvas](./ux-methods/1-problem-statement-canvas.md) | Discover | Define the problem before jumping to solutions |
| 2 | [User Story Writing](./ux-methods/2-user-story-writing.md) | Discover | Capture requirements as actionable stories |
| 3 | [MVP Scoping Framework](./ux-methods/3-mvp-scoping-framework.md) | Define | Determine what to build first |
| 4 | [Role-Centered Task-Flow Mapping](./ux-methods/4-role-centered-task-flow-mapping.md) | Define | Design navigation and user journeys |
| 5 | [Schema-First Data Modeling](./ux-methods/5-schema-first-data-modeling.md) | Design | Define data structure before coding |
| 6 | [Component Inventory](./ux-methods/6-component-inventory.md) | Design | Plan reusable UI building blocks |
| 7 | [Incremental Delivery Checklist](./ux-methods/7-incremental-delivery-checklist.md) | Build | Break work into shippable chunks |
| 8 | [QA Walkthrough Template](./ux-methods/8-qa-walkthrough-template.md) | Validate | Structured testing before shipping |

---

## Project Documentation Templates

The `project/` folder contains blank templates for each deliverable:

| Document | Created By | Purpose |
|----------|------------|---------|
| `problem-statement.md` | Guide #1 | The problem we're solving |
| `user-stories.md` | Guide #2 | What users need to do |
| `mvp-scope.md` | Guide #3 | What's in version 1 |
| `user-flows.md` | Guide #4 | How users navigate the app |
| `data-model.md` | Guide #5 | What data we store |
| `components.md` | Guide #6 | UI building blocks |
| `delivery-plan.md` | Guide #7 | Build order and tasks |
| `qa-results.md` | Guide #8 | Testing results |

---

## How To Use

### For New Projects

1. Copy this folder to your project's `docs/` directory
2. Rename to `dev-assist`
3. AI agent reads `AI-GUIDE.md` for context
4. Start with Guide #1 (Problem Statement Canvas)
5. Work through each guide in order
6. Fill in the templates in `project/` as you go
7. Reference prior deliverables when making decisions

### For Existing Projects

1. Check `project/` for existing documentation
2. Determine the appropriate entry point based on the task
3. Use relevant guides to structure the work
4. Update documentation as decisions are made

---

## Key Principles

1. **Document as you go** - AI memory resets between sessions; files persist
2. **User knows the domain** - AI knows the process
3. **Start with the problem** - Not the solution
4. **Less is more** - Ship small, learn, iterate
5. **Test before shipping** - Catch issues before users do

---

## What's Included

```
dev-assist-template/
├── README.md              # This file
├── AI-GUIDE.md            # Instructions for AI agents
├── ux-methods/            # 8 methodology guides (generic, reusable)
│   ├── 1-problem-statement-canvas.md
│   ├── 2-user-story-writing.md
│   ├── 3-mvp-scoping-framework.md
│   ├── 4-role-centered-task-flow-mapping.md
│   ├── 5-schema-first-data-modeling.md
│   ├── 6-component-inventory.md
│   ├── 7-incremental-delivery-checklist.md
│   └── 8-qa-walkthrough-template.md
└── project/               # Blank templates with placeholders
    ├── problem-statement.md
    ├── user-stories.md
    ├── mvp-scope.md
    ├── user-flows.md
    ├── data-model.md
    ├── components.md
    ├── delivery-plan.md
    └── qa-results.md
```
