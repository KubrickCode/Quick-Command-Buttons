---
allowed-tools: Bash(gh:*), mcp__github__*
description: Review GitHub Pull Request and analyze unresolved review comments
argument-hint: [PR-URL]
---

# GitHub Pull Request Review Assistant

Review the Pull Request at the provided URL and analyze unresolved review comments to provide comprehensive code review feedback.

## PR Information

**PR URL**: $1

Fetch the PR details using GitHub CLI:

- PR metadata: !gh pr view "$1" --json number,title,author,state,isDraft,reviews,comments,files
- Unresolved review comments: !gh api "$(echo "$1" | sed -E 's#https://github.com/([^/]+)/([^/]+)/pull/([0-9]+).*#repos/\1/\2/pulls/\3/comments#')" --jq '.[] | select(.position != null) | {path, line: .position, body, user: .user.login, resolved: .resolved}'

## Task Instructions

1. **Fetch PR Details**
   - Extract owner, repo, and PR number from the URL
   - Use `gh pr view` to get basic PR information
   - Use `gh api` to fetch review comments with resolved status
   - Filter to show only unresolved comments (where `resolved: false` or null)

2. **Analyze Code Changes**
   - For each unresolved comment, understand the context
   - Fetch the relevant code sections using `gh pr diff`
   - Identify files and line numbers mentioned in comments

3. **Review Criteria**

   Apply appropriate guidelines from `.claude/skills` directory based on the project's language and framework. Automatically detect and reference relevant skills.

   Focus on:
   - **Coding Style**: Consistency, readability, naming conventions
   - **Architecture**: Design patterns, separation of concerns, modularity
   - **Side Effects**: Unintended consequences, race conditions, state mutations
   - **Potential Bugs**: Edge cases, error handling, null/undefined checks

4. **Provide Review Feedback & Apply Fixes**

   For each unresolved comment:
   - **Comment Context**: Quote the original review comment
   - **File & Location**: `filepath:line_number`
   - **Code Analysis**: Examine the relevant code section
   - **Assessment**:
     - Is the concern valid?
     - What are the implications?
     - What's the recommended solution?
   - **Decision**:
     - If the concern is valid and the fix is straightforward: **IMMEDIATELY APPLY THE FIX** using Edit/Write tools
     - If the concern requires discussion or design decisions: **ASK USER** for clarification before making changes
   - **Alternative Approaches**: If applicable, suggest better implementations
   - **Skill References**: Cite relevant guidelines from skills when explaining fixes

5. **Summary**

   Provide an overall assessment:
   - Number of unresolved comments reviewed
   - Number of issues automatically fixed
   - Issues requiring user discussion (if any)
   - Remaining issues that need attention
   - Overall PR quality assessment

## Output Format

```markdown
# PR Review: [PR Title]

**PR**: [PR URL]
**Status**: [open/draft/closed]
**Files Changed**: [count]

## Unresolved Review Comments Analysis & Fixes

### 1. [File Path]:[Line]

**Original Comment by @[username]**:

> [quoted comment]

**Analysis**:
[Your detailed analysis based on review criteria]

**Action Taken**:

- ✅ **Fixed automatically**: [description of fix applied]
- OR
- ⏸️ **Requires discussion**: [reason why user input is needed]

**Relevant Guideline**: [Skill reference if applicable]

---

### 2. [File Path]:[Line]

...

## Overall Assessment

- **Comments Reviewed**: [count]
- **Issues Fixed Automatically**: [count]
- **Issues Requiring Discussion**: [count]
- **Overall Status**: [All issues resolved / Partial / Awaiting user input]

## Additional Observations

[Any other observations about the PR quality, architecture, or patterns used]
```

## Important Notes

- **Private Repositories**: If unable to access with `gh`, the system will attempt to use GitHub MCP tools automatically
- **Resolved Comments**: Ignore any comments marked as resolved
- **Focus**: Only review issues raised in unresolved comments, not the entire PR
- **Skills**: Automatically detect project language/framework and reference appropriate skills
- **Auto-Fix**: Automatically apply fixes for straightforward issues without asking
- **User Consultation**: Only ask user when the fix involves:
  - Architectural or design decisions
  - Multiple valid approaches
  - Potential breaking changes
  - Ambiguous requirements

## Example Usage

```bash
/review-pr https://github.com/owner/repo/pull/123
```

The command will analyze all unresolved review comments on PR #123 and provide detailed feedback based on the appropriate coding guidelines from the skills directory.
