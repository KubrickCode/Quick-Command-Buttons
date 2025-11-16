## [0.2.11](https://github.com/KubrickCode/quick-command-buttons/compare/v0.2.10...v0.2.11) (2025-11-16)

### 🔧 Internal Fixes

- resolve pnpm symlink error in vsce packaging ([679ce4c](https://github.com/KubrickCode/quick-command-buttons/commit/679ce4c8070d0b308ddd0879bdb415dbcb7d8a1b))

### 📝 Documentation

- Add command execution principles to CLAUDE.md ([5093bd5](https://github.com/KubrickCode/quick-command-buttons/commit/5093bd5b6f9fc2c420a04742a055605be25583ed))
- add ifix type and improve distinction guide in commit message generator ([58ead98](https://github.com/KubrickCode/quick-command-buttons/commit/58ead980d8e580bae089a4f31f712390b51f9904))
- Added Conventional Commits specifications to the commit command. ([2b3e517](https://github.com/KubrickCode/quick-command-buttons/commit/2b3e51785193e68f2c595ad9237a62793c7db9be))
- AI-related documentation and settings replaced ([766eadb](https://github.com/KubrickCode/quick-command-buttons/commit/766eadb2a2b61ff775b2a2469f8df63d41bac811))
- Remove incorrectly formatted documents ([ab68887](https://github.com/KubrickCode/quick-command-buttons/commit/ab68887475eeb9571118a5b47ddc14b95523cd6e))
- Sync prompts from the ai-config-toolkit repository ([3b9f714](https://github.com/KubrickCode/quick-command-buttons/commit/3b9f7149385b6e6d84ae82baf8f326b68186a27a))
- Synchronizing code from the ai-config-toolkit repository ([723424d](https://github.com/KubrickCode/quick-command-buttons/commit/723424d08b8df09cae9d8a8b3c835c1893cd6bfe))
- Update CLAUDE.md ([a9881b7](https://github.com/KubrickCode/quick-command-buttons/commit/a9881b7bfbc42a38e873d96babdc8f1a2aa485ce))

### 💄 Styling

- format code ([25e6b67](https://github.com/KubrickCode/quick-command-buttons/commit/25e6b67c06283b340d4786946fdc33066089cd7a))
- format doc ([a700a8d](https://github.com/KubrickCode/quick-command-buttons/commit/a700a8d9fef3b5dc9700f3bed30b9235ce8ce00f))

### 👷 CI/CD

- Fix error when PR author tries to add themselves as reviewer ([96442e6](https://github.com/KubrickCode/quick-command-buttons/commit/96442e65f09b0ade6d9e50aedf1aca19e59c72c4))
- Fix formatting inconsistency between save and lint execution ([c3cfc5e](https://github.com/KubrickCode/quick-command-buttons/commit/c3cfc5e619502a6a0ccbf8522b5ada8d9f219595))
- Improved the issue of delayed pre-commit lint error detection, resulting in rework. ([4e61e0b](https://github.com/KubrickCode/quick-command-buttons/commit/4e61e0b105b97882ca23f4cfbcca62bdedf4268c))

### 🔨 Chores

- add dual language document generation to workflow commands ([9533826](https://github.com/KubrickCode/quick-command-buttons/commit/95338260da0c669197897bd7d3c12e1433d67c5d))
- Add frequently used mcp servers ([f693007](https://github.com/KubrickCode/quick-command-buttons/commit/f693007f087549c99734ea676f85c0f598ce17f4))
- Added CLAUDE skills to fix dependency versions and related principles ([05052a3](https://github.com/KubrickCode/quick-command-buttons/commit/05052a3d51dfcb053b8fc1e18ed67b2fef2e7b82))
- change lint command to fix ([4404ad6](https://github.com/KubrickCode/quick-command-buttons/commit/4404ad65b363c6ed7198d38bad48658be59647b8))
- Change the dependabot commit message conventions ([9b1e6d0](https://github.com/KubrickCode/quick-command-buttons/commit/9b1e6d0ea02391ee8defe95d2d02461fb7db48a2))
- Change the Discord webhook url environment variable name ([9ecfcc2](https://github.com/KubrickCode/quick-command-buttons/commit/9ecfcc2e7082475856059716fec573258b19936c))
- Fixed Claude Code re-login issue when rebuilding DevContainer. ([85bfd18](https://github.com/KubrickCode/quick-command-buttons/commit/85bfd185a46fcd59629b9f61f19d72ac26b8b402))
- implement semantic-release automation for version management and releases ([df13469](https://github.com/KubrickCode/quick-command-buttons/commit/df13469ccd5fcccb8a837dfd65c2b346ac93f63d))
- Migrating the package manager from yarn to pnpm ([e891d0c](https://github.com/KubrickCode/quick-command-buttons/commit/e891d0c6deebb4e232736d347ccbec229a3c158f))
- Modify workflow-specific documents to not be uploaded to git ([3309314](https://github.com/KubrickCode/quick-command-buttons/commit/33093142ef4b6404e6ec41c67ef860a9b06b6af7))
- Set the git action button terminal name ([adec525](https://github.com/KubrickCode/quick-command-buttons/commit/adec5253b10f9cc4c947e1a9e541e1b2845e6682))
- Setting global environment variables ([fd24fde](https://github.com/KubrickCode/quick-command-buttons/commit/fd24fde094ba68235c3c144bed261d5a78e4a676))
- update claude code terminal name ([1e5c264](https://github.com/KubrickCode/quick-command-buttons/commit/1e5c264b42028cba62638116298280a2bb327a3e))
- update gitignore ([9e8c17c](https://github.com/KubrickCode/quick-command-buttons/commit/9e8c17cc09ac3f7bb014c065fb7996ba02726cc5))

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
