# Testing Core Principles

## Test File Structure

One-to-one matching with the file under test. Test files should be located in the same directory as the target file.

## Test Hierarchy

Organize by method (function) unit as major sections, and by test case as minor sections. Complex methods can have intermediate sections by scenario.

## Test Coverage Selection

Omit obvious or overly simple logic (simple getters, constant returns). Prioritize testing business logic, conditional branches, and code with external dependencies.

## AI Test Generation Guidance

AI tends to generate high-coverage but low-insight tests. Apply these constraints:

- **Skip trivial tests**: No tests for simple getters, setters, or pass-through functions
- **Focus AI on high-value areas**: Boundary values, error paths, race conditions, integration points
- **Avoid test bloat**: Each test must provide unique insight not covered by other tests
- **Question AI suggestions**: If AI suggests testing obvious happy paths, request edge cases instead

## Test Case Composition

At least one basic success case is required. Focus primarily on failure cases, boundary values, edge cases, and exception scenarios.

## Test Independence

Each test should be executable independently. No test execution order dependencies. Initialize shared state for each test.

## Given-When-Then Pattern

Structure test code in three stages—Given (setup), When (execution), Then (assertion). Separate stages with comments or blank lines for complex tests.

## Test Data

Use hardcoded meaningful values. Avoid random data as it causes unreproducible failures. Fix seeds if necessary.

## Mocking Principles

Mock external dependencies (API, DB, file system). For modules within the same project, prefer actual usage; mock only when complexity is high.

## Test Reusability

Extract repeated mocking setups, fixtures, and helper functions into common utilities. Be careful not to harm test readability through excessive abstraction.

## Integration/E2E Testing

Unit tests are the priority. Write integration/E2E tests when complex flows or multi-module interactions are difficult to understand from code alone. Place in separate directories (`tests/integration`, `tests/e2e`).

## Test Naming

Test names should clearly express "what is being tested". Recommended format: "should do X when Y". Focus on behavior rather than implementation details.

## Assertion Count

Multiple related assertions in one test are acceptable, but separate tests when validating different concepts.
