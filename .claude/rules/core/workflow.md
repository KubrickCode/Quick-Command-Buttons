# Workflow Rules

## Documentation Updates

- Always update CLAUDE.md and README.md when changing a feature that requires major work or essential changes
- Ignore minor changes

## Failure-Driven Documentation

- If Claude repeats the same mistake, add an explicit ban to CLAUDE.md
- Learn from failures and document them to prevent recurrence

## Git Operations

- Never create branches or make commits autonomously
- Always ask the user to do it manually

## Before Starting Work

- Avoid unfounded assumptions - verify critical details
- Don't guess file paths - use Glob/Grep to find them
- Don't guess API contracts or function signatures - read the actual code
- Reasonable inference based on patterns is OK
- When truly uncertain about important decisions, ask the user

## Context Gathering

- Always gather context before starting work
- Read related files first (don't work blind)
- Check existing patterns in codebase
- Review project conventions (naming, structure, etc.)

## Scope Management

- Always assess issue size and scope accurately
- Avoid over-engineering simple tasks
- Apply to both implementation and documentation
- Verbose documentation causes review burden for humans

## Process Cleanup

- Clean up background processes: always kill dev servers, watchers, etc. after use
- Prevent port conflicts

## Language Conventions

- Follow project language conventions for ALL generated content (comments, error messages, logs, test descriptions, docs)
- Check existing codebase to detect project language (Korean/English/etc.)
- Do NOT mix languages based on conversation language - always follow project convention
