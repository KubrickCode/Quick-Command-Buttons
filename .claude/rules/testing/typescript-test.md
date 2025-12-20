---
paths:
  - "**/*.spec.ts"
  - "**/*.test.ts"
  - "**/*.spec.tsx"
  - "**/*.test.tsx"
---

# TypeScript Testing Standards

## File Naming

Format: `{target-file-name}.spec.ts`

Example: `user.service.ts` → `user.service.spec.ts`

## Test Framework

Use Vitest. Maintain consistency within the project.

## Structure

Group methods/functionality with `describe`, write individual cases with `it`. Can classify scenarios with nested `describe`.

## Mocking

Utilize Vitest's `vi.mock()`, `vi.spyOn()`. Mock external modules at the top level; change behavior per test with `mockReturnValue`, `mockImplementation`.

## Async Testing

Use `async/await`. Test Promise rejection with `await expect(fn()).rejects.toThrow()` form.

## Setup/Teardown

Use `beforeEach`, `afterEach` for common setup/cleanup. Use `beforeAll`, `afterAll` only for heavy initialization (DB connection, etc.).

## Type Safety

Type check test code too. Minimize `as any` or `@ts-ignore`. Use type guards or type assertions explicitly when needed.

## Test Utils Location

For single-file use, place at bottom of same file. For multi-file sharing, use `__tests__/utils` or `test-utils` directory.

## Coverage

Code coverage is a reference metric. Focus on meaningful test coverage rather than blindly pursuing 100%.
