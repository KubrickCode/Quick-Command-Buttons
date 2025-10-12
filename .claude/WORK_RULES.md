## Work Rules

- Work should always be done agilely, in small units, and in meaningful change units.
- Instead of rushing to implement it, you should always focus on writing clean code that doesn't create bugs and is easy to maintain.
- If you feel like there's too much code in a single file, you should first review the overall structure and figure out how to neatly separate the files.
- Always understand the surrounding code context, and when you see signs of reuse, modularize it to avoid code duplication.
- You should always write your code in a way that makes it easy to unit test.
- If a complex implementation is required, always consider using a commercial library or tool instead of coding it yourself.

## Coding Style & Guidelines

- Whenever possible, prioritize code readability over code efficiency.
- Always write code that's short and concise. Make good use of early return techniques, and be careful not to create too much depth in conditional statements or loops.
- Always keep variable and property names concise but clear.
- Always maintain a clear separation of concerns. However, be careful not to over-segregate, such as through premature optimization.
- Comments shouldn't be used unless absolutely necessary. Write readable code that can be understood without comments, and only include comments for unavoidable business logic.
- Variable values ​​should be separated into constants whenever possible. Avoid creating magic numbers.
- The depth of loops and conditional statements should be as minimal as possible. It's best to avoid them altogether.
- If a function is likely to have more than three arguments, always consider making them object or struct arguments.
- Follow Object-Oriented Programming (OOP) principles whenever applicable, including encapsulation, inheritance, polymorphism, and SOLID principles.

## TypeScript Coding Guidelines

- When using TypeScript, avoid using unsafe type systems such as the any type and type assertions whenever possible.
- Always use Type instead of Interface
- Use arrow functions for standalone functions outside of classes. Inside classes, use regular method syntax instead of arrow functions.
