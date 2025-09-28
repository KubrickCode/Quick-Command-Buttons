---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*)
argument-hint: [ko|en] [message]
description: Generate clear and descriptive commit messages in Korean or English without conventional prefixes
---

# Smart Git Commit Message Generator

Generate clear commit message in specified language: $ARGUMENTS

**Language:** Use `ko` for Korean, `en` for English (default)

## Current Repository State

- Git status: !git status --porcelain
- Current branch: !git branch --show-current
- Staged changes: !git diff --cached --stat
- Unstaged changes: !git diff --stat
- Recent commits: !git log --oneline -10

## What This Command Does

1. Checks which files are staged with git status
2. Performs a git diff to understand what changes will be committed
3. Analyzes the diff to determine if multiple distinct logical changes are present
4. If multiple distinct changes are detected, suggests breaking into multiple smaller commits
5. For each suggested commit, creates a clear and descriptive message
6. Presents the final commit message(s) for you to use manually

## Best Practices for Clear Commit History

- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Split large changes**: If changes touch multiple concerns, split them into separate commits
- **Clear descriptions**: Write commit messages that explain what changed and why
- **Present tense, imperative mood**: Write commit messages as commands (e.g., "Add feature" not "Added feature")
- **Concise first line**: Keep the first line under 72 characters
- **Add context when needed**: Include a blank line and then more detailed explanation if necessary
- **Focus on the "why"**: The diff shows what changed, the message should explain why

## Guidelines for Splitting Commits

When analyzing the diff, consider splitting commits based on these criteria:

1. **Different concerns**: Changes to unrelated parts of the codebase
2. **Different purposes**: Mixing new features, bug fixes, refactoring, etc.
3. **File patterns**: Changes to different types of files (e.g., source code vs documentation)
4. **Logical grouping**: Changes that would be easier to understand or review separately
5. **Size**: Very large changes that would be clearer if broken down

## Examples of Clear Commit Messages

Good commit messages without prefixes:

- Add user authentication system with JWT tokens
- Fix memory leak in rendering process when handling large datasets
- Update API documentation with new endpoints and examples
- Simplify error handling logic in parser module
- Remove deprecated legacy code from v1 API
- Improve form accessibility for screen readers
- Add input validation for user registration
- Strengthen password requirements for authentication
- Reorganize component structure for better maintainability
- Implement transaction validation business logic
- Add unit tests for new user service features
- Update dependencies to patch security vulnerabilities

Example of splitting commits with clear messages:

- First commit: Add TypeScript definitions for Solc 0.8.20
- Second commit: Update documentation for new Solc version support
- Third commit: Upgrade build dependencies to latest versions
- Fourth commit: Add API endpoint for contract verification
- Fifth commit: Implement parallel processing for compilation tasks
- Sixth commit: Add comprehensive test coverage for new features
- Seventh commit: Fix security vulnerabilities in authentication flow

## Multi-line Commit Message Example

```
Refactor authentication system for better security

- Replace MD5 hashing with bcrypt for passwords
- Add rate limiting to prevent brute force attacks
- Implement session timeout after 30 minutes of inactivity
- Update all related unit and integration tests

This change addresses the security audit findings from Q3 2024
and brings our auth system in line with OWASP recommendations.
```

## Output Format

The command will provide you with:

1. Analysis of staged changes (or all changes if nothing is staged)
2. Suggested commit structure (single or multiple commits)
3. Ready-to-use commit message(s) that you can copy and use with `git commit -m`
4. If multiple commits are suggested, instructions on how to stage files separately

## Important Notes

- This command only generates commit messages, it does not perform the actual commit
- You can review and modify the suggested messages before committing
- If no files are staged, it will analyze all modified and new files
- The commit message will be constructed based on the actual changes detected
- Focus is on clarity and providing useful context for future developers
