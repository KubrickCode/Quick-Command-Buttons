# VS Code Extension Testing Guide

This guide provides step-by-step instructions for implementing tests in the Quick Command Buttons VS Code extension.

**IMPORTANT: All content in this file must be written in English only. No Korean or other languages are allowed.**

## Overview

Testing implementation consists of two main phases:

1. **Refactoring**: Improve existing code to be unit-test friendly
2. **Test Implementation**: Create test code using Jest

## 1. Refactoring Principles

### Goals

- Refactor methods/functions to be unit-testable
- Avoid premature optimization
- Don't over-segregate into meaninglessly simple units

### Architecture Philosophy

- **Minimize VS Code API Dependencies**: Design code to be testable without extensive mocking
- **Pure Functions First**: Extract business logic into pure functions when possible
- **Mock Only When Necessary**: Use mocking only for essential VS Code API calls that cannot be avoided

### Target Files Analysis

**Priority 1 (Core Logic)**

- [ ] `command-executor.ts` - Command execution logic
- [ ] `status-bar-manager.ts` - Status bar management
- [ ] `command-tree-provider.ts` - Tree view provider
- [ ] `terminal-manager.ts` - Terminal management

**Priority 2 (Supporting Logic)**

- [ ] `adapters.ts` - VS Code API adapters
- [ ] `webview-provider.ts` - Webview provider
- [ ] `show-all-commands.ts` - Show all commands

**Priority 3 (Simple Logic)**

- [ ] `main.ts` - Extension entry point
- [ ] `types.ts` - Type definitions

### Refactoring Tasks per File

For each file, follow these steps:

1. **Dependency Analysis**: Identify external dependencies
2. **Method Separation**: Split complex methods into smaller units
3. **Pure Function Extraction**: Convert to pure functions where possible
4. **Dependency Injection**: Improve dependency structure for testability

## 2. Test Implementation Guide

### Test Framework

- **Jest** for unit testing
- VS Code Extension Test Framework for integration tests (if needed)

### File Structure Rules

```
src/
├── adapters.ts              → adapters.test.ts
├── command-executor.ts      → command-executor.test.ts
├── status-bar-manager.ts    → status-bar-manager.test.ts
├── command-tree-provider.ts → command-tree-provider.test.ts
├── terminal-manager.ts      → terminal-manager.test.ts
├── webview-provider.ts      → webview-provider.test.ts
├── show-all-commands.ts     → show-all-commands.test.ts
└── main.ts                  → main.test.ts
```

### Test File Structure

```typescript
describe("FileName", () => {
  // File-level test group

  describe("methodName1", () => {
    // Method-level test group

    it("should handle success case", () => {
      // Success case test
    });

    it("should handle failure case", () => {
      // Failure case test
    });
  });

  describe("methodName2", () => {
    // Another method test group

    it("should handle edge case", () => {
      // Edge case test
    });
  });
});
```

### Test Implementation Principles

1. **Minimum Cases**: At least one success and one failure case per method
2. **Single Responsibility**: Work on only one method at a time
3. **Strategic Mocking**: Mock VS Code APIs only when absolutely necessary for testing flow
4. **Independence**: Each test should run independently

### Mocking Strategy

**When to Mock:**

- VS Code API calls that are essential to test flow
- External dependencies that cannot be avoided
- Complex integrations that require specific responses

**When NOT to Mock:**

- Business logic that can be extracted as pure functions
- Simple data transformations
- Validation logic

```typescript
// Example: Mock only when necessary
jest.mock(
  "vscode",
  () => ({
    window: {
      showQuickPick: jest.fn(), // Only if testing user interaction flow
    },
  }),
  { virtual: true }
);
```

## 3. Work Progress Tracking

### Phase 1: Refactoring Progress

**command-executor.ts**

- [ ] `createQuickPickWithShortcuts` method
  - [x] Extract validateShortcuts pure function
  - [x] Extract shortcut finder logic
  - [x] Extract command execution logic
- [x] `executeButtonCommand` method
  - [x] Extract button type checking logic (`determineButtonExecutionType` function)
  - [x] Extract command execution logic (`executeTerminalCommand` function)
- [x] `showGroupQuickPick` method
  - [x] Extract QuickPick item creation logic
- [x] `executeAllCommands` method
  - [x] Extract recursive execution logic

**status-bar-manager.ts**

- [ ] `createCommandButtons` method
  - [x] Extract button priority calculation logic
  - [x] Extract tooltip text creation logic
  - [x] Extract button command creation logic
- [x] `createRefreshButton` method
  - [x] Extract refresh button configuration logic

**command-tree-provider.ts**

- [x] `getChildren` method - Extract tree item creation logic (`createTreeItemsFromGroup` function)
- [ ] `getRootItems` method - Extract root item creation logic
- [ ] Static methods analysis (executeFromTree)

**terminal-manager.ts**

- [ ] Method-by-method refactoring (TBD after analysis)

**adapters.ts**

- [ ] Method-by-method refactoring (TBD after analysis)

**webview-provider.ts**

- [ ] Method-by-method refactoring (TBD after analysis)

**show-all-commands.ts**

- [ ] Method-by-method refactoring (TBD after analysis)

**main.ts**

- [ ] Method-by-method refactoring (TBD after analysis)

### Phase 2: Test Implementation Progress

**command-executor.ts**

- [ ] `validateShortcuts` function tests
  - [ ] Success cases (unique shortcuts)
  - [ ] Failure cases (duplicate shortcuts)
  - [ ] Edge cases (empty arrays, no shortcuts)
- [ ] Other extracted functions tests (TBD after Phase 1 completion)

**status-bar-manager.ts**

- [ ] Tests for extracted functions (TBD after Phase 1 completion)

**Other files**

- [ ] Tests for extracted functions (TBD after Phase 1 completion)

## 4. AI Agent Work Guidelines

### Work Unit Constraints

- **One Method Only**: Work on only one method's refactoring or testing
- **No Multi-tasking**: Never handle multiple methods simultaneously
- **Clear Scope**: Define exact work scope before starting

### Progress Tracking Rules

- **Update Checkboxes**: Mark completed tasks immediately
- **Document Changes**: Note any architectural decisions
- **Next Agent Guidance**: Leave clear instructions for the next task

### Code Quality Standards

- Test coverage target: 80%+
- All public methods must be tested
- Complex private methods tested indirectly
- Error handling cases included

### Validation Criteria

- All tests must pass
- No impact on existing functionality
- Same behavior after refactoring
- Reasonable test execution time

## 5. Common Issues and Solutions

### VS Code API Dependencies

- **Issue**: Direct VS Code API usage makes testing difficult
- **Solution**: Extract business logic into pure functions, use adapter pattern only when necessary

### Async Processing

- **Issue**: Complex async code testing
- **Solution**: Use async/await patterns and Jest async testing features

### State Management

- **Issue**: Global state interference between tests
- **Solution**: Proper setup/teardown with beforeEach/afterEach

## 6. Instructions for AI Agents

1. **Read This Guide First**: Always check progress tracking sections
2. **Update Progress**: Mark checkboxes as you complete tasks
3. **One Task Only**: Focus on single method/function unit
4. **English Only**: All comments and documentation must be in English
5. **Document Decisions**: Note any important architectural choices
6. **Test Required**: Every refactoring must be followed by tests

Following this guide systematically will result in robust, maintainable test code.
