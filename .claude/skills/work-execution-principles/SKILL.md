---
name: work-execution-principles
description: |
  Establishes core development principles for task division, scope determination, testing strategies, and dependency management. Ensures consistent quality standards across all development activities. Implements systematic approaches to code review, work planning, and architectural decision-making. Applies universally to all programming languages and frameworks.
  Use when: starting development tasks, planning implementation approaches, determining appropriate review scope, making architectural decisions, establishing testing strategies, managing project dependencies, organizing code structure, defining work boundaries, or ensuring code quality standards. Applies to all file types and programming languages (.ts, .tsx, .js, .jsx, .go, .py, .java, etc.).
---

# Work Execution Principles

## Task Division Principle

- All tasks must be divided into meaningful units reviewable for code review
- "Meaningful unit" means: independently testable, clearly purposed, rollback-able changes
- For large tasks, first design the overall structure, then establish step-by-step execution plan
- Each step must satisfy:
  - Build/compilation succeeds
  - Existing functionality doesn't break
  - Functionally complete if possible

## Essential Steps Before Starting Work

**Understand Task Scope and Determine Review Scope**

- Small tasks (single function modification, bug fixes, etc.):
  - Only review files being modified and files directly imported/referenced by them
  - Check 1-2 usage locations of the function/component
- Medium tasks (new feature addition, refactoring, etc.):
  - Review related files in same domain/module
  - Search for similar implementation examples (1-2)
  - Check for reusable shared module existence
- Large tasks (architecture changes, new domain addition, etc.):
  - Understand overall project structure
  - Review all related domains/modules
  - Check existing patterns and conventions broadly

**Incremental Expansion Principle**

- Start with minimum scope review only
- Do additional review if deemed necessary during work
- Don't waste time with unnecessary prior research

**Review File Structure**

- Decide if new file is needed or if adding to existing file
- Consider splitting if file is 300+ lines or concerns are mixed
- Follow project structure conventions

**Review External Library Usage**

- For complex implementations (date handling, validation, encryption, parsing, etc.), prioritize verified libraries
- Recommend library use when direct implementation makes test code excessively complex
- First check if project already uses a library for the purpose

## Implementation Priority

- Basic principle: Focus on writing clean code over hasty implementation
  - Stable code that doesn't create bugs
  - Easily maintainable code
  - Clear separation of concerns
- MVP or rapid feature development mode:
  - Prioritize feature validation over code completeness
  - Clearly define MVP as minimum testable unit
  - Maintain meaningful modularization for easy later refactoring
  - Keep structure allowing incremental feature addition
- Forbid premature optimization:
  - Refrain from optimization until clear performance bottleneck is measured
  - Don't sacrifice readability and maintainability for optimization
  - Don't pre-abstract based on "might be needed in future"

## Testing Strategy

- Write most code in structure that enables unit testing
- Develop alongside test code except for MVP development
  - Developing with tests naturally produces testable structure
  - Adding tests later often results in structural issues
- Difficult-to-test code signals structural problems:
  - Dependencies on global state
  - Side effects not clearly separated
  - One function doing too many things

## Dependency Management

- Forbid direct reference to global variables, singleton instances
- Follow dependency injection principle:
  - Inject required dependencies through constructor, function parameters, etc.
  - Easily replace with mock objects during testing
  - Exceptions: pure utility functions, constants, etc.
- Dependency direction always points toward stable:
  - Concrete depends on abstract
  - Higher level doesn't depend on lower level

## After Work Completion

- Create WORK_SUMMARY.md file upon completion including:
  - Performed task list (concisely)
  - Changed major files and reasons for changes
  - Feature testing method (how to actually verify)
  - Precautions or constraints to know
- Report intermediate progress briefly in text only
- When adding new features or significantly changing business logic, proactively modify global documents like README.md or CLAUDE.md and report
