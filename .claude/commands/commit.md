---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*)
description: Generate concise commit messages in both Korean and English - you choose one to use
---

# Smart Git Commit Message Generator

Generate commit messages in both Korean and English. **You will choose one version to use for your commit.**

## Current Repository State

- Git status: !git status --porcelain
- Current branch: !git branch --show-current
- Staged changes: !git diff --cached --stat
- Unstaged changes: !git diff --stat
- Recent commits: !git log --oneline -10

## What This Command Does

1. Checks current branch name to detect issue number (e.g., develop/shlee/32 → #32)
2. Checks which files are staged with git status
3. Performs a git diff to understand what changes will be committed
4. Generates concise commit messages in both Korean and English
5. Adds "fix #N" at the end if branch name ends with a number
6. **You pick one version** (Korean or English) and copy it to use with `git commit`

## Commit Message Format Guidelines

Keep it simple and concise. Use appropriate format based on complexity:

### Very Simple Changes

```
Title only
```

### Simple Changes

```
Title

Brief description of problem and solution in one or two lines
```

### Standard Changes

```
Title

Brief context about the problem

- Solution point 1
- Solution point 2
```

### Complex Changes (rarely needed)

```
Title

- Problem
  - Problem aspect 1
  - Problem aspect 2
- Solution
  - Solution approach 1
  - Solution approach 2
```

**Important formatting rules:**

- First line (title): Concise summary in imperative mood (under 72 characters)
- No indentation before top-level bullet points
- Use nested bullets only when absolutely necessary for complex changes
- Keep descriptions concise - avoid verbose explanations
- If branch name ends with number (e.g., develop/32, develop/shlee/32), add "fix #N" at the end

## Examples

### Very Simple

```
Fix typo in README
```

### Simple

```
Add user login validation

Prevent empty username/password submissions
```

### Standard

```
Improve database query performance

Query was timing out with large datasets

- Add index on user_id and created_at columns
- Implement query result caching for 5 minutes

fix #32
```

### Complex (rare)

```
Refactor authentication system

- Problem
  - Sessions not persisting across server restarts
  - No mechanism for token refresh
- Solution
  - Implement Redis-based session storage
  - Add JWT refresh token flow with 7-day expiration
```

## Output Format

The command will provide:

1. Analysis of the staged changes (or all changes if nothing is staged)
2. **Korean version** of the commit message (ready to copy)
3. **English version** of the commit message (ready to copy)
4. **Choose one version** and use it with `git commit -m "..."`

## Important Notes

- This command ONLY generates commit messages - it never performs actual commits
- **Two versions are provided, but you only use ONE for your commit**
- Keep messages concise - don't over-explain what's obvious from the code
- Use the simplest format that adequately describes the change
- Branch issue numbers (e.g., develop/32) will automatically append "fix #N"
- You must manually execute `git commit` with your chosen message version
