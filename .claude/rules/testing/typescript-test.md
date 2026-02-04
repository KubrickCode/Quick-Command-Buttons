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

Use nested `describe` blocks to provide domain context. The suite hierarchy is the strongest structural signal.

```typescript
// Good: Domain > Feature > Scenario hierarchy
describe('AuthService', () => {
  describe('Login', () => {
    it('should authenticate with valid credentials', () => { ... })
    it('should reject invalid password', () => { ... })
  })
  describe('Token', () => {
    it('should refresh expired token', () => { ... })
  })
})

// Bad: Flat structure, no context
test('login works', () => { ... })
test('logout works', () => { ... })
```

## Imports

Import actual domain modules under test. Import statements are the strongest signal for understanding test purpose.

```typescript
// Good: Clear domain imports
import { OrderService } from "@/modules/order";
import { PaymentValidator } from "@/validators/payment";

// Bad: Only test utilities, no domain context
import { render } from "@/test-utils";
```

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
