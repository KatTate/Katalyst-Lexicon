# Party Mode Discussion: Epic 1 Retrospective — Impact on Epics 2-4

Date: 2026-02-10
Participants: Bob (SM), John (PM), Winston (Architect), Amelia (Dev), Sally (UX), Dana (QA)
Topic: Does Epic 1 retrospective change our approach to Epics 2-4?

## Decision: No Changes to Epic 2-4 Scope or Structure

The team unanimously agreed that nothing from Epic 1 requires changes to the planned scope, story breakdown, or approach for Epics 2, 3, or 4.

## Key Discussion Outcomes

### 1. Execution Order Confirmed
Epic 2 → Epic 3 → Epic 4

Rationale:
- Epic 2 (Term Detail) is the highest-impact next step — completes the search-to-answer flow
- Story 4.3 (bidirectional links) depends on Epic 2 Story 2.1 (term detail Tier 2 shell)
- No story overlap risk identified in any of the three epics

### 2. Component Patterns to Carry Forward
- **PrincipleCard**: Build with `variant` pattern from day one (lesson from TermCard variant='inline' in Epic 1)
- **TierSection**: Build as generic reusable primitive in Epic 2 Story 2.1 (will be reused in Story 4.3)
- **StatusBadge**: Add Published and Archived variants during Epic 4

### 3. Markdown Library Decision
Choose `react-markdown` + `rehype-sanitize` during Epic 2 Story 2.2 (version snapshots). Reuse in Epic 4 Story 4.2 (principle body).

### 4. Tech Debt Timing
Both debt items from Epic 1 code review (useSearch hook extraction, `<a>` → `<Link>` fix) remain scheduled for before Epic 5. Neither affects Epics 2-4 — the search duplication doesn't impact detail/browse/principles pages, and the dead `<a>` link targets a page that doesn't exist until Epic 5.

### 5. Process Improvement
During story creation, verify that the story's ACs aren't already satisfied by a previously-completed story in the same epic. Prevents the "Story 1.4 was already done" situation from recurring.

## Story Overlap Analysis

| Epic | Stories | Overlap Risk | Assessment |
|------|---------|-------------|------------|
| Epic 2 | 2.1 (detail page shell) + 2.2 (version history data) | Low | Clean split: structural shell vs. data wiring |
| Epic 3 | 3.1 (browse page) + 3.2 (filters) | Low | Filters involve multi-select UI, URL state, API params — meaningfully different work |
| Epic 4 | 4.1 (list) + 4.2 (detail) + 4.3 (bidirectional links) | Low | Each story targets a different page/feature |

## Dependency Notes

- Story 4.3 depends on Epic 2 Story 2.1 (term detail Tier 2 "Related Principles" section shell)
- If epics run sequentially (2 → 3 → 4), no issues
- If epics run in parallel, Story 4.3 must wait for 2.1 completion
