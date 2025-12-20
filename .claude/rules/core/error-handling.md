# Error Handling

## Core Principles

- Error handling level: Handle where meaningful response is possible
- Error messages: Technical details for logs, actionable guidance for users
- Error classification: Distinguish between expected and unexpected errors
- Error propagation: Add context when propagating up the call stack
- Recovery vs. fast fail: Recover from expected errors with fallback

## Error Types

- For domain-specific failures, create custom error classes extending `Error`
- Never throw non-Error objects
- Use sentinel errors for expected conditions that callers must handle

## Async Errors

- Always handle Promise rejection
- Use try-catch for async/await
- Use .catch() for promise chains
