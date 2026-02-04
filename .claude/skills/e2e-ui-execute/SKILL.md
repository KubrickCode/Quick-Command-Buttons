---
name: e2e-ui-execute
description: Implement UI E2E tests sequentially using Playwright MCP, stop on bug discovery. Use after e2e-ui-research to implement the planned test scenarios.
context: fork
agent: general-purpose
---

# UI E2E Test Implementation Command

## User Input

```text
$ARGUMENTS
```

Extract test number (if specified) and consider any additional context from user input (if not empty).

---

## Overview

1. **Check Prerequisites**:
   - Verify `docs/e2e-ui/test-targets.md` exists (English version, for AI)
   - If not exists ERROR: "Please run /e2e-ui-research first"

2. **Read Project Configuration**:
   - Read `playwright.config.ts` (or `.js`):
     - Extract test directory from `testDir` or `testMatch`
     - Extract base URL from `webServer.url` or `use.baseURL`
   - Read `package.json` (in same directory):
     - Detect framework from dependencies

3. **Load Test Targets**:
   - Read test scenarios from document
   - Extract test number from $ARGUMENTS (if provided)
   - Identify execution order

4. **Execute Tests Sequentially**:
   - For each test scenario (in order):
     a. **Manual Testing Phase**: Verify behavior with Playwright MCP
     b. **Bug Detection**: Check for issues
     c. **Bug Handling**: If bug found, create bilingual bug report (ko.md + md) and continue
     d. **Code Writing Phase**: Write Playwright test code if passed (skip if bug)
     e. **Progress Reporting**: Update summary document

5. **Generate Documentation**:
   - Create `docs/e2e-ui/summary-test-N.md` for each completed test
   - Create `docs/e2e-ui/bug-report-test-N.ko.md` and `bug-report-test-N.md` for bugs
   - Track overall progress

6. **Report Results**:
   - List of completed tests
   - List of bugs found (with details)
   - Summary of test code created
   - Guide next steps

---

## Key Rules

### 🚨 Bug Detection (Important)

**Document and continue when these situations occur**:

1. **Page Load Failure**: Navigation timeout, 404/500 errors, Blank page
2. **Element Not Found**: Expected button/input missing, Wrong element attributes
3. **Interaction Failure**: Click not working, Input text not entering
4. **Console Errors**: JavaScript errors, Network failures
5. **Unexpected Behavior**: Wrong navigation, Wrong data display

**Bug Report Format** (create both ko.md and md versions):

Files to create:

- `docs/e2e-ui/bug-report-test-N.ko.md` (Korean)
- `docs/e2e-ui/bug-report-test-N.md` (English)

After creating bug report, **continue to next test** instead of stopping.

### ✅ MUST DO

- **Read `playwright.config.ts` and `package.json` first** for project configuration
- Run tests **one at a time** (sequentially)
- Use Playwright MCP for **actual testing** before code writing
- **Create bilingual bug reports** (ko.md + md) when bugs found
- **Continue testing** after documenting bugs
- Write test code in **directory from playwright.config.ts**
- Follow naming convention from testMatch pattern
- Take screenshots for evidence

### ❌ NEVER DO

- **Skip reading `playwright.config.ts`**
- Run multiple tests in parallel
- Skip manual verification phase
- **Stop testing after finding bug** (should continue)
- Write test code without verifying behavior
- Write tests outside directory specified in playwright.config
- Hardcode base URLs or test directories

### 🎯 Test Implementation Process

For each test:

1. **Manual Verification** (using Playwright MCP):
   - Navigate to page
   - Interact with UI elements
   - Take snapshots
   - Verify expected behavior
   - Check console messages

2. **Bug Check**:
   - Did everything work as expected?
   - Any errors or warnings?
   - Is behavior correct?

3. **Decision Point**:
   - ✅ **If Pass**: Proceed to write test code
   - 🐛 **If Bug Found**: Create bilingual bug report, continue to next test

4. **Write Test Code** (only if passed):

   ```typescript
   // Create test file in directory from playwright.config.ts
   // Follow project test patterns
   // Include assertions and error handling
   // Follow naming convention from testMatch pattern
   ```

5. **Documentation**:
   - Generate summary document
   - Record what was tested
   - Note observations

---

## Execution Flow

### Initialization

1. **Read project configuration files**
2. Load test targets document (English version, for AI)
3. Determine which tests to run
4. Check existing summaries (resume capability)

### For Each Test

1. **Announce**: "Starting Test N: [name]"
2. **Manual Testing**: Use Playwright MCP tools
3. **Evaluate**: Is behavior correct? Any errors?
4. **Decide**: Bug report or continue to code
5. **Write Code** (only if passed)
6. **Document**: Generate summary or bug report
7. **Progress**: "Test N complete. Moving to Test N+1..."

### Completion

- Provide comprehensive summary:
  - List of tests passed with generated code
  - List of bugs found with report links
  - Overall coverage achieved
  - Recommendations for next steps

---

## Execute

Start working according to the guidelines above.
