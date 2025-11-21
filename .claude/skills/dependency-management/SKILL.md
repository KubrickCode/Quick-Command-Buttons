---
name: dependency-management
description: |
  Enforces fixed version dependency installation across all package managers. Ensures reproducible builds, supply chain security, and stability.
  Use when: installing packages, updating dependencies, working with package.json/requirements.txt/go.mod/Cargo.toml/pom.xml/build.gradle/composer.json/Gemfile/.csproj, reviewing dependency configurations, configuring CI/CD pipelines
---

# Dependency Management

## Basic Principles

### Always Use Exact Versions

- Use exact versions only: `package@1.2.3`
- Forbid: `^1.2.3`, `~1.2.3`, `latest`, `*`, version ranges
- Exception: Library peerDependencies only

### Lock Files Are Mandatory

- Always commit to version control
- Forbid manual editing
- CI/CD must use frozen/locked mode

### Security Audit First

- Check vulnerabilities before installation
- Automate regular audits

## Installation Commands

```bash
# Node.js
npm install --save-exact package@1.2.3
pnpm add --save-exact package@1.2.3
yarn add --exact package@1.2.3

# Python
pip install package==1.2.3
poetry add package@1.2.3

# Go
go get package@v1.2.3

# Rust
cargo add package@=1.2.3

# PHP
composer require vendor/package:1.2.3

# Ruby (Gemfile)
gem 'package', '1.2.3'

# Java/Kotlin
implementation("group:artifact:1.2.3")  # Gradle
<version>1.2.3</version>                # Maven

# .NET
dotnet add package PackageName --version 1.2.3
```

## CI/CD Commands

```bash
npm ci                          # npm
pnpm install --frozen-lockfile  # pnpm
yarn install --frozen-lockfile  # yarn
poetry install --no-update      # poetry
go mod verify                   # go
cargo build --locked            # rust
composer install --no-update    # php
bundle install --frozen         # ruby
dotnet restore --locked-mode    # .NET
```

## Common Mistakes

| ❌ Wrong                 | ✅ Correct                     |
| ------------------------ | ------------------------------ |
| `npm install` (CI)       | `npm ci`                       |
| `package@latest`         | `package@1.2.3`                |
| `package@^1.2.3`         | `package@1.2.3`                |
| Lock file in .gitignore  | Commit lock file               |
| Manual lock file editing | Regenerate via package manager |
