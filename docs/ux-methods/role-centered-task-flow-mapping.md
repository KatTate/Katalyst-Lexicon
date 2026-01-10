# Role-Centered Task-Flow Mapping

A practical guide for designing navigation, information architecture, and user experience flows in any application.

---

## What Is This?

Role-Centered Task-Flow Mapping is a UX methodology that starts with **who your users are** and **what they need to accomplish**, then works backward to design navigation and interface structure that supports those goals.

Unlike starting with a sitemap or wireframes, this approach ensures every navigation element exists for a reason tied to real user needs.

---

## When To Use This

Use this methodology when:

- Designing navigation for a new application
- Redesigning or fixing broken navigation in an existing app
- Adding new user roles or permission levels
- Users are getting lost or confused in your app
- You have multiple user types with different needs

---

## The Process

### Phase 1: Define Your Roles

List every distinct user role in your application. For each role, document:

| Field | Description |
|-------|-------------|
| **Role Name** | The label for this user type |
| **Primary Goal** | What does this person ultimately want to accomplish? |
| **Permission Level** | What can they see and do? |
| **Frequency** | How often do they use the app? (Daily, weekly, occasionally) |
| **Context** | Where/when do they typically use it? (Desktop at work, mobile on-the-go) |

**Template:**

```markdown
### Role: [Name]

**Primary Goal:** [One sentence describing their ultimate objective]

**Permission Level:** [What they can access and modify]

**Frequency:** [Daily / Weekly / Occasionally]

**Context:** [Where and how they typically use the app]
```

---

### Phase 2: Identify Key Verbs

For each role, list the **action verbs** that describe what they do in the app. These become the foundation of your navigation.

**Common verb categories:**

| Category | Example Verbs |
|----------|---------------|
| Discovery | Browse, Search, Filter, Explore |
| Creation | Create, Add, Propose, Submit, Upload |
| Review | Review, Approve, Reject, Comment, Assign |
| Management | Edit, Delete, Configure, Organize, Archive |
| Monitoring | Track, View, Monitor, Audit, Export |

**Template:**

```markdown
### [Role Name] - Key Actions

1. [Verb] + [Object] - [Frequency: High/Medium/Low]
2. [Verb] + [Object] - [Frequency: High/Medium/Low]
3. ...
```

**Example:**

```markdown
### Content Editor - Key Actions

1. Browse articles - High
2. Edit article content - High
3. Submit for review - Medium
4. Track revision history - Low
```

---

### Phase 3: Write Flow Narratives

For each role's key actions, write a narrative that describes the complete journey from trigger to success. This exposes every touchpoint where navigation matters.

**Narrative Template:**

```markdown
## Flow: [Action Name]

**Role:** [Who is doing this]

**Trigger:** [What causes them to start this flow]
- Example: "User receives email notification about pending review"
- Example: "User opens app to check status of their submission"

**Starting Point:** [Where in the app do they begin]
- Example: "Dashboard"
- Example: "Email link to specific item"
- Example: "Bookmark to frequently-used page"

**Steps:**
1. [Action they take] → [What they see/where they go]
2. [Action they take] → [What they see/where they go]
3. ...

**Success State:** [How do they know they accomplished their goal]
- Example: "Confirmation message appears"
- Example: "Item status changes to 'Published'"

**Failure States:** [What could go wrong]
- Example: "Can't find the item they're looking for"
- Example: "Don't have permission to complete action"

**Navigation Touchpoints:** [Every place where navigation is needed]
- [List each navigation element touched in this flow]
```

---

### Phase 4: Map Navigation Touchpoints

After writing all flow narratives, compile a master list of navigation touchpoints. Group them by type:

**Touchpoint Types:**

| Type | Description | Examples |
|------|-------------|----------|
| **Primary Nav** | Always visible, main destinations | Home, Browse, Create, Settings |
| **Secondary Nav** | Contextual or role-specific | Admin Panel, Review Queue |
| **Sidebar/Filters** | Within-page navigation | Category filters, Status filters |
| **Breadcrumbs** | Location awareness | Home > Category > Item |
| **Contextual Actions** | Inline navigation tied to content | "Edit this item", "View related" |
| **Quick Actions** | Shortcuts for frequent tasks | "New Item" button, keyboard shortcuts |

**Template:**

```markdown
## Navigation Inventory

### Primary Navigation
| Destination | Roles Who Need It | Frequency |
|-------------|-------------------|-----------|
| [Page Name] | [Role1, Role2] | [High/Med/Low] |

### Secondary Navigation
| Destination | Roles Who Need It | Frequency |
|-------------|-------------------|-----------|
| [Page Name] | [Role1] | [High/Med/Low] |

### Contextual Actions
| Action | Appears On | Roles Who Need It |
|--------|------------|-------------------|
| [Action] | [Page/Component] | [Role1, Role2] |
```

---

### Phase 5: Design the Information Architecture

Using your navigation inventory, create a hierarchical site map that:

1. **Groups related destinations** logically
2. **Prioritizes by frequency** (most-used items most accessible)
3. **Respects permissions** (role-appropriate visibility)
4. **Uses clear labels** (matches user mental models)

**Site Map Template:**

```
[App Name]
├── [Primary Nav Item 1]
│   ├── [Sub-item A]
│   └── [Sub-item B]
├── [Primary Nav Item 2]
├── [Primary Nav Item 3] (Role-restricted: Admin only)
└── [Primary Nav Item 4]
    ├── [Sub-item A]
    ├── [Sub-item B] (Role-restricted: Approver+)
    └── [Sub-item C]
```

---

### Phase 6: Validate With Walkthroughs

Before implementing, validate your navigation design:

1. **Role Walkthroughs**: For each role, walk through their top 3 flows using the proposed navigation. Can they complete each task efficiently?

2. **Edge Case Check**: What happens when:
   - User has multiple roles?
   - User doesn't have permission for a destination?
   - User arrives via deep link or bookmark?
   - User is on mobile vs desktop?

3. **Label Testing**: Do the navigation labels make sense to users? Are there industry-specific terms that need clarification?

---

## Deliverables Checklist

At the end of this process, you should have:

- [ ] Role definitions with goals and permissions
- [ ] Key verbs list for each role
- [ ] Flow narratives for all critical user journeys
- [ ] Navigation inventory grouped by type
- [ ] Site map / Information Architecture diagram
- [ ] Validation notes from walkthroughs

---

## Quick Reference: Questions To Ask

**For each role:**
- What's the first thing they need to do when they open the app?
- What do they do most frequently?
- What's the most critical action they must not fail at?
- What would frustrate them about navigation?

**For each page/destination:**
- Who needs to access this?
- How do they get here?
- What do they do next?
- How do they get back?

**For the overall structure:**
- Can a new user figure out where things are?
- Are similar things grouped together?
- Is the most important stuff easiest to reach?
- Does the navigation adapt appropriately to different roles?

---

## Example Application

See the companion document `[app-name]-user-flows.md` in this directory for a worked example applying this methodology to a specific project.

---

## References

This methodology synthesizes best practices from:
- Task Analysis (usability.gov)
- Jobs To Be Done framework
- User Story Mapping (Jeff Patton)
- Information Architecture principles (Rosenfeld & Morville)
