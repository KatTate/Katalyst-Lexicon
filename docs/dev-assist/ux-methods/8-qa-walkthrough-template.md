# QA Walkthrough Template

A structured checklist for testing your app before shipping. Catch issues before users do.

---

## AI Facilitation Guide

### When To Use This
- After implementation is complete
- Before showing to stakeholders or users
- When something feels "off" but you're not sure what
- After major changes or refactoring
- Periodically during development for sanity checks

### How To Facilitate

**Duration:** 20-40 minutes depending on app complexity

**Your approach:**
1. Systematically walk through each user flow
2. Test happy paths first, then edge cases
3. Check on multiple screen sizes if relevant
4. Look at console for errors even when things seem to work
5. Document issues found, don't just fix them immediately

**Opening script:**
> "Let's do a thorough check of the app before we ship. I'll walk through each user flow and test different scenarios. I'll note any issues I find. This usually catches things we missed."

**What to test:**
1. Every navigation path - can users get where they need to go?
2. Every form - do validations work? Do submissions succeed?
3. Every action - do buttons do what they say?
4. Empty states - what happens with no data?
5. Error states - what happens when things go wrong?
6. Loading states - does the user know something is happening?
7. Edge cases - unusual inputs, rapid clicking, browser refresh

**How to report issues:**
- Severity: Critical (blocks usage), Major (significant problem), Minor (cosmetic/annoying)
- Steps to reproduce
- Expected vs actual behavior
- Screenshot or console error if relevant

**Closing script:**
> "Here's what I found: [summary of issues by severity]. I'd recommend fixing the critical issues before shipping. The minor ones can wait. Want to prioritize these fixes?"

---

## QA Checklist

### 1. First Impressions

- [ ] App loads without errors
- [ ] Initial page displays correctly
- [ ] No console errors on load
- [ ] Loading time is acceptable (< 3 seconds)
- [ ] Correct page title and meta info

### 2. Navigation

For each navigation element:

- [ ] Link/button is visible and clickable
- [ ] Navigates to correct destination
- [ ] Active state shows current location
- [ ] Back button works as expected
- [ ] Deep links work (direct URL access)
- [ ] 404 page exists for invalid URLs

### 3. Data Display

For each list/display:

- [ ] Data loads correctly
- [ ] Loading state appears while fetching
- [ ] Empty state appears when no data
- [ ] Error state appears on API failure
- [ ] Pagination/infinite scroll works (if applicable)
- [ ] Sorting works (if applicable)
- [ ] Filtering works (if applicable)
- [ ] Search works (if applicable)

### 4. Forms and Input

For each form:

- [ ] All fields are accessible
- [ ] Required fields are marked
- [ ] Validation shows helpful error messages
- [ ] Form submits successfully with valid data
- [ ] Success feedback appears after submit
- [ ] Form prevents double submission
- [ ] Cancel/reset works correctly
- [ ] Keyboard navigation works (Tab, Enter)

### 5. Actions and Mutations

For each action (create, edit, delete):

- [ ] Action completes successfully
- [ ] Feedback appears (toast, message)
- [ ] UI updates to reflect change
- [ ] Data persists after refresh
- [ ] Confirmation appears for destructive actions
- [ ] Can undo or recover from mistakes (if applicable)

### 6. User Flows

For each critical flow (from user stories):

- [ ] Flow can be completed start to finish
- [ ] Each step is clear
- [ ] No dead ends
- [ ] User knows what to do next
- [ ] Success is clearly communicated

### 7. Edge Cases

- [ ] Empty string inputs handled
- [ ] Very long text handled (truncation, wrapping)
- [ ] Special characters handled (quotes, brackets, emoji)
- [ ] Rapid repeated actions don't break anything
- [ ] Browser refresh mid-action doesn't corrupt data
- [ ] Multiple tabs don't cause conflicts

### 8. Error Handling

- [ ] API failures show user-friendly messages
- [ ] Network offline is handled gracefully
- [ ] Invalid data is rejected with clear feedback
- [ ] App doesn't crash on unexpected errors
- [ ] No sensitive info in error messages

### 9. Responsive Design (if applicable)

- [ ] Works on desktop (1200px+)
- [ ] Works on tablet (768px-1199px)
- [ ] Works on mobile (< 768px)
- [ ] Touch targets are large enough (44px+)
- [ ] No horizontal scroll on mobile
- [ ] Text is readable without zooming

### 10. Accessibility Basics

- [ ] Images have alt text
- [ ] Form fields have labels
- [ ] Color isn't the only indicator (use icons/text too)
- [ ] Focus states are visible
- [ ] Page has logical heading structure

### 11. Console and Errors

- [ ] No JavaScript errors in console
- [ ] No warnings that indicate problems
- [ ] No failed network requests (except expected ones)
- [ ] No performance warnings

### 12. Final Checks

- [ ] Test/placeholder data removed
- [ ] Debug logging removed
- [ ] Appropriate loading for production (no massive bundles)
- [ ] Environment configuration is correct

---

## Issue Tracking Template

```markdown
## Issue: [Brief Description]

**Severity:** Critical / Major / Minor

**Location:** [Page or component where it occurs]

**Steps to reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Console errors (if any):**
```
[Paste error]
```

**Screenshot:**
[Description or link]

**Notes:**
[Any additional context]
```

---

## Template For `docs/project/qa-results.md`

```markdown
# QA Walkthrough Results

**Date:** [Date]
**Tester:** [AI Agent / User name]
**Version/Commit:** [Reference]

## Summary

| Severity | Count |
|----------|-------|
| Critical | [#] |
| Major | [#] |
| Minor | [#] |

**Overall Status:** Ready to Ship / Needs Work / Critical Issues

---

## Critical Issues

### [Issue Title]
**Severity:** Critical
**Location:** [Where]
**Steps:** [How to reproduce]
**Expected:** [What should happen]
**Actual:** [What happens]
**Status:** [ ] Open / [ ] Fixed

---

## Major Issues

### [Issue Title]
**Severity:** Major
[Same format]

---

## Minor Issues

### [Issue Title]
**Severity:** Minor
[Same format]

---

## Checklist Results

### Navigation
- [x] All links work
- [ ] Deep links work *(Issue: 404 on direct category URLs)*

### Forms
- [x] Validation works
- [x] Submission works

[Continue with relevant sections]

---

## Next Steps

1. [ ] Fix critical issues
2. [ ] Fix major issues
3. [ ] Ship (minor issues can wait)
4. [ ] Schedule follow-up fixes

---

*Completed: [Date]*
```

---

## Severity Guidelines

### Critical
App is unusable or data is at risk.
- App crashes or won't load
- Users can't complete core task
- Data loss or corruption
- Security vulnerability

**Action:** Must fix before shipping

### Major  
Significant problem affecting user experience.
- Feature doesn't work correctly
- Confusing or misleading behavior
- Performance issues
- Accessibility barriers

**Action:** Should fix before shipping

### Minor
Cosmetic or minor inconvenience.
- Styling inconsistencies
- Missing polish
- Rare edge cases
- Enhancement opportunities

**Action:** Can ship, fix in next iteration

---

## Post-QA: Ready to Ship Checklist

- [ ] All critical issues fixed
- [ ] All major issues fixed (or documented as known issues)
- [ ] Re-tested fixes
- [ ] No new issues introduced
- [ ] User has reviewed and approved
- [ ] Ready for deployment
