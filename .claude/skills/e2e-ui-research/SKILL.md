---
name: e2e-ui-research
description: Research UI E2E test targets and generate test scenario documentation. Use to analyze a frontend app and create comprehensive E2E test plans.
context: fork
agent: general-purpose
---

# UI E2E Test Research Command

## Prerequisites

- ✅ Frontend server must be already running
- ✅ Playwright MCP server must be running

## User Input

```text
$ARGUMENTS
```

Consider any additional context from user input (if not empty). Port and base URL will be extracted from `playwright.config.ts`.

---

## Overview

This command performs comprehensive UI E2E test research including **actual browser exploration via Playwright MCP**.

### Key Features

- 🎭 **Actual Browser Exploration**: Direct app manipulation via Playwright MCP
- 📊 **Codebase Analysis**: Static analysis to understand routes and components
- 🔄 **Bilingual Documentation**: Simultaneous Korean/English version generation
- 🧠 **Business Domain Understanding**: Backend analysis for domain context
- 📝 **Always Create Fresh**: Delete existing docs and create completely new ones

---

## Execution Steps

### 1. Preparation and Context Gathering

#### Detect Project Type and Configuration

**Read `playwright.config.ts` (or `.js`) and `package.json` together**:

From `playwright.config.ts`:

- Base URL and port (from `webServer.url` or `use.baseURL`)
- Test directory location (from `testDir` or `testMatch`)
- Browser configuration and test settings

From `package.json` (in same directory as playwright.config.ts):

- Framework detection via dependencies: `next`, `react`, `vue`, `svelte`, `@angular/core`, etc.
- Build tools: `vite`, `webpack`, `turbopack`, etc.

### 2. Analyze Existing UI E2E Test Files (For Context Only)

**Use `playwright.config.ts` to locate test files**:

- Read `testDir` or `testMatch` from playwright.config to find test location
- If config specifies patterns, use those (e.g., `tests/e2e/**/*.spec.ts`)
- **Fallback**: If not found in config, search with Glob

**Analyze existing tests**:

- Read existing test **case descriptions (describe/test/it) all** to understand coverage
- Understand test patterns and structure
- **Important**: Do NOT read existing docs - will delete and recreate

### 3. Static Codebase Analysis

**Frontend Structure Analysis**:

- Find route definitions with Glob (adapt patterns to project structure)
- Read main page components
- Map user flows and interactions
- List main UI components and features

### 4. 🎭 Playwright MCP Actual Browser Exploration (Required)

**This is the most important step!** Code analysis alone cannot reveal actual user experience.

**Get base URL from `playwright.config.ts`**:

- Read `webServer.url` or `use.baseURL` to get the application URL
- Extract port number from the URL
- If not found in config, ask user to provide base URL

#### 4.1 Initial Access and Basic Structure Understanding

```javascript
browser_navigate: {baseURL from config}
browser_snapshot: Capture initial page DOM structure
```

- Analyze main page structure
- Identify navigation menu elements
- List main links and buttons

#### 4.2 Major Page Traversal

Based on route list identified from code:

```javascript
browser_navigate: {baseURL}/{route}
browser_snapshot: Capture page DOM structure
```

- Identify interactive elements on each page
- Check dynamic elements (modals, toasts, dialogs)
- Understand navigation flow between pages

#### 4.3 User Flow Experiments

Simulate main workflows:

- Login/logout (if exists)
- CRUD operations
- Form submission and validation
- Modal/dialog interactions
- Search and filtering
- Pagination

### 5. Define Test Scenarios

**Integrate Code Analysis + Browser Exploration Results**:

Mark source for each scenario:

- 📊 Found via code analysis
- 🎭 Found via browser exploration
- 📊🎭 Found via both

### 6. Verify Against Existing Tests

**After defining test scenarios, cross-check with existing E2E tests**:

- Compare defined scenarios with existing test cases
- Mark scenarios as:
  - ✨ New scenario (not covered)
  - ✅ Already implemented (skip or note in docs)
  - 🔄 Partial coverage (extend existing test)

**Prioritize (Critical/High/Medium)**:

- **Critical**: Core functionality where failure breaks the app
- **High**: Important features used frequently
- **Medium**: Nice-to-have features

### 7. Generate Completely Fresh Bilingual Documentation

**Files to Create**:

- `docs/e2e-ui/test-targets.ko.md` (Korean)
- `docs/e2e-ui/test-targets.md` (English)

**Important - Existing Document Handling**:

- If existing docs exist, **completely delete and recreate**
- Do not reference past content (only reference test file cases)
- Always start from clean slate

---

## Key Rules

### Required Steps

1. **Read configuration first** - Extract from `playwright.config.ts` and `package.json`
2. **Browser exploration** - Use Playwright MCP for actual testing
3. **Fresh documentation** - Delete existing docs and create new ones
4. **Verify against existing tests** - Read test file cases to prevent duplicates
5. **Bilingual output** - Generate both ko.md and .md versions

### Guidelines

**Do:**

- Use values from playwright.config.ts (not hardcoded URLs)
- Adapt flexibly to project structure
- Group scenarios by page/feature
- Include both happy paths and error cases
- Mark source and coverage status

**Avoid:**

- Skipping configuration file reading
- Referencing old docs (create fresh)
- Reporting bugs during research (save for execution phase)
- Vague or untestable scenarios
- Single language documentation

### 🐛 Bug Discovery Handling Guidelines

**Important**: Even if bugs are found during Playwright MCP browser exploration:

❌ **DON'T**:

- Report bugs or provide feedback to user
- Suggest bug fixes
- Suggest bug workarounds in test scenarios

✅ **DO**:

- Write scenarios for buggy features **as they should work normally**
- Include "currently broken but should work" features in test targets
- Bugs will be naturally discovered and fixed during UI E2E test **execution phase**

---

## Completion Report

After research completion, provide summary to user:

```markdown
## UI E2E Test Research Complete

### 📊 Findings

- **Framework**: {React/Next.js/Vue/etc}
- **Pages Explored**: {X count}
- **User Flows Found**: {Y count}
- **Existing UI E2E Tests**: {Z count}

### 🎯 Test Scenarios

- **Critical**: {N count}
- **High**: {M count}
- **Medium**: {K count}
- **Total**: {N+M+K count}

### 📝 Generated Documents

- `docs/e2e-ui/test-targets.ko.md` (Korean)
- `docs/e2e-ui/test-targets.md` (English)

### 🔍 Coverage Gaps

- {main gap 1}
- {main gap 2}

### Next Steps

You can implement test scenarios as actual Playwright tests with `/e2e-ui-execute` command.
```

---

## Execute

Start working according to the guidelines above.
