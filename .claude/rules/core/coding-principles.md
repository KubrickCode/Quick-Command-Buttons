# Coding Principles

## One Function, One Responsibility

- If function name connects with "and" or "or", it's a signal to split
- If test cases are needed for each if branch, it's a signal to split

## Conditional and Loop Depth Limited to 2 Levels

- Minimize depth using early return whenever possible
- If still heavy, extract into separate functions

## Make Function Side Effects Explicit

- Example: If `getUser` also runs `updateLastAccess()`, specify it in the function name

## Convert Magic Numbers/Strings to Constants When Possible

- Declare at the top of the file or class where used
- Consider separating into a constants file if there are many

## Function Order by Call Order

- Follow language-specific conventions if clear
- Otherwise, order top-to-bottom for easy reading by call order

## Review External Libraries for Complex Implementations

- When logic is complex and tests become bloated
- If industry-standard libraries exist, use them
- When security, accuracy, or performance optimization is critical
- When platform compatibility or edge cases are numerous

## Modularization (Prevent Code Duplication and Pattern Repetition)

- Absolutely forbid code repetition
- Modularize similar patterns into reusable forms
- Allow pre-modularization if reuse is confirmed
- Avoid excessive abstraction
- Modularization levels:
  - Same file: Extract into separate function
  - Multiple files: Separate into different file/package
  - Multiple projects/domains: Separate into package/module
