---
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git branch:*), Write
description: Generate Conventional Commits-compliant messages (feat/fix/docs/chore) in Korean and English
---

# Conventional Commits Message Generator

Generates commit messages following [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification in both Korean and English. **Choose one version for your commit.**

## Repository State Analysis

- Git status: !git status --porcelain
- Current branch: !git branch --show-current
- Staged changes: !git diff --cached --stat
- Unstaged changes: !git diff --stat
- Recent commits: !git log --oneline -10

## What This Command Does

1. Checks current branch name to detect issue number (e.g., develop/shlee/32 → #32)
2. Checks which files are staged with git status
3. Performs a git diff to understand what changes will be committed
4. Generates commit messages in Conventional Commits format in both Korean and English
5. Adds "fix #N" at the end if branch name ends with a number
6. **Saves to commit_message.md file for easy copying**

## Conventional Commits Format (REQUIRED)

```
<type>[(optional scope)]: <description>

[optional body]

[optional footer: fix #N]
```

### Available Types

Analyze staged changes and suggest the most appropriate type:

| Type | When to Use | SemVer Impact |
|------|-------------|---------------|
| **feat** | New feature or capability added | MINOR (0.x.0) |
| **fix** | Bug fix or problem resolution | PATCH (0.0.x) |
| **docs** | Documentation only changes (README, comments, etc.) | None |
| **style** | Code formatting, missing semicolons (no logic change) | None |
| **refactor** | Code restructuring without changing behavior | None |
| **perf** | Performance improvements | PATCH |
| **test** | Adding or fixing tests | None |
| **chore** | Build config, dependencies, tooling updates | None |
| **ci** | CI/CD configuration changes | None |

**BREAKING CHANGE**: MUST use both type! format (exclamation mark after type) AND BREAKING CHANGE: footer with migration guide for major version bump.

Example:
```
feat!: change API response format from JSON to MessagePack

Migrated response format to MessagePack binary for 40% packet size reduction.

BREAKING CHANGE: Client code update required
- Install MessagePack library: npm install msgpack5
- Update response parsing: response.json() → msgpack.decode(response.body)
- Update type definitions: API_RESPONSE_FORMAT constant changed
```

### Type Selection Decision Tree

Analyze git diff output and suggest type based on file patterns:

```
Changed Files → Suggested Type

src/**/*.{ts,js,tsx,jsx} + new functions/classes → feat
src/**/*.{ts,js,tsx,jsx} + bug fix → fix
README.md, docs/**, *.md → docs
package.json, pnpm-lock.yaml, .github/** → chore
**/*.test.{ts,js}, **/*.spec.{ts,js} → test
.github/workflows/** → ci
```

If multiple types apply, prioritize: `feat` > `fix` > other types.

### Confusing Cases: fix vs chore

**Key distinction**: Does it affect **users** or only **developers**?

| Scenario | Type | Reason |
|----------|------|--------|
| Backend GitHub Actions test workflow not running | `chore` | Only affects CI/CD, users don't experience this |
| API returns 500 error for valid requests | `fix` | Users experience error responses |
| Page loading speed improved from 3s to 0.8s | `perf` | Users directly feel the improvement |
| Internal database query optimization (no user impact) | `refactor` | Code improvement, no measurable user benefit |
| Dependency security patch (CVE fix) | `chore` | Build/tooling update |
| App crashes when accessing profile page | `fix` | Users experience crash |

**User perspective priority:**
- ✅ "fix: app crashes when deleting items" (user problem)
- ❌ "fix: null pointer exception in ItemService" (code problem)

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
type: brief description
```

**Example:**
```
docs: fix typo in README
```

### Simple Changes

```
type: problem description

What problem occurred and how it was resolved in one or two lines
```

**Example:**
```
fix: login button not responding with empty fields

Login attempts with empty input fields showed no response
Added client-side validation and error message display
```

**For multiple changes/reasons, use list format:**

```
refactor: backend architect agent role redefinition

- Changed focus from API design to system structure design
- Modified to concentrate on domain modeling, layered architecture, and modularization strategy
```

### Standard Changes

```
type: problem description

Description of the problem that occurred
(Brief reproduction steps if applicable)

How it was solved and the reasoning behind the solution

fix #N
```

**Example:**
```
fix: user list page failing to load

User list page showed continuous loading spinner with 1000+ users
(Reproduction: User List > View All click)

Added composite database index and Redis caching to reduce
response time from 30+ seconds to under 2 seconds

fix #32
```

### Complex Changes (rarely needed)

```
type: problem description

Problem:
- Specific problem description
- Reproduction steps (brief if available)

Solution:
- Approach taken and why that method was chosen
- Additional solutions applied and their rationale

fix #N
```

**Example:**
```
fix: users being logged out after service updates

Problem:
- All users forced to log out with each new deployment
- Work in progress lost causing user complaints

Solution:
- Migrated memory sessions to Redis for persistence across deployments
- Implemented JWT refresh tokens for automatic re-authentication to provide seamless service
```

**Important formatting rules:**

- First line (title): `type: clearly express the user-facing problem`
- description must start with lowercase, no period at end, use imperative mood
- Prefer user perspective > code/technical perspective when possible
- Except for very simple cases, don't just list changes - explain with sentences
- Include reasoning and justification when explaining solutions
- Keep descriptions concise - avoid verbose explanations
- If branch name ends with number (e.g., develop/32, develop/shlee/32), add "fix #N" at the end
- **When multiple changes/reasons exist, use bullet points (-) for better readability**

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
- **Spec compliance**: All messages MUST follow Conventional Commits format
- **Type is mandatory**: No type = invalid commit for semantic-release
- **Case sensitivity**: Types must be lowercase (except `BREAKING CHANGE`)

## Execution Instructions for Claude

1. Run git commands to understand changes (staged or all if none staged)
2. Analyze file patterns and suggest appropriate commit type
3. Determine if scope is needed (e.g., `fix(api):`, `feat(ui):`)
4. Draft commit message following format:
   - Title: `<type>[(scope)]: <user-facing description>`
   - Body: Choose appropriate format based on complexity (very simple/simple/standard/complex)
   - Footer: Auto-add `fix #N` if branch name ends with number
5. Generate both Korean and English versions
6. Write to `/workspaces/ai-config-toolkit/commit_message.md`
7. Present suggested type with reasoning

**Token optimization**: Focus git diff analysis on:
- New/deleted files → likely `feat` or `refactor`
- Modified files in src/ → check if bug fix or feature
- Modified docs/README → `docs`
- Modified package.json → `chore`
