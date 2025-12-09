---
description: Review comments and suggest cleanup (identify unnecessary comments, recommend improvements)
---

# Comment Review Command

## Purpose

Review comment quality and suggest cleanup directions.

**Core Principle**: Code should be self-explanatory. Comments are the last resort.

---

## User Input

```text
$ARGUMENTS
```

**Interpretation Priority**:

1. If $ARGUMENTS provided → Follow user's request (file path, `--all` for entire project, etc.)
2. If empty → Check `git status` for uncommitted changes
3. If no changes → Review latest commit
4. Only review entire project when explicitly requested (`--all` or "review entire codebase")

---

## Comment Principles

### 🚫 Why Avoid Comments

- Comments become lies when code changes but comments don't
- May signal compensating for bad naming
- Most cases can be solved by improving code itself

### ✅ Legitimate Comment Cases

| Category                          | Description                              | Examples                                                          |
| --------------------------------- | ---------------------------------------- | ----------------------------------------------------------------- |
| **Public API Docs**               | JSDoc, TSDoc, GoDoc                      | `@param`, `@returns`, `@throws`                                   |
| **Business Logic WHY**            | Domain knowledge not expressible in code | "Due to regulatory requirements...", "Per customer request..."    |
| **External Dependencies**         | API limits, policies, quirks             | "Stripe API returns max 100 items", "Due to CORS restrictions..." |
| **Performance/Security Warnings** | Intentional technical decisions          | "O(n²) but n < 10 guaranteed", "SQL injection prevention"         |
| **Complex Patterns**              | Regex, algorithm intent                  | Regex part explanations, algorithm choice reasoning               |
| **Legal/License**                 | Copyright, patents                       | "MIT License", "Based on Apache algorithm"                        |
| **TODO/FIXME**                    | Must include context                     | `// TODO(username): #123 remove after migration`                  |

### ⚠️ Business Logic Comment Rules

**Cohesion Principle**: Same business logic explanation should exist in **ONE place only**.

- ❌ Scattered: Same rule repeated across multiple files
- ✅ Cohesive: Documented once in core domain module

---

## Classification Criteria

### ❌ REMOVE (Recommend Deletion)

| Type                  | Example                                  | Reason                    |
| --------------------- | ---------------------------------------- | ------------------------- |
| Obvious explanation   | `// increment counter` above `counter++` | Code already explains     |
| Name compensation     | `// get user data` above `getData()`     | Rename to `getUserData()` |
| Commented-out code    | `// oldFunction()`                       | Use Git history           |
| Section dividers      | `// ===== Validation =====`              | Extract function instead  |
| Type duplication      | `// returns string` (TypeScript)         | Type system explains      |
| Outdated/lying        | Doesn't match code                       | Maintenance hazard        |
| Closing brace comment | `} // end if`                            | Indentation is sufficient |

### ⚠️ IMPROVE (Needs Improvement)

| Type                        | Problem                      | Improvement Direction                     |
| --------------------------- | ---------------------------- | ----------------------------------------- |
| Unclear TODO                | `// TODO: fix later`         | `// TODO(user): #ticket specific details` |
| WHAT explanation            | "Validates user"             | Explain WHY: "Due to security policy..."  |
| Verbose comment             | Paragraph-level explanation  | Keep concise                              |
| Non-standard docs           | Plain comment for API        | Use JSDoc/TSDoc/GoDoc format              |
| Scattered business comments | Same rule in multiple places | Consolidate to one place                  |

### ✅ KEEP (Maintain)

Matches legitimate comment cases AND:

- Concise and clear
- Synchronized with code
- Explains WHY
- Properly colocated

---

## Workflow

### 1. Determine Analysis Target

```bash
git status --porcelain
```

**Decision Tree**:

1. $ARGUMENTS has specific request → Honor it
2. $ARGUMENTS empty + uncommitted changes exist → Analyze changed files via `git diff`
3. $ARGUMENTS empty + no changes → Analyze latest commit via `git show HEAD`
4. User explicitly requests entire project (`--all`) → Full project scan

### 2. Extract Comments

**Language-specific patterns**:

- TypeScript/JavaScript: `//`, `/* */`, `/** */`
- Go: `//`, `/* */`
- Python: `#`, `""" """`
- HTML/JSX: `{/* */}`, `<!-- -->`

**Include with each comment**:

- Comment content
- File path:line number
- Surrounding code context (±3 lines)

### 3. Classify and Analyze

For each comment:

1. Classification (REMOVE / IMPROVE / KEEP)
2. Reasoning
3. Refactoring suggestion (if applicable)

### 4. Action Decision

| Situation                                                   | Action                                                      |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| **Obvious removals** (commented code, trivial explanations) | Fix immediately without asking                              |
| **Needs discussion** (unclear intent, judgment required)    | Suggest in conversation                                     |
| **Entire project review**                                   | Generate formal report with Refactoring Suggestions section |

---

## Output Format

### For Individual Files / Changes (Conversational)

Provide feedback directly in conversation:

- List issues found with file:line references
- Explain reasoning briefly
- Apply obvious fixes immediately
- Suggest improvements for discussion

### For Entire Project Review (Formal Report)

Generate only when reviewing entire project (`--all`):

```markdown
# 📝 Comment Review Report

**Generated**: {timestamp}
**Scope**: Entire Project
**Total Comments Analyzed**: {count}

---

## 📊 Summary

| Category   | Count | Percentage |
| ---------- | ----- | ---------- |
| ❌ REMOVE  | {n}   | {%}        |
| ⚠️ IMPROVE | {n}   | {%}        |
| ✅ KEEP    | {n}   | {%}        |

---

## ❌ REMOVE - Recommend Deletion ({count})

### 1. {file_path}:{line}

... details ...

---

## ⚠️ IMPROVE - Needs Improvement ({count})

### 1. {file_path}:{line}

... details ...

---

## ✅ KEEP - Maintain ({count})

Brief list of legitimate comments found.

---

## 🔧 Refactoring Suggestions

### Extract Function

... suggestions ...

### Rename

... suggestions ...

---

## 📋 Action Checklist

- [ ] Remove {n} unnecessary comments
- [ ] Improve {n} comments
- [ ] Apply {n} refactorings
```

---

## Execution Instructions

1. **Parse Input**: Interpret $ARGUMENTS
2. **Determine Scope**:
   - User request → Follow it
   - Empty → Check `git status --porcelain`
   - Changes exist → Use `git diff` for changed files
   - No changes → Use `git show HEAD` for latest commit
3. **Extract Comments**: Search for comment patterns in target files
4. **Classify**: Apply classification criteria
5. **Take Action**:
   - Obvious issues → Fix immediately
   - Unclear cases → Suggest in conversation
   - Entire project → Generate formal report
6. **Language Standards**: Consider JSDoc, TSDoc, GoDoc conventions
7. **Public API**: Recommend keeping documentation comments

---

## Example Usage

```bash
# Review specific file
/comment-review src/utils/parser.ts

# Review current changes (default behavior)
/comment-review

# Review latest commit explicitly
/comment-review --last-commit

# Review entire project (generates formal report)
/comment-review --all
```
