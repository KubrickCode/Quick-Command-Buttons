# Coding Convention

## Common

**One function does one thing**

- For example, if a function name requires "and" or "or" connections, it's a signal to separate
- If test cases are needed for each if branch, it's a separation signal

**Conditional and loop depth limited to 2 levels**

- Reduce depth as much as possible with early returns, and if even that becomes heavy, it's a signal to separate into a separate function

**Explicitly state function side effects**

- For example, avoid side effects like updating access information in a function with an obvious name like `getUser` that executes `updateLastAccess(...)` before `return db.user.find(...)`, rather than just returning user information.

**Convert magic numbers/strings to constants when possible**

- Usually declared at the top of the usage file or class
- Consider separating constants file if reuse is needed or the amount of constants in a file or class grows

**Function order follows call order**

- If there are clear conventions for access modifier declaration order within classes by language, follow those rules. Otherwise, write functions in call order from top to bottom for easy reading within files

**Review external library usage when implementation becomes complex**

- Review library usage when logic complexity (not simple calculations) makes test code bloated
- Use industry-standard-level libraries when available
- Use major libraries that help with security, accuracy, and performance optimization when available
- Review libraries when implementation itself is difficult due to browser/platform compatibility or countless edge cases

**Modularization (prevent code duplication and pattern repetition)**

- While it might be missed when contexts are far apart, code repetition is absolutely prohibited in recognized situations
- Modularize similar pattern repetitions (not just identical code) into reusable forms
- Allow pre-emptive modularization when reuse is almost certain, even if code hasn't repeated. However, exercise restraint when business logic is still changing
- However, don't modularize if the separated module becomes complex enough to violate other coding conventions (excessive abstraction) or cases are too simple
- Modularization levels defined as follows:
  - Within the same file, extract appropriately into separate functions
  - Separate into separate files when reused across multiple files
  - Separate into packages when reused across multiple projects or domains (same within monorepo)
- While other clear standards are difficult to define, exceptionally consider separating specific functions into separate files when they become too bloated and severely reduce code readability

**Variable, function naming**

- Variable and function names should always be clear in purpose yet concise. In ambiguous situations, first review structurally whether concerns are properly separated and purpose is unclear; if still ambiguous, err on the side of clarity rather than being too concise
- Prohibit abbreviations except industry-standard acceptable abbreviations (id, api, db, err, etc.)
- Don't repeat information already in higher context. For example, within User entity: `User.userName` -> `User.name`, within User service: `userService.createUser(...)` -> `userService.create(...)`
- Enforce prefixes like `is`, `has`, `should` for boolean variables. However, when external library interfaces differ from this rule, follow that library's rules (e.g., Chakra UI uses `disabled` not `isDisabled`)
- Prefer verb or verb+noun form for function names when possible. However, allow noun-form function names for industry-standard exceptions like GraphQL resolver fields.
- Plural rules:
  - Use "s" suffix plural variable names for pure arrays or lists. For example, type is T[] form, no metadata, directly iterable.
  - Use "list" suffix variable names for wrapped objects. For example, includes pagination info, includes metadata (count, cursor, etc.), or array nested in keys like data, items, nodes
  - Specify data structure name when using specific data structures (Set, Map, Queue): `userSet`, `userMap`, ...
  - Use as-is for already plural words (data, series, ...)

**Field order**

- All fields in objects, types, structs, interfaces, classes, etc. are defined in alphabetical ascending order by default, unless there are ordering rules or readability reasons
- Even if declaration order is well-defined for objects, structs, etc., order can be ignored at usage sites, so always maintain consistency at usage sites
- Maintain alphabetical order during destructuring assignments

**Error handling**

- Error handling level: Handle where meaningful responses (retry, fallback, user feedback) are possible; if not, propagate upward. Don't catch just to throw again.
- Error messages: Write for audience—technical details in logs, actionable guides for users. Include relevant context when wrapping errors (attempted operation, input values, system state).
- Error classification: Distinguish expected errors (validation failure, 404) from unexpected errors (network timeout, system failure). Handle each category consistently across codebase.
- Error propagation: Add context when propagating up call stack. Each layer adds its domain information while maintaining root cause.
- Recovery vs fail fast: Recover expected errors with fallback. Fail fast on unexpected errors or incorrect state—don't continue with corrupted data.

## TypeScript

**Package manager**

- Use pnpm as default package manager
- Prohibit npm, yarn (prevent lock file conflicts)

**Element order within files**

_Common to all files:_

1. Import statements (grouped)
2. Constant definitions (alphabetical if multiple)
3. Type/Interface definitions (alphabetical if multiple)
4. Main content (see below)

_Inside classes in class files:_

- Decorators
- private readonly members
- readonly members
- constructor
- public methods (alphabetical)
- protected methods (alphabetical)
- private methods (alphabetical)

_Function placement in functional files:_

- Main export function
- Additional export functions (alphabetical. Avoid many additional exports)
- Helper functions

**Arrow function usage**

- Always use arrow functions except for methods inside classes
- Prohibit function keyword entirely (exceptions: generator function\*, only when technically impossible like function hoisting)

**Function arguments: Flat vs object**

- Flat if 1 argument or unclear if more arguments will be added
- Object form in most situations with 2+ arguments. Allow Flat form if meeting below criteria:
  - All required arguments with no boolean arguments
  - All required arguments with clear order (e.g., (width, height), (start, end), (min, max), (from, to))

**Type safety**

- Basically prohibit methods that unsafely bypass types like any, as, !, @ts-ignore, @ts-expect-error
- Exceptionally allow type bypass when external library types are missing, seriously incorrect, or rapid development is needed, but clearly comment the reason
- Partially allow unknown type when type guard is clear
- Allow as assertion when literal types (as const) are needed
- Conversely allow as assertion when widening literal types, HTML types, etc. to broader types is beneficial
- Allow "!" assertion when type guard is clear immediately before and no other code between guard and usage, but TypeScript's limitations prevent type narrowing
- Allow @ts-ignore, @ts-expect-error in test code (absolutely prohibited in production) when deliberately passing incorrect types

**Interface vs Type**

- Basically prioritize Type for all cases
- Use Interface only for following exceptions:
  - When providing to external users like library public API
  - When extending existing interfaces from external libraries
  - When clearly defining contract items for classes to implement when designing OOP-style classes

**null/undefined handling**

- Actively use Optional Chaining (`?.`)
  - Provide default values with Nullish Coalescing (`??`)
  - Use only one of `null` or `undefined` (consistency)
    - Recommended: Use `undefined` (consistent with function parameter defaults)
    - Use `null` only when unavoidable like external API responses

**Maintain immutability**

- Use `const` when possible, minimize `let`
  - Create new values for arrays/objects instead of direct modification
  - Use `spread`, `filter`, `map` instead of `push`, `splice`
  - Exception: When performance is extremely critical

**Error rules**

- Error types: Create custom error classes inheriting `Error` for domain-specific failures when possible. Prohibit throwing non-Error objects.
- Async errors: Always handle Promise rejections. Use try-catch for async/await, .catch() for promise chains.

**Recommended libraries**

- Testing: Vitest, Playwright
- Utility: es-toolkit, dayjs
- HTTP: ky, @tanstack/query, @apollo/client
- Form: React Hook Form
- Type validation: zod
- UI: Tailwind + shadcn/ui
- ORM: Prisma (Drizzle if edge support important)
- State management: zustand
- Code format: prettier, eslint
- Build: tsup

# Test Guide

## Common Principles

### Test File Structure

1:1 matching with target file. Test files located in same directory as target files.

### Test Hierarchy

Organize major sections by method (function) units, write minor sections for each case. Complex methods can add intermediate sections by scenario.

### Test Scope Selection

Omit obvious or overly simple logic (simple getters, constant returns). Prioritize testing business logic, conditional branches, code with external dependencies.

### Test Case Composition

Minimum 1 basic success case required. Main focus on failure cases, boundaries, edge cases, exception scenarios.

### Test Independence

Each test must be independently executable. Prohibit dependency on execution order between tests. Initialize for each test when using shared state.

### Given-When-Then Pattern

Structure test code in 3 stages—Given (setup), When (execution), Then (verification). Distinguish stages with comments or blank lines for complex tests.

### Test Data

Use hardcoded meaningful values. Avoid random data as it causes irreproducible failures. Fix seed if necessary.

### Mocking Principles

Mock external dependencies (API, DB, file system). Use actual modules within same project when possible, mock only when complexity is high.

### Test Reusability

Extract repeated mocking setups, fixtures, helper functions as common utilities. However, be careful not to harm test readability with excessive abstraction.

### Integration/E2E Tests

Unit tests take priority. Write integration/E2E when complex flows or multi-module interactions are difficult to understand from code alone. Located in separate directories (`tests/integration`, `tests/e2e`).

### Test Naming

Test names should clearly express "what is being tested". Recommend "when ~ should ~" format. Focus on behavior rather than implementation details.

### Assertion Count

Allow multiple related assertions in one test, but separate tests when verifying different concepts.

---

## TypeScript

### File Naming

`{target-filename}.spec.ts` format.

**Example:** `user.service.ts` → `user.service.spec.ts`

### Test Framework

Use Vitest. Maintain consistency within project.

### Structuring

Group methods/features with `describe`, write individual cases with `it`. Can classify scenarios with nested `describe`.

### Mocking

Utilize Vitest's `vi.mock()`, `vi.spyOn()`. Mock external modules at top level, use `mockReturnValue`, `mockImplementation` for per-test behavior changes.

### Async Tests

Use `async/await`. Test Promise rejections with `await expect(fn()).rejects.toThrow()` format.

### Setup/Teardown

Common preparation/cleanup with `beforeEach`, `afterEach`. Use `beforeAll`, `afterAll` only for heavy initialization (DB connections, etc.).

### Type Safety

Type check test code too. Minimize `as any` or `@ts-ignore`. Clearly use type guards or type assertions when necessary.

### Test Utility Location

Single file utilities at bottom of same file, multi-file shared utilities in `__tests__/utils` or `test-utils` directory.

### Coverage

Code coverage is a reference metric. Focus on meaningful case coverage rather than blindly pursuing 100%.

# Framework Guide

## React

### Component Structure

**Component per File Rule**: Preferably one exported component per file, allow multiple internal-use components when necessary (not recommended).

- Prohibit export default (refactoring and tree-shaking issues)
- Use only named exports
- Prohibit exporting internal helper components
- Component file order: Main export component → Additional export components → Internal helper components

### State Management Rules

**State Management Hierarchy**:

1. **Local State (useState)**: Used only in single component
2. **Props Drilling**: Allow maximum 2 levels
3. **Context API**: When 3+ levels of prop drilling needed
4. **Global State (Zustand, etc.)**:
   - Shared across 5+ components
   - Server state synchronization needed
   - Complex state logic (computed, actions)
   - Developer tools support needed

### Hook Usage Rules

**Custom Hook Extraction Criteria**:

- 3+ useState/useEffect combinations
- Reused in 2+ components
- 50+ lines of logic

**Minimize useEffect Usage**:

- Use useEffect only for external system synchronization
- Handle state updates in event handlers
- Calculate computed values with useMemo or direct calculation in component
- Use only when truly necessary and specify reason in comments

```typescript
// ❌ Bad: State synchronization with useEffect
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅ Good: Direct calculation
const fullName = `${firstName} ${lastName}`;
```

### Props Rules

**Rules for Adding Shared Component Props**:

- Mandatory structure review before adding new props (prevent indiscriminate prop additions at shared level)
- Check for Single Responsibility Principle violations
- Consider composition pattern for 3+ optional props
- Review if consolidation into variant prop is possible

### Conditional Rendering

**Basic Rules**:

```typescript
// Simple condition: && operator
{
  isLoggedIn && <UserMenu />;
}

// Either/or: Ternary operator
{
  isLoggedIn ? <UserMenu /> : <LoginButton />;
}

// Complex conditions: Separate function or early return
const renderContent = () => {
  if (status === "loading") return <Loader />;
  if (status === "error") return <Error />;
  return <Content />;
};
```

**Activity Component**:

- Use when pre-rendering hidden parts or maintaining state is needed
- Manage with visible/hidden mode
- Utilize for frequently toggled UI like tab switching, modal content

### Memoization

**Use React Compiler**:

- Rely on automatic memoization
- Use manual memoization (React.memo, useMemo, useCallback) only in special cases
- Utilize as escape hatch when compiler cannot optimize
