# Documentation Policy

## Comments are Technical Debt - Minimize Aggressively

### WHY Only

- Business rules
- External constraints
- Legal requirements
- Counter-intuitive decisions

### NEVER

- Code flow narration
- WHAT explanations
- Name compensation
- Section dividers
- Commented-out code

### Default Stance

"Can I eliminate this comment with better code?" → Yes in 90% of cases

If code needs a comment to explain WHAT it does, fix the code (rename, extract function) instead.
