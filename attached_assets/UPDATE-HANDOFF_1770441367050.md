# BMad Method — Update Handoff Document

**From:** v6.0.0-Beta.7 (original release)
**To:** v6.0.0-Beta.7 (patched — brownfield assessment fix + install guide)
**Date:** 2026-02-07

---

## Summary

If you already have the previous version of BMad installed in a Replit project, this document tells you exactly what changed and what files need to be updated.

---

## What Changed

### 1. Brownfield Assessment — Now Validates Assumptions with the User

**Problem:** When running "assess brownfield" on an existing app, the agent would scan the code, assume the app was done and working, and recommend jumping straight to implementation. It never asked the user whether that was actually true.

**Fix:** Three files were updated to make the assessment skeptical and add a mandatory assumption validation step.

### 2. New Installation Guide

**What:** A new `INSTALL-GUIDE.md` file was added with simple instructions for installing BMad into existing projects or starting new ones.

---

## Files to Update

### File 1: `_bmad/bmm/workflows/0-assess/assess-brownfield/steps/step-01-scan.md`

**What changed:**
- Mandatory rules updated — agent is now a "critical assessor" instead of a passive "facilitator"
- Added rule: "BE SKEPTICAL — do NOT assume that existing code is complete, correct, or what the user intended"
- Added rule: "FORBIDDEN to assume any feature is complete without evidence of it actually working end-to-end"
- **New Section 6: "Validate Assumptions"** — after scanning, the agent MUST ask the user 6 questions before proceeding:
  1. Is this project what I think it is, or something different?
  2. Are the features I found actually complete and working?
  3. Is this still the direction you want to go?
  4. Is what's missing intentional or still needed?
  5. Does the code quality match your experience?
  6. What's driving you to use BMad right now?
- The agent is blocked from continuing until the user answers these
- Previous "Section 6: Initialize Assessment Document" renumbered to Section 7
- Success metrics updated to include assumption validation
- Failure modes updated to flag rubber-stamping as a failure

**Action:** Replace this entire file with the updated version.

### File 2: `_bmad/bmm/workflows/0-assess/assess-brownfield/steps/step-02-assess.md`

**What changed:**
- Mandatory rules now say: "The user's answers from Step 1 assumption validation OVERRIDE your scan conclusions"
- Added rule: "DO NOT assume phases are done just because code exists"
- Phase mapping criteria completely rewritten with skeptical defaults:
  - Each phase now has a "SKEPTICAL DEFAULT" that says the phase is NOT done unless the user confirmed it
  - Questions changed from "Does code exist? → Phase may be done" to "Did the user confirm this works? If not → Phase is NOT done"
- Success metrics updated to require user confirmation before marking phases complete
- Failure modes updated — "Marking phases as complete just because code exists" is now listed as THE MOST COMMON FAILURE

**Action:** Replace this entire file with the updated version.

### File 3: `_bmad/bmm/workflows/0-assess/assess-brownfield/brownfield-assessment-template.md`

**What changed:**
- New section added between "Code Quality Signals" and "BMAD Phase Mapping":
  - **"Assumption Validation (User Confirmed)"** — a table that records what the agent assumed vs. what the user actually said for each of the 6 validation questions

**Action:** Replace this entire file with the updated version, OR manually add this section between "Code Quality Signals" and "BMAD Phase Mapping":

```markdown
## Assumption Validation (User Confirmed)

| Assumption | Agent's Initial Assessment | User's Response |
|---|---|---|
| What this project is | | |
| Features are complete/working | | |
| Project direction | | |
| What's missing | | |
| Code quality matches experience | | |
| Why using BMad now | | |
```

### File 4: `INSTALL-GUIDE.md` (NEW)

**What:** Brand new file with installation instructions. Not part of the `_bmad/` toolkit — lives in the project root.

**Action:** Copy this file into the project root of any Replit where you want installation instructions available. This is optional — it's documentation, not a functional part of the toolkit.

---

## How to Apply These Updates

### Option A: Full Re-install (Easiest)

1. Download the updated zip from this Replit
2. In your existing project, upload the zip via the attachment button in the chat
3. Tell the agent: "Unzip this and overwrite the existing BMad files, then run the install script"
4. Start a new chat

The install script is safe to re-run — it preserves your existing `replit.md` content and any artifacts you've already generated.

### Option B: Manual File Replacement

If you only want to apply the brownfield assessment fix:

1. Replace these 3 files with the updated versions from this Replit:
   - `_bmad/bmm/workflows/0-assess/assess-brownfield/steps/step-01-scan.md`
   - `_bmad/bmm/workflows/0-assess/assess-brownfield/steps/step-02-assess.md`
   - `_bmad/bmm/workflows/0-assess/assess-brownfield/brownfield-assessment-template.md`
2. Start a new chat

No install script needed — these are drop-in replacements.

---

## Files NOT Changed

Everything else in `_bmad/` is unchanged. Specifically:
- All agent files (analyst, PM, architect, dev, etc.)
- All other workflows (brainstorm, PRD, architecture, epics, etc.)
- Core engine (workflow executor, help system)
- Configuration files
- Step 3 of the brownfield workflow (integrate)
- The main brownfield workflow.md

Your existing `_bmad-output/` artifacts are also unaffected.

---

## Verification

After updating, you can verify by checking:

1. Open `_bmad/bmm/workflows/0-assess/assess-brownfield/steps/step-01-scan.md`
2. Search for "Validate Assumptions" — if you find a section with that heading, you're on the updated version
3. Open `step-02-assess.md` and search for "SKEPTICAL DEFAULT" — if present, you're updated
