# Problem Statement Canvas

A structured approach to defining the problem you're solving before jumping to solutions.

---

## AI Facilitation Guide

### When To Use This
- Starting a brand new project
- User has a vague idea they want to explore
- Existing project lacks clear purpose documentation

### How To Facilitate

**Duration:** 10-20 minutes of conversation

**Your approach:**
1. Start with open-ended questions to let the user talk
2. Listen for pain points, frustrations, and desires
3. Gently probe for specifics when answers are vague
4. Summarize back to confirm understanding
5. Fill in the canvas template together

**Opening script:**
> "Before we build anything, let's make sure we understand the problem clearly. Tell me: what's the situation that made you want to create this? What's frustrating or missing right now?"

**Key questions to ask:**
1. "Who is experiencing this problem?"
2. "What are they trying to accomplish?"
3. "What gets in their way today?"
4. "What would success look like for them?"
5. "Why does solving this matter to you?"

**Watch for:**
- Solutions disguised as problems ("I need a login system" vs "Users need secure access")
- Too broad ("Make business better") - help narrow down
- Too specific ("Add a blue button") - help zoom out to the real need

**Closing script:**
> "Great, let me summarize what I heard: [read back the canvas]. Does this capture it? Anything missing or not quite right?"

---

## The Canvas

### 1. Who Has This Problem?

Describe the person or people experiencing this problem. Be specific.

```markdown
**Primary User:**
[Role/title/description]

**Context:**
[When/where do they encounter this problem?]

**Characteristics:**
[Relevant traits - technical skill, frequency of need, etc.]
```

### 2. What Are They Trying To Do?

The goal or job they're trying to accomplish (not the solution they want).

```markdown
**Goal:**
[What outcome are they seeking?]

**Current Approach:**
[How do they handle this today?]
```

### 3. What's The Problem?

The obstacle, pain point, or gap that prevents success.

```markdown
**Problem Statement:**
[One clear sentence describing the core problem]

**Symptoms:**
- [Observable sign of the problem]
- [Another symptom]
- [Another symptom]

**Impact:**
[What happens because of this problem? Time lost? Money lost? Frustration?]
```

### 4. What Does Success Look Like?

How will we know when the problem is solved?

```markdown
**Success Criteria:**
- [Measurable outcome 1]
- [Measurable outcome 2]
- [Measurable outcome 3]

**User's Words:**
[How would the user describe success in their own words?]
```

### 5. Why Does This Matter?

The deeper motivation behind solving this problem.

```markdown
**Business Value:**
[Why is this worth building?]

**User Value:**
[Why will users care?]

**Personal Motivation:**
[Why does the creator care about this?]
```

---

## Example: Completed Canvas

### 1. Who Has This Problem?

**Primary User:** Marketing team members at a mid-size company

**Context:** When creating content, they need to use consistent terminology but can't remember all the approved terms

**Characteristics:** Non-technical, create content daily, work across multiple tools

### 2. What Are They Trying To Do?

**Goal:** Use the correct, approved language in all customer-facing content

**Current Approach:** Ask colleagues, search old documents, or guess

### 3. What's The Problem?

**Problem Statement:** There's no single source of truth for company terminology, leading to inconsistent language across content.

**Symptoms:**
- Different terms used for the same concept
- New employees don't know the "right" words
- Time wasted asking "what do we call this?"

**Impact:** Brand inconsistency, customer confusion, wasted time

### 4. What Does Success Look Like?

**Success Criteria:**
- Anyone can find the approved term in under 30 seconds
- New terms go through an approval process
- Old/deprecated terms are clearly marked

**User's Words:** "I just want one place to look up what we call things."

### 5. Why Does This Matter?

**Business Value:** Consistent brand voice, faster content creation

**User Value:** Less guessing, more confidence

**Personal Motivation:** Frustrated by wasted time in meetings debating terminology

---

## Template For `docs/project/problem-statement.md`

```markdown
# Problem Statement

## Who Has This Problem?

**Primary User:** [Describe them]

**Context:** [When/where they encounter this]

**Characteristics:** [Relevant traits]

## What Are They Trying To Do?

**Goal:** [Desired outcome]

**Current Approach:** [How they handle it today]

## The Problem

**Problem Statement:** [One clear sentence]

**Symptoms:**
- [Symptom 1]
- [Symptom 2]
- [Symptom 3]

**Impact:** [Consequences of the problem]

## Success Criteria

- [Measurable outcome 1]
- [Measurable outcome 2]
- [Measurable outcome 3]

## Why This Matters

**Business Value:** [Why worth building]

**User Value:** [Why users will care]

---

*Created: [Date]*
*Last Updated: [Date]*
```

---

## Transition To Next Step

Once the problem statement is complete:

> "Now that we're clear on the problem, let's capture specific things users need to do. We'll write these as user stories - short statements that describe who needs what and why. Ready?"

→ Proceed to **User Story Writing**
