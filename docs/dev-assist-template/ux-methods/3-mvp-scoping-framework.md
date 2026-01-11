# MVP Scoping Framework

Determine what to build first - the minimum viable product that solves the core problem.

---

## AI Facilitation Guide

### When To Use This
- After user stories are written and prioritized
- When scope is growing too large
- When user feels overwhelmed by all the possibilities
- When deciding what to cut to ship faster

### How To Facilitate

**Duration:** 15-20 minutes

**Your approach:**
1. Review the user stories together
2. Identify the "must haves" that form the core loop
3. Ruthlessly question everything else
4. Help the user accept that less is more
5. Create a clear boundary between MVP and "later"

**Opening script:**
> "We have a great list of features. Now comes the hard part: deciding what goes in version 1 and what waits. The goal is to ship something valuable as fast as possible, learn from real usage, then add more. Let's find the smallest version that still solves the core problem."

**Key questions to ask:**
1. "If we shipped only ONE feature, which one solves the problem?"
2. "What's the core loop - the main thing users do repeatedly?"
3. "For each 'must have' - what happens if we cut it? Does the app still work?"
4. "What can we fake, simplify, or do manually at first?"
5. "What are we afraid to cut, and why?"

**Scope reduction tactics:**

| Full Version | MVP Alternative |
|--------------|-----------------|
| Multiple user roles | Start with one role, add others later |
| Full search with filters | Simple text search only |
| Real-time updates | Manual refresh |
| Email notifications | In-app notifications only |
| Mobile + desktop | Desktop only (or mobile only) |
| Public + private content | Private only to start |
| Full editing capabilities | Create + view only, edit later |
| Payment integration | Free tier only, add payment later |

**Watch for:**
- "We need everything" - gently challenge each item
- Fear of launching "incomplete" - remind them feedback from real users is invaluable
- Perfectionism - done is better than perfect
- Feature creep - capture ideas for "later" without committing

**Closing script:**
> "Here's our MVP scope: [list features]. Everything else goes on the 'next version' list. This is a complete, usable product that solves the core problem. We can always add more after we see how people actually use it. Does this feel right?"

---

## The MVP Test

For each feature, ask these questions:

### 1. The Core Loop Test
> "Is this part of the main thing users do every time they use the app?"

If no → probably not MVP

### 2. The Dealbreaker Test
> "If we don't have this, will users say 'this is useless' and leave?"

If no → probably not MVP

### 3. The Workaround Test
> "Can users accomplish this some other way for now (manually, via another tool, etc.)?"

If yes → probably not MVP

### 4. The Simplification Test
> "Is there a simpler version of this feature that would work for now?"

If yes → use the simpler version for MVP

---

## Scope Categories

### In MVP
Features that absolutely must be in the first version.

**Criteria:**
- Essential to the core user journey
- No reasonable workaround exists
- App doesn't make sense without it

### In Version 2
Features to add right after MVP based on user feedback.

**Criteria:**
- Important but not blocking
- Can learn from MVP usage first
- Moderate effort to add

### Future / Someday
Ideas worth capturing but not committing to.

**Criteria:**
- Nice to have
- Significant effort
- May not be needed at all

### Out of Scope
Explicitly not doing, at least for now.

**Criteria:**
- Distractions from the core problem
- Features for a different audience
- Over-engineering

---

## MVP Scope Document Template

```markdown
# MVP Scope

## Core Problem We're Solving
[One sentence from the problem statement]

## Target User
[Primary user from problem statement]

## The Core Loop
[The main sequence of actions users will do repeatedly]

Example: Browse items → Select item → View details → Take action

---

## MVP Features (Version 1)

### Feature 1: [Name]
**User Story:** [Reference the story]
**Simplifications:** [Any scope reduction from the full vision]
**Must include:**
- [Specific capability]
- [Specific capability]

**Explicitly NOT including:**
- [Thing we're cutting]

---

### Feature 2: [Name]
**User Story:** [Reference the story]
**Simplifications:** [Any scope reduction]
**Must include:**
- [Specific capability]

---

## Not In MVP

### Version 2 (After Launch)
| Feature | Why It's Waiting |
|---------|------------------|
| [Feature] | [Reason - e.g., "Need user feedback first"] |
| [Feature] | [Reason] |

### Future / Someday
- [Idea we captured but aren't committing to]
- [Another idea]

### Out of Scope
- [Thing we explicitly decided not to do]
- [Another thing]

---

## MVP Success Criteria
How we'll know if MVP is working:
- [ ] [Measurable outcome]
- [ ] [Measurable outcome]
- [ ] [User feedback indicator]

---

*Created: [Date]*
*Last Updated: [Date]*
```

---

## Common MVP Patterns

### Content/Data Apps
**MVP:** View + Search
**V2:** Create + Edit
**Future:** Collaborate + Share

### Productivity Tools
**MVP:** Core workflow for one user
**V2:** Collaboration features
**Future:** Integrations, automation

### Marketplaces
**MVP:** Browse + Contact (no transactions)
**V2:** Built-in transactions
**Future:** Reviews, recommendations

### Internal Tools
**MVP:** Solve one team's problem
**V2:** Expand to other teams
**Future:** Reporting, automation

---

## Transition To Next Step

Once MVP scope is defined:

> "Now we know what we're building. Let's map out how users will actually move through the app - the screens they'll see and the paths they'll take. This helps us design the navigation and make sure the experience makes sense. Ready?"

→ Proceed to **Role-Centered Task-Flow Mapping**
