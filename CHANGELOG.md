## 🎯 Highlights

### ✨ Features

- add timeout and error handling for webview-extension communication ([11bcffe90bb0409e3439a050656856da729b605c](/commit/11bcffe90bb0409e3439a050656856da729b605c))
- add toast notification system for configuration feedback ([22e514e30e8480e32cccc54092acd53cba650cd9](/commit/22e514e30e8480e32cccc54092acd53cba650cd9))
- add VS Code theme synchronization for webview UI ([149953a0a983f7b8810ee73763457664a956fa6f](/commit/149953a0a983f7b8810ee73763457664a956fa6f))

### ⚡ Performance

- improve initial loading speed with dynamic imports for keyboard layout libraries ([24e41b3942b77dcb39f92ae0fb769110fd58457d](/commit/24e41b3942b77dcb39f92ae0fb769110fd58457d))

## 🔧 Maintenance

### 🔧 Internal Fixes

- Added missing Husky settings ([6e778a0f22bd7048c4d5027feaba0344dca6048a](/commit/6e778a0f22bd7048c4d5027feaba0344dca6048a))
- fix GitHub Actions build failure ([2dcd95e1e125399d7f860710e262a60c01d259c4](/commit/2dcd95e1e125399d7f860710e262a60c01d259c4))
- Fixed an issue where web view linting was not performed. ([d3b99d34c1a4bb67478970d4f39ad9efcb92447f](/commit/d3b99d34c1a4bb67478970d4f39ad9efcb92447f))
- Fixing unfixed dependencies ([f6ffef4013335d39ea633d1f9800d25fd3c11c19](/commit/f6ffef4013335d39ea633d1f9800d25fd3c11c19))
- prevent memory leak in TerminalManager ([3d79118a184d6cc522af87329a021605f66d9a09](/commit/3d79118a184d6cc522af87329a021605f66d9a09))
- resolve ESLint parsing error (view package tsconfig not recognized) ([632d33e2b05caf9a23b6c8124804ef3cf225112b](/commit/632d33e2b05caf9a23b6c8124804ef3cf225112b))
- resolve pnpm installation errors and extension packaging issues in Codespaces ([7d1e85a75dcafb3241a9ab0ed4dc2390fa9cc516](/commit/7d1e85a75dcafb3241a9ab0ed4dc2390fa9cc516))
- resolve VS Code TypeScript failing to recognize zod module types ([084ad1122178cc9b752d0944294ee3206e60b03e](/commit/084ad1122178cc9b752d0944294ee3206e60b03e))

### 📚 Documentation

- Synchronizing documentation from the ai-config-toolkit repository ([c2bac11e381de994b9c747f819c5d90d7ae797d5](/commit/c2bac11e381de994b9c747f819c5d90d7ae797d5))
- Update CLAUDE.md ([cca2df56a0dd6875bbec5ced2845acbab83ef47a](/commit/cca2df56a0dd6875bbec5ced2845acbab83ef47a))

### 💄 Styles

- format code ([be7ebb78d867920af752ddd50f796eb30d3edff3](/commit/be7ebb78d867920af752ddd50f796eb30d3edff3))
- format code ([2864c9972e31faa0c7d39476f103585d4a5abdd5](/commit/2864c9972e31faa0c7d39476f103585d4a5abdd5))

### ♻️ Refactoring

- add ARIA labels and keyboard navigation support for accessibility ([ef79a02d1b9d54182179fcbb4ad23ac3bb1e29b1](/commit/ef79a02d1b9d54182179fcbb4ad23ac3bb1e29b1))
- add error boundary for webview stability ([29028743ae578b03d12522fc2db486bd4ef8998d](/commit/29028743ae578b03d12522fc2db486bd4ef8998d))
- add success and warning variants to Button component and remove hardcoded styles ([6ef81b638ed8c7b2cc67a8db6646f0a5b5ab9887](/commit/6ef81b638ed8c7b2cc67a8db6646f0a5b5ab9887))
- add unique ID field to ButtonConfig for identity tracking ([d41b5c0c2b45370adaa58db6d9cac018a218acc6](/commit/d41b5c0c2b45370adaa58db6d9cac018a218acc6))
- apply adapter pattern to ConfigManager for architecture consistency ([1e631c04794a8362eb90d5bb33028f20b6664c11](/commit/1e631c04794a8362eb90d5bb33028f20b6664c11))
- convert ConfigManager to instance-based and enhance type safety ([871814759b8ab1817b873f65baaf9b6cacd81e9b](/commit/871814759b8ab1817b873f65baaf9b6cacd81e9b))
- convert webview file operations to async ([5858b246aa0e5ae76acafb5e1a5a9d9fb11adb9b](/commit/5858b246aa0e5ae76acafb5e1a5a9d9fb11adb9b))
- eliminate duplicate constants and standardize messages ([ffed8fb7559f039a505f35a26c54adcff13de59f](/commit/ffed8fb7559f039a505f35a26c54adcff13de59f))
- eliminate duplicate ESLint/TypeScript configurations ([ad0e6dfa35500b7a71973b8e7cfd7b95c1f500fe](/commit/ad0e6dfa35500b7a71973b8e7cfd7b95c1f500fe))
- eliminate type duplication between Extension and Web-view ([5f45004c55ac3ca29f880cd251ca69a3baeab62f](/commit/5f45004c55ac3ca29f880cd251ca69a3baeab62f))
- extract UI item creation logic to dedicated module ([21468a7870ceba59495dafe028a1d5d2bf0222af](/commit/21468a7870ceba59495dafe028a1d5d2bf0222af))
- flatten project structure to src-level organization ([e00e04d60a9f37cca7cb68040606c69b897963cf](/commit/e00e04d60a9f37cca7cb68040606c69b897963cf))
- improve GroupCommandList API with Compound Component pattern ([9d99a5a3fb50391da6e46ece815a02c3990b56d4](/commit/9d99a5a3fb50391da6e46ece815a02c3990b56d4))
- introduce Context API to resolve props drilling ([0634fe2d1229c3c779783968158ee7517e44c853](/commit/0634fe2d1229c3c779783968158ee7517e44c853))
- reduce findMatchingShortcut complexity with Strategy Pattern ([f34f14479d268782721169545823247f92476cd4](/commit/f34f14479d268782721169545823247f92476cd4))
- separate CommandForm component responsibilities with custom hooks ([a217ef92e404335306bac1c57a44d66d57084441](/commit/a217ef92e404335306bac1c57a44d66d57084441))
- separate web-view components into individual files ([6b42771e79eeec9cae3971fb6761f6efb608e273](/commit/6b42771e79eeec9cae3971fb6761f6efb608e273))
- unify lint scripts to use pnpm-based approach ([6466ed179b941ebe31189811a2d54f92138e8dfd](/commit/6466ed179b941ebe31189811a2d54f92138e8dfd))

### ✅ Tests

- standardize test file location and improve Jest configuration ([aa58a4488eeeb73ef2c7eb94b08bc034482e6fe9](/commit/aa58a4488eeeb73ef2c7eb94b08bc034482e6fe9))

### 🔨 Chore

- add pnpm setup to devcontainer node feature ([4bb0848d8d83a98cc78f3e2bd91790f33ac2dc62](/commit/4bb0848d8d83a98cc78f3e2bd91790f33ac2dc62))
- add VS Code debug environment for faster development cycle ([d1849835f2da59e311593da0d3e9d0777b1a4982](/commit/d1849835f2da59e311593da0d3e9d0777b1a4982))
- ignore build artifacts (view-dist, out, dist) ([82f5a3a8411546207d248a71a57e411da22b7240](/commit/82f5a3a8411546207d248a71a57e411da22b7240))
- migrate semantic-release config to JS format ([29886af4f38f21ecd0923d18f6b196334e332f4c](/commit/29886af4f38f21ecd0923d18f6b196334e332f4c))

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
