# User Story Writing

Capture requirements as actionable stories that describe who needs what and why.

---

## AI Facilitation Guide

### When To Use This
- After completing the Problem Statement Canvas
- When adding new features to an existing project
- When user describes features they want

### How To Facilitate

**Duration:** 15-30 minutes depending on scope

**Your approach:**
1. Reference the problem statement to anchor the conversation
2. Ask about specific tasks users need to accomplish
3. Convert vague feature requests into structured stories
4. Probe for the "why" behind each request
5. Prioritize stories together (must-have vs nice-to-have)

**Opening script:**
> "Now let's turn that problem into specific things users need to do. For each one, we'll capture: who's doing it, what they need to do, and why it matters. Let's start with the most essential task - what's the first thing a user absolutely must be able to do?"

**Key questions to ask:**
1. "What's the very first thing someone would do when they open this app?"
2. "What would make them come back a second time?"
3. "What would frustrate them if it was missing?"
4. "Are there different types of users who need different things?"
5. "What's something that would be nice but isn't essential?"

**Converting vague requests to stories:**

| User Says | You Probe | Resulting Story |
|-----------|-----------|-----------------|
| "I need a dashboard" | "What information do you need to see at a glance?" | "As a manager, I want to see today's key metrics so I can spot issues quickly" |
| "Add search" | "What are they searching for? What do they do with results?" | "As a user, I want to search products by name so I can find what I'm looking for without browsing" |
| "Make it mobile-friendly" | "What tasks do they do on mobile specifically?" | "As a field worker, I want to submit reports from my phone so I don't have to wait until I'm at my desk" |

**Watch for:**
- Implementation details ("use React") - refocus on user needs
- Compound stories - break into smaller pieces
- Missing "why" - the benefit is crucial for prioritization

**Closing script:**
> "Here's what we captured: [read stories by priority]. That's [X] must-haves and [Y] nice-to-haves. Does this feel complete for an initial version, or are we missing something critical?"

---

## The User Story Format

### Standard Template

```
As a [role],
I want to [action/capability],
so that [benefit/reason].
```

### Components Explained

| Part | Purpose | Examples |
|------|---------|----------|
| **Role** | Who has this need | User, Admin, Guest, Manager, New User |
| **Action** | What they want to do | Search, Create, View, Edit, Delete, Export |
| **Benefit** | Why it matters | Save time, Reduce errors, Stay informed |

### Good vs Bad Stories

**Too vague:**
> As a user, I want a good experience, so that I'm happy.

**Better:**
> As a user, I want to complete checkout in under 3 clicks, so that I don't abandon my cart.

**Too technical:**
> As a developer, I want a REST API with JWT auth, so that the frontend works.

**Better:**
> As a user, I want my login to stay active for 30 days, so that I don't have to sign in every time.

**Too large:**
> As an admin, I want to manage all content, so that the site stays updated.

**Better (broken down):**
> As an admin, I want to create new articles, so that I can publish fresh content.
> As an admin, I want to edit existing articles, so that I can fix mistakes.
> As an admin, I want to delete outdated articles, so that users don't see stale content.

---

## Story Prioritization

### Priority Levels

| Priority | Label | Meaning |
|----------|-------|---------|
| 1 | **Must Have** | App is useless without this |
| 2 | **Should Have** | Important but can launch without |
| 3 | **Nice to Have** | Enhances experience but not essential |
| 4 | **Future** | Good idea, but not for initial version |

### Prioritization Questions

- "If we could only ship one feature, which would it be?"
- "What would users complain about if it was missing?"
- "What can users work around temporarily?"
- "What's impressive but not essential?"

---

## Acceptance Criteria

For complex stories, add acceptance criteria - specific conditions that must be true when the story is complete.

```markdown
**Story:** As a user, I want to reset my password, so that I can regain access to my account.

**Acceptance Criteria:**
- [ ] User can request reset via email
- [ ] Reset link expires after 24 hours
- [ ] User must create a password with at least 8 characters
- [ ] User is logged in automatically after reset
- [ ] Old password no longer works
```

---

## Template For `docs/project/user-stories.md`

```markdown
# User Stories

## Must Have (Priority 1)

### [Story ID]: [Short Title]
**As a** [role],
**I want to** [action],
**so that** [benefit].

**Acceptance Criteria:**
- [ ] [Criterion 1]
- [ ] [Criterion 2]

---

### [Story ID]: [Short Title]
**As a** [role],
**I want to** [action],
**so that** [benefit].

---

## Should Have (Priority 2)

### [Story ID]: [Short Title]
**As a** [role],
**I want to** [action],
**so that** [benefit].

---

## Nice to Have (Priority 3)

### [Story ID]: [Short Title]
**As a** [role],
**I want to** [action],
**so that** [benefit].

---

## Future Considerations (Priority 4)

- [Brief description of future idea]
- [Another future idea]

---

*Created: [Date]*
*Last Updated: [Date]*
```

---

## Transition To Next Step

Once user stories are captured and prioritized:

> "Great, we have a solid list of what users need. Now let's decide what goes into the first version versus what comes later. We'll define the MVP - the minimum viable product that solves the core problem. Ready?"

→ Proceed to **MVP Scoping Framework**
