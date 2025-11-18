# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**CRITICAL**

- Always update CLAUDE.md and README.md When changing a feature that requires major work or essential changes to the content of the document. Ignore minor changes.
- Never create branches or make commits autonomously - always ask the user to do it manually
- Avoid unfounded assumptions - verify critical details
  - Don't guess file paths - use Glob/Grep to find them
  - Don't guess API contracts or function signatures - read the actual code
  - Reasonable inference based on patterns is OK
  - When truly uncertain about important decisions, ask the user

**IMPORTANT**

- If Claude repeats the same mistake, add an explicit ban to CLAUDE.md
  - Leveraging the Failure-Driven Documentation Pattern
- Proactively leverage frontmatter-based auto-triggering for skills and agents
  - Use .claude/skills/ for general principles (coding standards, work methodologies, ...)
  - Use .claude/agents/ for specialized expert domains (architecture, optimization, ...)
- Always gather context before starting work
  - Read related files first (don't work blind)
  - Check existing patterns in codebase
  - Review project conventions (naming, structure, etc.)
  - Reference .claude/skills/work-execution-principles for detailed guidance
- Always assess issue size and scope accurately - avoid over-engineering simple tasks
  - Apply to both implementation and documentation
  - Verbose documentation causes review burden for humans
- Respect workspace tooling conventions
  - Always use workspace's package manager (detect from lock files: pnpm-lock.yaml → pnpm, yarn.lock → yarn, package-lock.json → npm)
  - Prefer just commands when task exists in justfile or adding recurring tasks
  - Direct command execution acceptable for one-off operations

## Project Overview

Quick Command Buttons is a VS Code extension that adds customizable command buttons to the status bar. It allows users to execute terminal commands and VS Code API functions with one click, supports infinite nesting of command groups, and features a React-based visual configuration UI.

## Development Commands

### Extension Development

```bash
# Extension source (TypeScript)
cd src/extension
npm run compile      # Compile TypeScript
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run test:ci      # CI test mode

# Package extension
npm run package          # Create .vsix package
npm run install-package  # Install locally
npm run vsce-publish     # Publish to VS Code Marketplace
npm run ovsx-publish     # Publish to Open VSX Registry
```

### Web View Development

```bash
# React + Vite configuration UI
cd src/view
npm run dev      # Start dev server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview build
```

## Architecture

### Extension Core Architecture

The extension follows a **dependency injection pattern** with clear separation of concerns:

1. **Main Entry** (`main.ts`): Orchestrates initialization, registers commands, manages lifecycle
2. **Adapters** (`adapters.ts`): Abstraction layer for VS Code API (enables testing)
3. **Managers**: Domain-specific business logic
   - `StatusBarManager`: Status bar button lifecycle and rendering
   - `TerminalManager`: Terminal creation and command execution
   - `ConfigManager`: Configuration reading/writing across scopes
4. **Providers**:
   - `CommandTreeProvider`: Sidebar tree view data provider
   - `ConfigWebviewProvider`: React-based configuration UI host

### Key Design Patterns

- **Factory Pattern**: Static `create()` methods for dependency construction
- **Adapter Pattern**: `createVSCodeConfigReader`, `createVSCodeStatusBarCreator` for VS Code API abstraction
- **Observer Pattern**: Configuration change listeners trigger UI refresh

### Command Execution Flow

```
Button Click → executeButtonCommand() → determineButtonExecutionType()
  → executeCommand: Direct terminal execution
  → showQuickPick: Show nested command selection with keyboard shortcuts
  → executeAll: Recursively execute all group commands
```

### Multi-Language Keyboard Support

The extension supports 15 keyboard layouts via `keyboard-layout-converter.ts`:

- **Layout converters**: Korean, Russian, Arabic, Hebrew, German, Spanish, Czech, Greek, Persian, Belarusian, Ukrainian, Kazakh
- **Advanced converters**: Japanese (WanaKana), Chinese (Pinyin), Hindi (Sanscript)
- Shortcuts match using `findMatchingShortcut()` with variant generation

### Configuration Scopes

Two configuration targets managed by `ConfigManager`:

- **Workspace**: `.vscode/settings.json` (team collaboration)
- **Global**: User settings (personal commands)

Toggle via `quickCommandButtons.configurationTarget` setting.

### Webview Architecture

React-based configuration UI with:

- **Drag & Drop**: `@dnd-kit` for command reordering
- **UI Components**: shadcn/ui + Radix UI primitives
- **VS Code Communication**: `vscode.postMessage()` API for config sync
- **Theming**: TailwindCSS with dark mode support

## Testing Strategy

- **Unit tests**: All manager/provider classes have `.test.ts` files
- **Test framework**: Jest with TypeScript support
- **Mocking**: VS Code API mocked via `adapters` layer
- **Coverage**: Use `test:coverage` for reports

## File Structure Notes

```
src/extension/src/     # TypeScript extension code
  main.ts              # Entry point
  types.ts             # Shared type definitions
  *-manager.ts         # Business logic managers
  *-provider.ts        # VS Code providers
  adapters.ts          # VS Code API abstraction
  command-executor.ts  # Command execution logic
  keyboard-layout-converter.ts  # Multi-language support

src/view/src/          # React configuration UI
  app.tsx              # Root component
  core/                # Reusable UI components
  components/          # Feature-specific components
  context/             # React context providers
  hooks/               # Custom hooks
```

## Important Constraints

- **No `interface` keyword**: Always use `type` (per TypeScript guidelines)
- **Arrow functions**: Use for standalone functions, regular methods inside classes
- **Type safety**: Avoid `any` type and type assertions
- **Test coverage**: Write unit tests for all new business logic
- **Configuration validation**: JSON schema in `package.json` enforces valid button configs

## VS Code Extension Specifics

- **Entry point**: `main` field in root `package.json` points to compiled `src/extension/out/src/main.js`
- **Activation**: `onStartupFinished` event (lazy load)
- **Commands**: All prefixed with `quickCommandButtons.*`
- **Views**: `quickCommandsContainer` activity bar, `quickCommandsTree` view
- **Webview**: Hosted in `ConfigWebviewProvider` with VS Code webview API

## Common Pitfalls

1. **Don't forget to refresh UI**: Status bar and tree view need explicit `refresh()` on config changes
2. **Shortcut uniqueness**: `validateShortcuts()` enforces unique shortcuts per group
3. **Recursive groups**: Commands support infinite nesting via `ButtonConfig.group`
4. **Terminal naming**: Custom `terminalName` allows command organization
5. **executeAll flag**: Executes all group commands simultaneously (monitoring use case)
