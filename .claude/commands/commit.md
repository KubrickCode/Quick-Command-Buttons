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
6. **Saves to commit_message.md file for easy copying**

## Commit Message Format Guidelines

**Core Principle: Focus on what problem was solved rather than what was done**

**Title Writing Principle: Prioritize user-facing problems**

- ❌ "Fix empty login form submission error" (code perspective)
- ✅ "Fix login button not responding to clicks" (user perspective)
- ❌ "Handle null pointer exception" (technical perspective)
- ✅ "Fix app crash when accessing profile page" (user perspective)

Keep it simple and concise. Use appropriate format based on complexity:

### Very Simple Changes

```
[Problem description] Title
```

### Simple Changes

```
[Problem description] Title

What problem occurred and how it was resolved in one or two lines
```

### Standard Changes

```
[Problem description] Title

Description of the problem that occurred
(Brief reproduction steps if applicable)

How it was solved and the reasoning behind the solution
```

### Complex Changes (rarely needed)

```
[Problem description] Title

Problem:
- Specific problem description
- Reproduction steps (brief if available)

Solution:
- Approach taken and why that method was chosen
- Additional solutions applied and their rationale
```

**Important formatting rules:**

- First line (title): Clearly express the user-facing problem
- Prefer user perspective > code/technical perspective when possible
- Except for very simple cases, don't just list changes - explain with sentences
- Include reasoning and justification when explaining solutions
- Keep descriptions concise - avoid verbose explanations
- If branch name ends with number (e.g., develop/32, develop/shlee/32), add "fix #N" at the end
- **When multiple changes/reasons exist, use bullet points (-) for better readability**

## Examples

### Very Simple

```
Fix typo in README
```

### Simple

```
Fix login button not responding with empty fields

Login attempts with empty input fields showed no response
Added client-side validation and error message display
```

**For multiple changes/reasons, use list format:**

```
Backend architect agent role redefinition

- Changed focus from API design to system structure design
- Modified to concentrate on domain modeling, layered architecture, and modularization strategy
```

### Standard

```
Fix user list page failing to load

User list page showed continuous loading spinner with 1000+ users
(Reproduction: User List > View All click)

Added composite database index and Redis caching to reduce
response time from 30+ seconds to under 2 seconds

fix #32
```

### Complex (rare)

```
Fix users being logged out after service updates

Problem:
- All users forced to log out with each new deployment
- Work in progress lost causing user complaints

Solution:
- Migrated memory sessions to Redis for persistence across deployments
- Implemented JWT refresh tokens for automatic re-authentication to provide seamless service
```

## Output Format

The command will provide:

1. Analysis of the staged changes (or all changes if nothing is staged)
2. **Creates commit_message.md file** containing both Korean and English versions
3. Copy your preferred version from the file

## Important Notes

- This command ONLY generates commit messages - it never performs actual commits
- **commit_message.md file contains both versions** - choose the one you prefer
- **Focus on the problem** - don't just list changes
- Explain solutions with **why you did it that way**
- Keep messages concise - don't over-explain what's obvious from the code
- Branch issue numbers (e.g., develop/32) will automatically append "fix #N"
- Copy message from generated file and manually execute `git commit`
