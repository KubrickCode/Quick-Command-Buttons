# Changelog

All notable changes to the "Quick Command Buttons" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.10](https://github.com/KubrickCode/quick-command-buttons/compare/v0.2.9...v0.2.10) (2025-01-15)

### 🐛 Bug Fixes

- Fix same-command buttons sharing terminal
- Fix missing terminalName input in group command UI
- Fix CI test workflow just command
- Fixed an issue where commands could be run in the same terminal if the terminal name was the same
- Fixed a docker-in-docker build failure due to moby-cli lack in Debian trixie

### ✨ Features

- Remove default name values for new commands
- Remove unnecessary degit package

### 🔨 Chores

- build(deps-dev): bump vite
- build(deps): bump actions/setup-node from 5 to 6
- build(deps): bump softprops/action-gh-release from 1 to 2
- build(deps): bump extractions/setup-just from 2 to 3
- build(deps): bump actions/checkout from 4 to 5
- Change Discord notification language
- Modify environment variables configuration
- Edit Contributing section to README
- Sync workflow configurations
- Sync container configurations
- Sync AI agent configurations

## [0.2.9](https://github.com/KubrickCode/quick-command-buttons/compare/v0.2.7...v0.2.9) (2024-12-30)

### ✨ Features

- Add release workflow
- Add ovsx in root package
- Add funding
- Sync README basic configuration example with package.json defaults

### 🔨 Chores

- build(deps): bump actions/setup-node from 4 to 5
- build(deps): bump actions/checkout from 4 to 5
- build(deps): bump codecov/codecov-action from 3 to 5
- build(deps): bump tar-fs in the npm_and_yarn group
- build(deps-dev): bump @vscode/vsce from 3.0.0 to 3.6.2
- Sync PR automation from general
- Add dependabot & issue/PR automation workflows

## [0.2.7](https://github.com/KubrickCode/quick-command-buttons/compare/v0.2.6...v0.2.7) (2024-12-15)

### 🐛 Bug Fixes

- Fix shortcut key matching to handle whitespace in input

## [0.2.6](https://github.com/KubrickCode/quick-command-buttons/compare/v0.2.4...v0.2.6) (2024-12-10)

### ✨ Features

- Exclude dev dependencies from VSIX package
- Replace pinyin with tiny-pinyin for 99.83% size reduction

## [0.2.4](https://github.com/KubrickCode/quick-command-buttons/compare/v0.2.2...v0.2.4) (2024-12-05)

### ✨ Features

- Refactor extension packaging workflow to use root directory
- Add keyboard layout converter module with 15 language support
- Modify out path and vscodeignore policy
- Optimize deployment pipeline and clean up artifacts

### 📝 Documentation

- Add CODING_GUIDE.md

## [0.2.2](https://github.com/KubrickCode/quick-command-buttons/compare/v0.2.0...v0.2.2) (2024-11-28)

### 🐛 Bug Fixes

- Fix modal backdrop clipping issue in webview environment
- Improve shortcut input layout and placeholder visibility

### ✨ Features

- Add workspace vs global configuration scope guidance
- Add claude command and configurations
- Add MCP configuration
- Add gemini configuration
- Add degit command

### 📝 Documentation

- Keyword enhancement

## [0.2.0](https://github.com/KubrickCode/quick-command-buttons/compare/v0.1.6...v0.2.0) (2024-11-15)

### ✨ Features

- Initial release with core functionality
- Customizable command buttons in status bar
- Support for infinite nesting of command groups
- React-based visual configuration UI
- Multi-language keyboard layout support
- Workspace and global configuration scopes
