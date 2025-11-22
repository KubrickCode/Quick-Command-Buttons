---
description: Research UI E2E test targets and generate test scenario documentation
---

# UI E2E Test Research Command

## Prerequisites

- ✅ Frontend server must be already running
- ✅ Playwright MCP server must be running

## User Input

```text
$ARGUMENTS
```

Extract port number from user input and consider any additional context (if not empty).

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

#### Detect Project Type

**Analyze package.json**:

- `"next"` → Next.js project
- `"react"` + `"react-router"` → React SPA

**Analyze File Structure**:

- `app/` directory → Next.js App Router
- `pages/` directory → Next.js Pages Router or React

#### Auto-load Appropriate Skills

Based on detected framework:

- Next.js → `.claude/skills/nextjs` (if exists)
- React → `.claude/skills/react` (if exists)
- Always load `.claude/skills/typescript` and `.claude/skills/typescript-test` (if exists)

#### Understand Backend Business Domain (if applicable)

**Detect Backend Presence**:

- `backend/`, `server/`, `api/` directories exist
- Server frameworks in package.json (Express, Fastify, NestJS, etc.)
- Backend services in docker-compose.yml

**Analyze Project**:

- `README.md`: Project overview, architecture
- `CLAUDE.md`: Domain knowledge, business rules
- REST API or GraphQL API endpoints (if backend exists)
- Data models (if backend exists)
- OpenAPI/Swagger docs (if exists)

**Information to Gather**:

- Main domain entities (User, Product, Order, etc.)
- Core business flows (ordering, payment, auth, etc.)
- Permission model (RBAC, ABAC)
- External service integrations

### 2. Analyze Existing UI E2E Test Files (For Context Only)

- Search test files with Glob (`**/*.e2e.{ts,tsx,js,jsx}`, `**/*.spec.{ts,tsx,js,jsx}`, `tests/e2e-ui/**/*`, `e2e/**/*`)
- Read existing test **case descriptions (describe/test) only** to understand coverage
- Understand test patterns and structure
- **Important**: Do NOT read existing docs (`docs/e2e-ui/test-targets.md`) - will delete and recreate

### 3. Static Codebase Analysis

**Frontend Structure Analysis**:

- Find route definitions with Glob
  - Next.js: `app/**/page.{ts,tsx}`, `pages/**/*.{ts,tsx}`
  - React Router: `src/routes/**/*.{ts,tsx}`, `src/pages/**/*.{ts,tsx}`
  - SvelteKit: `src/routes/**/+page.svelte`
- Read main page components
- Map user flows and interactions
- List main UI components and features

### 4. 🎭 Playwright MCP Actual Browser Exploration (Required)

**This is the most important step!** Code analysis alone cannot reveal actual user experience.

#### 4.1 Initial Access and Basic Structure Understanding

```javascript
// MCP tool usage example
browser_navigate: http://localhost:{port}
browser_snapshot: Capture initial page DOM structure
```

- Analyze main page structure
- Identify navigation menu elements
- List main links and buttons

#### 4.2 Major Page Traversal

Based on route list identified from code:

```javascript
// For each page
browser_navigate: http://localhost:{port}/{route}
browser_snapshot: Capture page DOM structure
```

- Identify interactive elements on each page (buttons, links, forms, dropdowns)
- Check dynamic elements (modals, toasts, dialogs)
- Understand navigation flow between pages

#### 4.3 User Flow Experiments

Simulate main workflows:

```javascript
// Example: Login flow
browser_click: "login button selector";
browser_type: ("email input", "test@example.com");
browser_type: ("password input", "password123");
browser_click: "submit button";
browser_wait_for: "dashboard loaded";
browser_snapshot: "after login state";
```

**Flows to Explore**:

- Login/logout (if exists)
- CRUD operations (create, read, update, delete)
- Form submission and validation
- Modal/dialog interactions
- Search and filtering
- Pagination
- File upload (if exists)

Capture snapshots at each step to record state changes

#### 4.4 Edge Case Exploration

- Empty state: UI when no data
- Loading state: During network requests
- Error state: Validation failures, API errors
- Unauthorized page access
- Invalid input handling
- Long text, special character input

#### 4.5 Responsive and Accessibility Check (briefly)

- Various viewport sizes (mobile, tablet, desktop)
- Keyboard navigation availability
- Focus state verification

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

**Reason**:

- Research phase is for defining "what to test"
- Bug discovery and fixing proceeds in execution phase
- Test scenarios should be complete even with bugs (TDD mindset)

### 5. Define Test Scenarios

**Integrate Code Analysis + Browser Exploration Results**:

Mark source for each scenario:

- 📊 Found via code analysis
- 🎭 Found via browser exploration
- 📊🎭 Found via both

**Prioritize (Critical/High/Medium)**:

**Critical**: Core functionality where failure breaks the app

- User authentication
- Main feature workflows
- Data integrity operations

**High**: Important features used frequently

- Secondary workflows
- Common user interactions
- UI component behaviors

**Medium**: Nice-to-have features

- Visual regression
- Performance checks
- Accessibility tests

**Each Scenario Should Include**:

1. **Clear Description**: What is being tested
2. **Source**: 📊 Code Analysis | 🎭 Browser Exploration
3. **Test Steps**: Detailed user actions
4. **Expected Results**: What should happen
5. **Verification Points**: What to check with MCP tools
6. **Priority Level**: Critical/High/Medium
7. **Dependencies**: Required setup or previous tests

### 6. Generate Completely Fresh Bilingual Documentation

**Files to Create**:

- `docs/e2e-ui/test-targets.ko.md` (Korean)
- `docs/e2e-ui/test-targets.md` (English)

**Document Synchronization**:

- Content identical except language
- Code examples, technical terms identical on both sides
- Language switch links at top of file

**Important - Existing Document Handling**:

- If existing docs exist, **completely delete and recreate**
- Do not reference past content (only reference test file cases)
- Always start from clean slate

---

## Key Rules

### ✅ MUST DO

- **Playwright MCP actual browser exploration required** (code analysis alone insufficient)
- **Always completely recreate docs** (delete existing docs)
- Read existing test **file cases only** for context understanding
- Auto-detect framework and load appropriate skills
- Simultaneous bilingual doc generation (ko.md, .md)
- Understand business domain if backend exists
- Prioritize important user flows
- Consider both happy paths and error cases
- Group related scenarios by page/feature
- Define clear success criteria for each test
- Mark source for each scenario (📊 Code | 🎭 Browser)

### ❌ NEVER DO

- **Skip Playwright MCP browser exploration**
- **Read or reference existing docs/e2e-ui/test-targets.md docs** (only create fresh)
- **Preserve or merge existing doc content** (completely delete and recreate)
- Give user feedback when bugs found (handle in execution phase)
- Hardcode React/TypeScript skills only (need framework auto-detection)
- Generate single language docs only
- Ignore edge cases and error states
- Define vague or untestable scenarios

### 🎯 Test Scenario Quality

Each scenario should include:

1. **Clear Description**: What is being tested
2. **Source**: 📊 Code Analysis | 🎭 Browser Exploration
3. **Test Steps**: Detailed user actions
4. **Expected Results**: What should happen
5. **Verification Points**: What to check with MCP tools
6. **Priority Level**: Critical/High/Medium
7. **Dependencies**: Required setup or previous tests

---

## Document Template

### Korean Version: `docs/e2e-ui/test-targets.ko.md`

```markdown
# UI E2E Test Targets

[**한국어**](./test-targets.ko.md) | [English](./test-targets.md)

> **Created**: {YYYY-MM-DD HH:mm}
> **Research Method**: Code Analysis + Playwright Browser Exploration

---

---

## 📊 Current Coverage Analysis

### Existing UI E2E Tests

- `{test-file-1}`: {what it covers}
- `{test-file-2}`: {what it covers}

### Codebase Analysis

- **Framework**: {React/Next.js/Vue/etc}
- **Main Routes**: {X count}
- **Components**: {Y count}

### 🎭 Playwright Browser Exploration Results

- **Pages Explored**: {Z count}
- **User Flows Found**: {W count}
- **Interactive Elements**: {V count}
- **Testable Edge Cases**: {U count}

### Coverage Gaps

- {gap 1}
- {gap 2}

---

## 🎯 Test Scenarios by Priority

### Critical Priority

#### Test 1: {scenario name}

**Source**: 📊 Code Analysis | 🎭 Browser Exploration

**Page/Feature**: {page name or feature area}

**Description**: {what this test verifies}

**Test Steps**:

1. {step 1}
2. {step 2}
3. {step 3}

**Expected Results**:

- {expected result 1}
- {expected result 2}

**Verification Points** (Playwright MCP):

- `browser_snapshot`: {DOM elements to check}
- `browser_take_screenshot`: {what to verify via screenshot}

**Priority**: Critical

**Dependencies**: {none / previous test N}

---

#### Test 2: {scenario name}

{same structure}

---

### High Priority

#### Test 3: {scenario name}

{same structure}

---

### Medium Priority

#### Test 4: {scenario name}

{same structure}

---

## 📋 Test Implementation Order

Recommended execution order (considering dependencies):

1. Test N: {name} (Critical - no dependencies)
2. Test M: {name} (Critical - depends on Test N)
3. Test K: {name} (High - no dependencies)
   ...

---

## 🔧 Technical Considerations

### Playwright MCP Tools

- **Navigation**: `browser_navigate`
- **Interaction**: `browser_click`, `browser_type`, `browser_select_option`
- **Verification**: `browser_snapshot`, `browser_take_screenshot`
- **Waiting**: `browser_wait_for`

### Test Environment

- **Base URL**: http://localhost:{port}
- **Required Services**: {backend, database, etc}

### Test Data

- {required test accounts (by role)}
- {required sample data}
- {external service mocking requirements}

---

## 🚨 Cautions

- {known bugs or unstable behaviors}
- {environment-specific considerations}
- {performance-related cautions}
```

### English Version: `docs/e2e-ui/test-targets.md`

Same structure as Korean version, content translated to English.

Language links at top of file:

```markdown
[한국어](./test-targets.ko.md) | [**English**](./test-targets.md)
```

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

You can implement test scenarios as actual Playwright tests with `/e2e-ui:execute` command.
```

---

## Execute

Start working according to the guidelines above.
