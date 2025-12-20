# Naming Conventions

## Variable and Function Names

- Clear purpose while being concise
- Forbid abbreviations outside industry standards (id, api, db, err, etc.)
- Don't repeat context from the parent scope
- Boolean variables use `is`, `has`, `should` prefixes
- Function names are verbs or verb+noun forms

## Plural Rules

- Pure arrays/slices: "s" suffix (`users`)
- Wrapped object/struct: "list" suffix (`userList`)
- Specific data structure: Explicit (`userSet`, `userMap`)
- Already plural words: Use as-is

## Field Order

- Alphabetically ascending by default
- Maintain consistency in usage
- Also alphabetically ordered in destructuring assignment
