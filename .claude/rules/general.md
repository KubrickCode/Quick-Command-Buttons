# General Rules

## Dependencies

AI tends to use version ranges by default, causing non-reproducible builds.

- Exact versions only - forbid version ranges
  - e.g., `lodash@4.17.21`, `github.com/pkg/errors v0.9.1`
  - Forbid: `^1.0.0`, `~1.0.0`, `>=1.0.0`, `latest`, etc.
- Detect package manager from lock file
- CI must use frozen mode (e.g., `--frozen-lockfile`)
- Prefer task runner commands (just, make) when available

## Naming

AI tends to use vague, generic verbs that obscure what code actually does.

- Clear purpose while being concise
- Forbid abbreviations outside industry standards (id, api, db, err, etc.)
- Don't repeat context from parent scope
- Boolean: `is`, `has`, `should` prefix
- Function names: verbs or verb+noun forms
- Banned verbs: `process`, `handle`, `manage`, `do`, `execute`, etc.
  - Use domain-specific verbs: `validate`, `transform`, `parse`, `dispatch`, `route`, etc.
  - Exception: Event handlers (`onClick`, `handleSubmit`)
- Collections: `users` (array/slice), `userList` (wrapped), `userSet` (specific)
- Field order: alphabetically by default

## Error Handling

AI tends to generate catch-all handlers that silently swallow errors.

- Handle errors where meaningful response is possible
- Error messages: technical details for logs, actionable guidance for users
- Distinguish expected vs unexpected errors
- Add context when propagating errors up the call stack
- Never silently ignore errors
  - Bad: `catch(e) {}`, `if err != nil { return nil }`, etc.
  - Good: Log with context + propagate or recover with fallback
- Create custom error types for domain-specific failures
- Always handle async errors (Promise rejection, etc.)

## Comments

Comments explaining WHAT code does become stale; code should be self-documenting.

- Write only:
  - WHY: Business rules, external constraints, counter-intuitive decisions
  - Constraints: `// Constraint: Must complete within 100ms`
  - Intent: `// Goal: Minimize database round-trips`
  - Side Effects: `// Side effect: Sends email notification`
  - Anti-patterns: `// Intentionally sequential - parallel breaks idempotency`
- Never: WHAT explanations, code narration, section dividers, commented-out code, etc.
- If code needs a WHAT comment, fix the code instead (rename, extract function)

## Code Structure

- One function, one responsibility
  - "and/or" in function name → split into separate functions
  - Multiple test cases per if branch → split
- Max nesting: 2 levels (use early return/guard clause)
- Make side effects explicit in function name
- Magic numbers/strings → named constants
- Function order: by call order (top-to-bottom)
- No code duplication - modularize similar patterns
  - Same file → extract function
  - Multiple files → separate module
  - Multiple projects → separate package
- Use well-tested external libraries for complex logic (security, crypto, etc.)

## Workflow

- Never auto-create branch/commit/push - always ask user
- Gather context first
  - Read related files before working
  - Check existing patterns and conventions
  - Don't guess file paths - use search tools
  - Don't guess API contracts - read actual code
- Scope management
  - Assess issue size accurately
  - Avoid over-engineering simple tasks
- Update CLAUDE.md/README.md for major changes only
- If AI repeats same mistake, add explicit ban to CLAUDE.md
- Clean up background processes (dev servers, watchers) after use
- Follow project language convention for all generated content
