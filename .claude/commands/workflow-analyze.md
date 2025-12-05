---
description: Analyze issue and generate analysis.md with solution approaches
---

# Issue Analysis Command

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Outline

1. **Parse User Input**:
   - Extract task description from $ARGUMENTS
   - Generate task name (2-4 words, English, hyphen-separated)

2. **Reference Skills**:
   - Check `.claude/skills/` frontmatter
   - Reference related skills in detail if available

3. **Define Problem**:
   - Identify current situation, problem to solve, and goals

4. **Investigate Solutions**:
   - Research 2-4 approaches
   - Analyze pros/cons of each approach
   - Evaluate based on Skills principles

5. **Final Selection**:
   - Choose the most appropriate approach
   - Clarify rejection reasons

6. **Generate Questions**:
   - Select **maximum 3** unclear items only
   - Use reasonable defaults + Assumptions for the rest

7. **Write Documents** (Dual Language):
   - Create `docs/work/WORK-{task-name}/analysis.ko.md` (Korean - for user reference)
   - Create `docs/work/WORK-{task-name}/analysis.md` (English - for agent consumption)
   - Use template structure below for both versions

---

## Key Rules

### 📝 Documentation Language

**CRITICAL**: You must generate **TWO versions** of all documents:

1. **Korean version** (`analysis.ko.md`): For user reference - written in Korean
2. **English version** (`analysis.md`): For agent consumption - written in English

**Both versions must contain identical structure and information**, only the language differs.

### 🎯 Balanced Analysis Principles

1. **Problem Definition**: Include concrete scenarios rather than abstract descriptions
2. **Solution Approach**: Consider both user perspective and technical feasibility
3. **Implementation Method**: Keep core changes concise, specify new dependencies
4. **Completion Criteria**: Separate feature verification and technical implementation

### ✅ Must Do

- Conclusion first (Executive Summary)
- **Include concrete scenarios** (Problem Definition) - 1-4 cases depending on issue
- **Explain user impact** (Solution Approach) - How will it be used?
- **Evaluate technical feasibility** (Solution Approach) - Why is it suitable?
- Evaluate solutions based on Skills
- Concise bullet points
- **NEEDS CLARIFICATION maximum 3**
- Use reasonable defaults

### ❌ Must Not Do

- Verbose explanations
- Duplicate content
- **Only abstract problem definitions** (without concrete examples)
- **Excessive technical details** (going into implementation level)
- **Missing user perspective** (talking only about technology)
- Solutions that conflict with Skills principles
- Infinite questions
- **Listing obvious things** (e.g., React state, JSON schema)

### 📋 Clarification Priority

**Priority**: scope > security/privacy > user experience > technical details

### 🎯 Informed Guesses Principles

1. **Make informed guesses**: Use context, industry standards, and common patterns to fill gaps
2. **Document assumptions**: Record reasonable defaults in the Assumptions section
3. **Limit clarifications**: Maximum 3 [NEEDS CLARIFICATION] markers

---

## Document Template

Files to create:

- `docs/work/WORK-{task-name}/analysis.ko.md` (Korean version)
- `docs/work/WORK-{task-name}/analysis.md` (English version)

```markdown
# [Task Name] - Analysis Result

## 🎯 Conclusion (TL;DR)

**Selected Approach**: [Approach Name]
**Key Reason**: [Why this approach was chosen - 1-2 sentences]

---

## 📋 Problem Definition

**Concrete Scenarios** (as needed):

- [Case 1: What problem occurs in what situation]
- [Case 2: Another specific situation]

**Current Problem**: [What is inconvenient or impossible]
**Goal**: [What this task aims to achieve]

---

## 📦 Scope

**Included**:

- [Scope Item 1]
- [Scope Item 2]

**Excluded**:

- [What to explicitly exclude]

---

## 🔍 Solution Investigation

### Approach 1: [Name]

**Method**:

- [How to solve - including user impact and technical method]
- [If needed: How user experiences it]
- [If needed: How to implement technically]

**Pros**:

- [Why it's good - user/technical perspective]

**Cons**:

- [Why it could be problematic]

### Approach 2: [Name]

**Method**:

- [Solution method]

**Pros**:

- [...]

**Cons**:

- [...]

---

## ✅ Final Selection

**Adopted**: Approach N
**Selection Reason**:

- [Why this approach is most suitable]
- [Key benefits and trade-offs]

**Rejected Approaches**:

- Approach X: [Rejection reason]

---

## 🛠️ Implementation Method

**Core Changes**:

- [Change Item 1]
- [Change Item 2]

**New Dependencies**: [None / Name]

---

## ⚙️ Key Considerations

- **Backward Compatibility**: [How to maintain existing behavior]
- **UI Placement**: [Where to place it]
- **Special Cases**: [Edge cases to consider]

---

## 🎯 Completion Criteria

**Feature Verification**:

- [ ] [Scenario 1 verification - actual use case test]
- [ ] [Scenario 2 verification]
- [ ] [Existing feature regression test]

**Technical Implementation**:

- [ ] [Core change implementation]
- [ ] [Required config/schema updates]
- [ ] [Unit test writing]

---

## ❓ Needs Confirmation

**Current Assumptions**:

- [Assumption 1]: [Default value]
- [Assumption 2]: [Default value]

**If Needed**:

- [Items needing additional confirmation - maximum 3]
```

---

## 📚 Good/Bad Examples

### Problem Definition Section

**❌ Bad (Abstract only)**:

```markdown
**Current Situation**: Problem occurs when using feature A
**Problem to Solve**: X is impossible
**Goal**: Make Y possible
```

**✅ Good (Concrete + Abstract)**:

```markdown
**Concrete Scenarios**:

- [Case 1: What problem occurs in specific situation]
- [Case 2: Another real situation]

**Current Problem**: [What is generally impossible]
**Goal**: [What becomes possible with this task]
```

---

### Solution Investigation Section

**❌ Bad (Technical only or User only)**:

```markdown
### Approach 1: Use API X

**Method**: Call `function(param, flag: false)`
**Pros**: Native support
**Cons**: Complex testing
```

Or

```markdown
### Approach 1: Add Option

**User Experience**: Click checkbox → behavior changes
**Pros**: Simple
**Cons**: Limited
```

**✅ Good (Balanced explanation)**:

```markdown
### Approach 1: [Approach Name]

**Method**:

- [How to solve - how user experiences it and how it works technically]
- If needed: Concrete usage flow (1→2→3)
- If needed: Core technical method

**Pros**:

- [Why it's good from user/technical perspective]

**Cons**:

- [What limitations or trade-offs exist]
```

---

### Completion Criteria Section

**❌ Bad (Technical implementation only)**:

```markdown
- [ ] Add field X to type A
- [ ] Implement logic in module B
- [ ] Update config file
```

**✅ Good (Feature verification + Technical implementation)**:

```markdown
**Feature Verification**:

- [ ] [Scenario 1 verification - actual use case]
- [ ] [Verify behavior when option changes]
- [ ] [Existing feature regression test]

**Technical Implementation**:

- [ ] [Core type/interface changes]
- [ ] [Logic implementation]
- [ ] [Config/schema update]
- [ ] [UI implementation (if needed)]
- [ ] [Unit tests]
```

---

## Execution

Now start the task according to the guidelines above.
