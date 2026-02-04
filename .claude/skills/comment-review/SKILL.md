---
name: comment-review
description: Review comments and suggest cleanup (identify unnecessary comments, recommend improvements). Use to aggressively clean up comment debt in code.
disable-model-invocation: true
---

# Comment Review Command

## Purpose

Aggressively identify and remove unnecessary comments. Code must speak for itself.

**Core Principle**: If code needs a comment, the code is wrong. Fix the code first.

**Default Stance**: When in doubt, REMOVE. Comments are technical debt.

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

### 🚫 The Comment Problem

- **Comments rot**: Code changes, comments don't. Result: lies in your codebase.
- **Comments mask bad code**: If you need a comment, your code naming or structure is wrong.
- **Comments are maintenance burden**: Every comment is code you must keep synchronized.

**Rule of thumb**: If you're writing a comment, pause and ask "How can I eliminate this with better code?"

### ✅ The ONLY Legitimate Comments

These are the **exclusive** cases where comments are allowed. Everything else MUST be removed or refactored.

| Category                          | Strict Criteria                                           | Valid Examples                                                                     |
| --------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Public API Docs**               | External-facing APIs ONLY. Private code = no docs needed. | `@param userId - The unique identifier` (but NOT for internal helper functions)    |
| **Business Logic WHY**            | ONLY when domain knowledge is truly external to code      | "Due to GDPR Article 17, data must be retained for 7 years"                        |
| **External Dependencies**         | Third-party API constraints NOT under your control        | "Stripe webhook retries 3 times with exponential backoff" (cite documentation URL) |
| **Performance/Security Warnings** | Counter-intuitive decisions that would surprise reviewers | "Intentionally O(n²) - n never exceeds 5 per domain requirements"                  |
| **Complex Patterns**              | ONLY when pattern itself is inherently cryptic (rare)     | Regex breakdown - but first try to simplify the regex itself                       |
| **Legal/License**                 | Copyright headers, license attribution                    | "MIT License", "Patent US1234567" (required by law)                                |
| **TODO/FIXME**                    | Must have: owner, ticket, deadline or removal condition   | `// TODO(@username): #1234 Remove after Q2 migration completes`                    |

---

## Classification Criteria

### ❌ REMOVE (Delete Immediately)

**Default assumption**: Every comment should be REMOVED unless it strictly matches a legitimate case above.

| Type                     | Example                                  | Why It's Wrong                   | Fix                                           |
| ------------------------ | ---------------------------------------- | -------------------------------- | --------------------------------------------- |
| **Code flow narration**  | `// loop through users`                  | Code already says this           | DELETE - `for (const user of users)` is clear |
| **Obvious explanation**  | `// increment counter` above `counter++` | Insults reader's intelligence    | DELETE                                        |
| **Name compensation**    | `// get user data` above `getData()`     | Function name is wrong           | Rename to `getUserData()`, DELETE comment     |
| **WHAT instead of WHY**  | `// validates email format`              | Function name should convey this | Rename to `isValidEmailFormat()`, DELETE      |
| **Closing brace labels** | `} // end if`                            | Indentation shows structure      | DELETE - proper formatting makes this obvious |
| **Section dividers**     | `// ===== Validation =====`              | Signals function is too large    | Extract to separate function, DELETE divider  |
| **Commented-out code**   | `// oldFunction()`                       | Git history exists for a reason  | DELETE - use `git log` if you need old code   |
| **Outdated/lying**       | Comment contradicts actual code          | Dangerous misinformation         | DELETE IMMEDIATELY - this causes bugs         |

**Aggressive Rule**: If a comment explains **WHAT** the code does (as opposed to **WHY**), it must be REMOVED.

### ⚠️ IMPROVE (Needs Refactoring)

| Type                         | Problem                           | Required Action                                     |
| ---------------------------- | --------------------------------- | --------------------------------------------------- |
| **Unclear TODO**             | `// TODO: fix later`              | **MANDATORY**: Add owner, ticket, condition         |
| **WHAT explanation**         | `// Validates user input`         | Rename function to `validateUserInput()`, DELETE    |
| **Verbose explanation**      | Multi-paragraph comment block     | Extract to documentation file, link in code comment |
| **Scattered business logic** | Same rule duplicated across files | Consolidate to ONE place, reference via naming      |

### ✅ KEEP (Legitimately Required)

**Strict criteria** - ALL of these must be true:

- ✅ Matches ONE of the legitimate categories above
- ✅ Explains WHY, not WHAT
- ✅ Cannot be expressed through code alone
- ✅ Concise (ideally one line, max 3 lines)
- ✅ Synchronized with code (verified accurate)
- ✅ Single source of truth (not duplicated elsewhere)

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

### 3. Classify with Aggressive Bias

```
For each comment:
  1. Does it match EXACTLY one of the 7 legitimate categories?
     NO → REMOVE

  2. Can the information be expressed through better code?
     YES → REMOVE (suggest refactoring)

  3. Does it explain WHAT instead of WHY?
     YES → REMOVE

  4. ALL checks passed?
     → KEEP (but verify it's truly necessary)
```

---

## Output Format

### For Individual Files / Changes (Direct Action)

```markdown
## Comment Review: {file_path}

### ❌ REMOVE Immediately ({count})

**Line {n}**: `{comment}`
**Why**: {brief reason}
**Action**: DELETED

### ⚠️ IMPROVE or Remove ({count})

**Line {n}**: `{comment}`
**Problem**: {issue}
**Options**:

1. Refactor to `{better_code}` and DELETE comment
2. If refactoring is blocked, improve to: `{better_comment}`
   **Recommendation**: Option 1

### ✅ KEEP ({count})

**Line {n}**: `{comment}` - External API constraint, properly documented
```

---

## Meta-Principle: Code Quality Over Politeness

**Your role**: Enforce high standards. Be direct, assertive, and uncompromising.

- Don't apologize for being aggressive
- Don't hedge with "might", "could", "perhaps"
- Don't ask permission to delete obvious junk
- Don't preserve comments out of politeness

**Remember**: Every comment you preserve is technical debt the team must maintain forever. Be ruthless.
