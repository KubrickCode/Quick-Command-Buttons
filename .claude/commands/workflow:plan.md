---
description: Generate implementation plan with commit-level tasks
---

# Issue Planning Command

---

## Outline

1. **Check Prerequisites**:
   - Verify `docs/work/WORK-{name}/analysis.md` exists
   - If not, ERROR: "Run /analyze-issue first"

2. **Load Analysis Document**:
   - Extract selected approach and completion criteria from analysis.md

3. **Reference Skills**:
   - Check `.claude/skills/` frontmatter
   - Identify coding principles (e.g., TypeScript - use type, forbid interface)

4. **Identify Impact Scope**:
   - List approximate classes/modules (not specific file names)

5. **Decompose Commits** (Vertical Slicing):
   - Each commit should be independently deployable
   - **Forbid Horizontal Slicing**: Don't separate types/logic/tests/UI into separate commits
   - **Vertical Slicing**: Each commit includes types+logic+tests to provide complete functionality
   - Order: Setup → Core → Integration → Polish
   - Specify verification method and "independently deployable" status for each commit

6. **Review Principle Violations**:
   - Create Complexity Tracking table if Skills principle violations are necessary

7. **Write Document**:
   - Create `docs/work/WORK-{name}/plan.md`

---

## Key Rules

### 📝 Documentation Language

**CRITICAL**: All documents you generate (`plan.md`) **MUST be written in Korean**.

### ✅ Must Do

- Checklist-focused
- Reference analysis.md only (no repetition)
- **Vertical Slicing**: Each commit independently deployable
- Reflect Skills principles
- Impact scope approximate only

### ❌ Must Not Do

- Redefine problem (it's in analysis.md)
- List specific file names
- Verbose explanations

### 🎯 Vertical Slicing Principles (CRITICAL)

**Each commit must satisfy**:

1. **Build Success**: No compilation errors
2. **Preserve Existing Features**: Pass existing tests
3. **Independently Testable**: Can be tested with this commit alone
4. **Meaningful Value**: Provides real value to users/developers

**❌ Horizontal Slicing Forbidden**:

- Separating types only → logic only → tests only → UI only (X)
- This separation makes each commit functionally incomplete

**✅ Vertical Slicing Example**:

- Commit 1: types + logic + tests + schema (usable with manual config)
- Commit 2: UI integration (complete UX)

### 📊 Phase Structure

- **Phase 1**: Setup
- **Phase 2**: Foundational
- **Phase 3+**: User Stories (we call them Core features)
- **Final Phase**: Polish

→ We apply as Commit order

---

## Document Template

File to create: `docs/work/WORK-{task-name}/plan.md`

```markdown
# [Task Name] - Implementation Plan

> **Analysis Result**: See `analysis.md`
> **Selected Approach**: [Approach N]

## 📁 Impact Scope (Approximate)

**Main Areas**: [StatusBarManager, ConfigManager, etc.]

---

## 📝 Commit Plan

### ✅ Commit 1: [Title]

**Goal**: [1 sentence - describe complete value provided by this commit]

**Task Checklist**:

- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] Test: [Test content]
- [ ] Build verification: [Build command]

**Verification Method**:

1. [Specific verification method]
2. [User scenario]

**Independently Deployable**: ✅ / ⚠️ [Reason]

---

### ⬜ Commit 2: [Title]

**Goal**: [1 sentence - describe complete value provided by this commit]

**Task Checklist**:

- [ ] [Specific task 1]
- [ ] [Specific task 2]
- [ ] Test: [Test content]
- [ ] Build verification: [Build command]

**Verification Method**:

1. [Specific verification method]
2. [User scenario]

**Independently Deployable**: ✅ / ⚠️ [Reason]

---

## ⚠️ Principle Violation Justification (Only if needed)

| Violation | Why Necessary                | Why Simple Alternative Rejected |
| --------- | ---------------------------- | ------------------------------- |
| Using any | VS Code API types incomplete | Cost to fix @types > benefit    |

---

## 📊 Progress

- [ ] Commit 1
- [ ] Commit 2
```

---

## Execution

Now start the task according to the guidelines above.
