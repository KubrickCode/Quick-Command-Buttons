---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# TypeScript Standards

## Package Management

- Use pnpm as default package manager
- Forbid npm, yarn (prevent lock file conflicts)

## File Structure

### Common for All Files

1. Import statements (grouped)
2. Constant definitions (alphabetically ordered if multiple)
3. Type/Interface definitions (alphabetically ordered if multiple)
4. Main content

### Inside Classes

- Decorators
- private readonly members
- readonly members
- constructor
- public methods (alphabetically ordered)
- protected methods (alphabetically ordered)
- private methods (alphabetically ordered)

### Function Placement in Function-Based Files

- Main exported function
- Additional exported functions (alphabetically ordered, avoid many)
- Helper functions

## Function Writing

### Use Arrow Functions

- Always use arrow functions except for class methods
- Forbid function keyword entirely (exceptions: generator function\*, function hoisting etc. technically impossible cases only)

### Function Arguments: Flat vs Object

- Use flat if single argument or uncertain of future additions
- Use object form for 2+ arguments in most cases. Allow flat form when:
  - All required arguments without boolean arguments
  - All required arguments with clear order (e.g., (width,height), (start,end), (min,max), (from,to))

## Type System

### Type Safety

- Forbid unsafe type bypasses like any, as, !, @ts-ignore, @ts-expect-error
- Exceptions: Missing or incorrect external library types, rapid development needed (clarify reason in comments)
- Allow some unknown type when type guard is clear
- Allow as assertion when literal type (as const) needed
- Allow as assertion when widening literal/HTML types to broader types
- Allow "!" assertion when type narrowing impossible after type guard due to TypeScript limitation
- Allow @ts-ignore, @ts-expect-error in test code (absolutely forbid in production)

### AI Type Safety Enforcement

AI frequently violates type safety for convenience. Require explicit justification:

- **Every `any` needs a comment**: `// any: external API returns untyped response`
- **Every `as` needs a comment**: `// as: narrowing from unknown after validation`
- **Every `!` needs a comment**: `// !: guaranteed by previous null check in line X`
- **Prefer type guards over assertions**: Use `isUser(x)` instead of `x as User`

### Interface vs Type

- Prioritize Type in all cases by default
- Use Interface only for these exceptions:
  - Public API provided to external users like library public API
  - Need to extend existing interface like external libraries
  - Designing OOP-style classes where implementation contract must be clearly defined

### null/undefined Handling

- Actively use Optional Chaining (`?.`)
- Provide defaults with Nullish Coalescing (`??`)
- Distinguish between `null` and `undefined` by semantic meaning:
  - `undefined`: Uninitialized state, optional parameters, value not assigned yet
  - `null`: Intentional absence of value (similar to Go's nil)

## Code Style

### Maintain Immutability

- Use `const` exclusively; `let` only in loops or when reassignment is truly necessary
- Create new values instead of directly modifying arrays/objects
- Use `spread`, `filter`, `map` instead of `push`, `splice`, `sort` (mutates in-place)
- Exceptions: Extremely performance-critical cases (add comment explaining why)

### AI Immutability Enforcement

AI naturally generates mutable code. Apply strict constraints:

- **Forbid**: `array.push()`, `array.splice()`, `array.sort()`, `object.prop = value`
- **Use instead**: `[...array, item]`, `array.filter()`, `[...array].sort()`, `{ ...object, prop: value }`
- **Flag for review**: Any `let` declaration without loop context

## Recommended Libraries

- Testing: Vitest, Playwright
- Utilities: es-toolkit, dayjs
- HTTP: ky, @tanstack/query, @apollo/client
- Form: React Hook Form
- Type validation: zod
- UI: Tailwind + shadcn/ui
- ORM: Prisma (Drizzle if edge support important)
- State management: zustand
- Code formatting: prettier, eslint
- Build: tsup
