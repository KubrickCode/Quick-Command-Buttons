---
name: react
description: |
  Best practices and coding standards for React component development. Component structure, state management, Hook usage, performance optimization.
  TRIGGER: React component, .tsx/.jsx file, useState/useEffect Hook, state management, conditional rendering, props design
---

# React Development Standards

## Component Structure

### Rules Per File Component

Exported components should be one per file when possible; internal components can have multiple if necessary (not recommended).

- Forbid export default (refactoring and tree-shaking issues)
- Use named exports only
- Don't export internal helper components
- File order: Main exported component → Additional exported components → Internal helper components

## State Management Rules

### State Management Hierarchy

1. **Local State (useState)**: Used only in a single component
2. **Props Drilling**: Allow maximum 2 levels
3. **Context API**: Use when 3+ levels of prop drilling needed
4. **Global State (Zustand, etc.)**:
   - Shared across 5+ components
   - Server state synchronization needed
   - Complex state logic (computed, actions)
   - Developer tools support needed

## Hook Usage Rules

### Custom Hook Extraction Criteria

- 3+ combinations of useState/useEffect
- Reused in 2+ components
- 50+ lines of logic

### Minimize useEffect Usage

- useEffect only for external system synchronization
- Handle state updates in event handlers
- Calculate derived values directly or with useMemo
- Use only when truly necessary and comment why

```typescript
// ❌ Bad: useEffect for state synchronization
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Good: Direct calculation
const fullName = `${firstName} ${lastName}`;
```

## Props Rules

### Rules for Adding Props to Common Components

- Review structure before adding new props (prevent indiscriminate prop additions at shared level)
- Check for single responsibility principle violations
- Consider composition pattern for 3+ optional props
- Review if can be unified with variant prop

## Conditional Rendering

### Basic Rules

```typescript
// Simple condition: && operator
{isLoggedIn && <UserMenu />}

// Binary choice: ternary operator
{isLoggedIn ? <UserMenu /> : <LoginButton />}

// Complex condition: separate function or early return
const renderContent = () => {
  if (status === 'loading') return <Loader />;
  if (status === 'error') return <Error />;
  return <Content />;
};
```

### Activity Component

- Use when pre-rendering hidden parts or maintaining state is needed
- Manage with visible/hidden mode
- Utilize for frequently toggled UI like tab switching, modal contents

## Memoization

### Using React Compiler

- Rely on automatic memoization
- Manual memoization (React.memo, useMemo, useCallback) only for special cases
- Use as escape hatch when compiler cannot optimize
