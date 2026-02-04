---
name: e2e-ui-fix
description: Fix bugs from e2e-ui-execute bug reports with Playwright MCP verification. Use after discovering bugs during E2E test execution.
context: fork
agent: general-purpose
---

# UI E2E Bug Fix Command

## User Input

```text
$ARGUMENTS
```

Extract test number (required) from arguments. Example: `/e2e-ui-fix 3` to fix bug from Test 3.

---

## Overview

This command implements a systematic bug fix workflow for bugs discovered during E2E testing:

1. **Load Bug Report**: Read bug report from docs/e2e-ui/bug-report-test-N.md (English version, for AI)
2. **Reproduce Bug**: Verify bug exists using Playwright MCP
3. **Analyze Root Cause**: Use Grep, Read, Playwright MCP for analysis
4. **Implement Fix**: Fix the underlying issue following coding principles
5. **Verify Fix**: Confirm bug resolved with Playwright MCP
6. **Write Test**: Create Playwright test to prevent regression
7. **Document**: Generate bilingual fix summary

---

## Prerequisites

- ✅ Bug report exists: `docs/e2e-ui/bug-report-test-N.md` (English version required)
- ✅ Playwright MCP server must be running
- ✅ Frontend server must be running

---

## Execution Workflow

### Step 1: Preparation

**Load Bug Report** (English version only, for AI):

- Read `docs/e2e-ui/bug-report-test-N.md` (English, for AI - NOT ko.md)
- Extract reproduction steps, expected vs actual behavior, evidence

**Read Project Configuration**:

- Read `playwright.config.ts`: Extract base URL and test directory
- Read `package.json`: Detect framework

### Step 2: Bug Reproduction

**Use Playwright MCP to reproduce bug**:

- Follow exact steps from bug report
- Compare actual behavior with expected behavior
- Take screenshots for before-fix evidence
- Document current state

**If bug cannot be reproduced**:

- Note in summary that bug may be already fixed
- Ask user if they want to continue or skip

### Step 3: Root Cause Analysis

**Analysis Steps**:

1. **Extract Error Details from Reproduction**
2. **Identify Related Components** (use Grep)
3. **Read Source Files** (targeted reading)
4. **Find Root Cause**:
   - JavaScript errors → code bugs
   - Missing elements → component rendering issues
   - Wrong behavior → logic errors
   - Network failures → API integration issues

**Document Findings**:

- Record root cause
- Note affected files with line numbers
- Identify fix approach

### Step 4: Fix Implementation

**Implement Fix**:

- Make minimal, focused changes
- **Strictly follow** coding principles
- Follow project coding standards
- Consider edge cases

**Fix Types**:

1. **UI Component Bugs**: Fix rendering logic, conditional rendering, CSS
2. **Logic Errors**: Fix calculations, validation, state management
3. **Integration Issues**: Fix API calls, data transformations, error handling

### Step 5: Fix Verification

**Use Playwright MCP to verify fix**:

- Repeat reproduction steps
- Confirm expected behavior now works
- Check no console errors
- Take screenshots for after-fix evidence
- Test edge cases

**If fix verification fails**:

- Return to Step 3 (Analysis)
- Document what didn't work

### Step 6: Write Regression Test

**Create Playwright Test** (only after fix verified):

**File Location**: Use directory from `playwright.config.ts`

**File Naming**: Follow project pattern from testMatch

```typescript
import { test, expect } from "@playwright/test";

test.describe("Test N: {scenario name}", () => {
  test("should {expected behavior}", async ({ page }) => {
    // Navigate, interact, assert
  });

  // Edge case tests if needed
});
```

### Step 7: Generate Documentation

**Create Bilingual Fix Summary**:

- `docs/e2e-ui/fix-summary-test-N.ko.md` (Korean)
- `docs/e2e-ui/fix-summary-test-N.md` (English)

**Update Bug Report Status**:

- Add "Fixed" status to bug report
- Link to fix summary

---

## Key Rules

### ✅ MUST DO

- **Read `playwright.config.ts` and `package.json` first**
- Read **English bug report only** (.md, NOT ko.md) - saves tokens
- **Reproduce bug first** before attempting fix
- **Strictly follow** coding principles
- **Verify fix works** before writing test
- Write regression test in directory from playwright.config.ts
- Create bilingual fix summary (ko.md + md)
- Take screenshots for evidence

### ❌ NEVER DO

- **Skip reading `playwright.config.ts`**
- Read Korean bug report (ko.md) for AI analysis
- Skip bug reproduction step
- Make fixes without understanding root cause
- Write test code before verifying fix works
- Make broad, sweeping changes

### 🎯 Fix Quality Standards

**Good Fix**:

- Addresses root cause, not symptoms
- Minimal code changes
- Maintains code quality
- Doesn't break existing features

**Good Test**:

- Reproduces original bug scenario
- Would fail before fix, pass after fix
- Tests edge cases
- Clear assertions

---

## Completion Report Format

```markdown
## Bug Fix Complete: Test N

### 🐛 Original Bug

- **Priority**: {priority}
- **Issue**: {one line description}

### ✅ Fix Summary

- **Root Cause**: {root cause}
- **Fix Approach**: {approach}
- **Files Changed**: {count} files

### 🧪 Verification

- **Reproduction**: ✅ Bug reproduced successfully
- **Fix Verified**: ✅ Expected behavior now works
- **Test Written**: ✅ Regression test created

### 📝 Generated Files

- **Fix Summary**: `docs/e2e-ui/fix-summary-test-N.ko.md` and `.md`
- **Test File**: `{path/to/test.spec.ts}`

### 🔄 Next Steps

1. Review fix implementation
2. Run full test suite
3. Continue with next bug or test: `/e2e-ui-execute {N+1}`
```

---

## Execute

Start working according to the guidelines above.
