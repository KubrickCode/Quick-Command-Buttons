---
name: project-structure
description: |
  Project folder structure design guide. Define standard directory structures for various project types including monorepo, NestJS, React, Go, NPM packages, IDE (VSCode, etc.) and Chrome Extension.
  TRIGGER: Project structure design, folder structure questions, directory organization, project creation, monorepo structure, NestJS/React/Go project structure
---

# Project Structure Guide

## Monorepo

```
project-root/
├── src/                         # All services/apps
├── infra/                       # Shared infrastructure
├── docs/                        # Documentation
├── .devcontainer/               # Dev Container configuration
├── .github/                     # Workflows, templates
├── .vscode/                     # VSCode settings
├── .claude/                     # Claude settings
├── .gemini/                     # Gemini settings
├── package.json                 # Root package.json. For releases, version management
├── go.work                      # Go workspace (when using Go)
├── justfile                     # Just task runner
├── .gitignore
├── .prettierrc
├── .prettierignore
└── README.md
```

## React

```
project-root/
├── src/
│   ├── pages/              # Page modules
│   ├── domains/            # Domain-shared code
│   ├── components/         # Common UI components
│   ├── layouts/            # Layout-related
│   ├── libs/               # Feature libraries (auth, api, theme)
│   ├── shared/             # Pure utilities
│   ├── app.tsx
│   └── main.tsx
├── public/
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## IDE Extension

```
project-root/
├── extension/                   # Extension entry point (activate/deactivate)
├── internal/                    # Private packages
├── pkg/                         # Public packages
├── view/                        # WebView (if applicable)
├── configs/                     # Configuration files
├── scripts/                     # Utility scripts
├── tests/                       # Integration tests
├── public/                      # Static resources (icons, etc.)
├── dist/                        # Build artifacts
├── package.json
├── tsconfig.json
└── .vscodeignore
```
