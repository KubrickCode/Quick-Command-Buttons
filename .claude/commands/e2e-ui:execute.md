---
description: Implement UI E2E tests sequentially using Playwright MCP, stop on bug discovery
---

# UI E2E Test Implementation Command

## User Input

```text
$ARGUMENTS
```

Extract test number and consider any additional context (if not empty).

---

## Overview

1. **Check Prerequisites**:
   - Verify `docs/e2e-ui/test-targets.md` exists (English version, for AI)
   - If not exists ERROR: "Please run /e2e-ui:research first"

2. **Detect Project Type and Load Skills**:
   - Detect framework via package.json analysis (React/Next.js/etc)
   - Load skills matching detected framework
   - Always load `.claude/skills/typescript` and `.claude/skills/typescript-test` (if exists)

3. **Load Test Targets**:
   - Read test scenarios from document
   - Extract test number from $ARGUMENTS (if provided)
   - Identify execution order

4. **Execute Tests Sequentially**:
   - For each test scenario (in order):
     a. **Manual Testing Phase**: Verify behavior with Playwright MCP
     b. **Bug Detection**: Check for issues
     c. **Stop on Bug**: Immediately report and stop if bug found
     d. **Code Writing Phase**: Write Playwright test code if passed
     e. **Progress Reporting**: Update summary document

5. **Generate Summary**:
   - Create `docs/e2e-ui/summary-test-N.md` for each completed test
   - Track overall progress

6. **Report Results**:
   - List of completed tests
   - Report bugs if found (with details)
   - Guide next steps

---

## Key Rules

### 🚨 Bug Detection (Important)

**Immediately stop and report when these situations occur**:

1. **Page Load Failure**:
   - Navigation timeout
   - 404/500 errors
   - Blank page

2. **Element Not Found**:
   - Expected button/input missing
   - Wrong element attributes
   - Wrong page structure

3. **Interaction Failure**:
   - Click not working
   - Input text not entering
   - Form submission failure

4. **Console Errors**:
   - JavaScript errors
   - Network failures (except expected ones)
   - React errors/warnings

5. **Unexpected Behavior**:
   - Wrong navigation
   - Wrong data display
   - Missing UI elements
   - Broken functionality

**Bug Report Format**:

```markdown
## 🐛 Bug Found

**Test**: [Test N: name]
**Priority**: [Critical/High/Medium]

**What Was Being Tested**:
[description]

**Reproduction Steps**:

1. [step 1]
2. [step 2]
3. [bug occurs here]

**Expected Behavior**:
[what should happen]

**Actual Behavior**:
[what actually happened]

**Evidence**:

- Screenshot: [path]
- Console Errors: [if any]
- Page State: [snapshot info]

**Impact**:
[impact on users]

**Tests Completed Before Bug**:

- [list of completed tests]
```

### ✅ MUST DO

- Run tests **one at a time** (sequentially)
- Use Playwright MCP for **actual testing** before code writing
- **Stop immediately** when bug found
- Write clean and maintainable test code
- Follow TypeScript and testing coding standards
- Generate summary for each test
- Take screenshots for evidence

### ❌ NEVER DO

- Run multiple tests in parallel
- Skip manual verification phase
- Continue testing after finding bug
- Write test code without verifying behavior
- Ignore console errors or warnings
- Skip edge cases

### 🎯 Test Implementation Process

For each test:

1. **Manual Verification** (using Playwright MCP):

   ```
   - Navigate to page
   - Interact with UI elements
   - Take snapshots
   - Verify expected behavior
   - Check console messages
   ```

2. **Bug Check**:
   - Did everything work as expected?
   - Any errors or warnings?
   - Is behavior correct?

3. **Decision Point**:
   - ✅ **If Pass**: Proceed to write test code
   - 🐛 **If Bug Found**: Stop, report, exit

4. **Write Test Code** (only if passed):

   ```typescript
   // Create test file in appropriate location
   // Follow project test patterns
   // Include assertions and error handling
   ```

5. **Documentation**:
   - Generate summary document
   - Record what was tested
   - Note observations

---

## Document Template

File to create: `docs/e2e-ui/summary-test-N.md`

````markdown
# Test N: [scenario name]

> **Created**: [YYYY-MM-DD HH:mm]
> **Related Plan**: `test-targets.md` > Test N
> **Status**: ✅ Pass / 🐛 Bug Found

---

## 🎯 Test Objective

[what this test verifies]

---

## 🧪 Manual Verification Results

**Test Steps Performed**:

1. [step 1] - ✅ Success
2. [step 2] - ✅ Success
3. [step 3] - ✅ Success

**Screenshots**:

- [screenshot 1]: `path/to/screenshot1.png`
- [screenshot 2]: `path/to/screenshot2.png`

**Console Output**:

- [relevant console messages]

**Observations**:

- [interesting findings]

---

## 📝 Generated Test Code

**File**: `[path/to/test/file.spec.ts]`

**Main Assertions**:

- [assertion 1]
- [assertion 2]

**Code Structure**:

```typescript
// Brief overview of test structure
test("scenario name", async ({ page }) => {
  // test steps
});
```
````

---

## ✅ Verification

**Test Execution**:

- Manual verification: ✅ Pass
- Code implementation: ✅ Complete
- Test successfully run: [✅ / Not yet run]

**Edge Cases Tested**:

- [edge case 1]: [result]
- [edge case 2]: [result]

---

## 📊 Coverage

**What This Test Covers**:

- [feature 1]
- [user flow 2]

**What It Doesn't Cover** (future):

- [out of scope items]

---

## 🔑 Technical Notes

- [technical decisions made]
- [workarounds if needed]
- [dependencies or setup required]

````

---

## Bug Report Template

Create when bug found: `docs/e2e-ui/bug-report-test-N.md`

```markdown
# 🐛 Bug Report: Test N

> **Discovered**: [YYYY-MM-DD HH:mm]
> **Test**: Test N: [scenario name]
> **Priority**: [Critical/High/Medium]

---

## 📋 Bug Summary

[one sentence description of bug]

---

## 🔍 Details

**What Was Being Tested**:
[test scenario description]

**Reproduction Steps**:

1. [step 1]
2. [step 2]
3. [bug occurs here]

**Expected Behavior**:
[what should happen]

**Actual Behavior**:
[what actually happened]

---

## 📸 Evidence

**Screenshots**:
- [screenshot 1]: `path/to/screenshot.png`

**Console Errors**:
````

[paste console error messages]

````

**Page State**:
```yaml
[page snapshot or relevant HTML]
````

---

## 💥 Impact

**User Impact**:
[impact on end users]

**Severity**:
[why this priority level]

---

## ✅ Tests Completed Before Bug

Following tests were successfully completed before this bug was discovered:

1. Test 1: [name] - ✅ Pass
2. Test 2: [name] - ✅ Pass
   ...

**Generated Test Code**:

- `[path/to/test1.spec.ts]`
- `[path/to/test2.spec.ts]`

**These tests are ready to commit.**

---

## 🔄 Next Steps

1. User reviews this bug report
2. Developer fixes the bug
3. After fix, resume: `/e2e-ui:execute N` to continue from this test

```

---

## Execution Flow

### Initialization
1. Detect project type and load appropriate skills
2. Load test targets document (docs/e2e-ui/test-targets.md - English version, for AI)
3. Determine which tests to run
4. Check existing summaries (resume capability)

### For Each Test
1. **Announce**: "Starting Test N: [name]"
2. **Manual Testing**:
   - Use Playwright MCP tools
   - Navigate, interact, verify
   - Take screenshots
   - Check console
3. **Evaluate**:
   - Is behavior correct?
   - Any errors?
4. **Decide**:
   - If bug: Generate bug report, stop, exit
   - If pass: Continue
5. **Write Code**:
   - Create test file
   - Implement test logic
   - Follow coding standards
6. **Document**:
   - Generate summary
   - Record findings
7. **Progress**: "Test N complete. Moving to Test N+1..."

### Completion
- All tests pass: Congratulate, provide summary
- Bug found: Provide bug report, list completed tests

---

## Execute

Start working according to the guidelines above.
```
