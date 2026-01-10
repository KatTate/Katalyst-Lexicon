# Documentation

This directory contains reusable methodology guides and project documentation for building software with AI assistance.

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

Located in `docs/ux-methods/`:

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

## Project Documentation

Store project-specific deliverables in `docs/project/`:

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

1. AI agent reads `AI-GUIDE.md` for context
2. Start with Guide #1 (Problem Statement Canvas)
3. Work through each guide in order
4. Store deliverables in `docs/project/`
5. Reference prior deliverables when making decisions

### For Existing Projects

1. Check `docs/project/` for existing documentation
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
