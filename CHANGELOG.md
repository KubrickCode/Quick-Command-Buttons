## 🎯 Highlights

### 🐛 Bug Fixes

- cross-scope configuration import failing incorrectly ([2f73e3f2b1bc2f2b612a4508b6c85616847be22a](/commit/2f73e3f2b1bc2f2b612a4508b6c85616847be22a))

## 🎯 Highlights

### ✨ Features

- Logo design modification ([fd24aab70028a98e1ccb13e45cd132c998faf9ab](/commit/fd24aab70028a98e1ccb13e45cd132c998faf9ab))

### 🐛 Bug Fixes

- **release:** breaking change commits not triggering major version bump ([3de529e5c71d2d750d23dc455acc5e37d45d8b24](/commit/3de529e5c71d2d750d23dc455acc5e37d45d8b24))

### BREAKING CHANGES

- Buttons with both command and group are no longer supported. If Warning notification appears, click "Fix Now" to resolve.

## 🎯 Highlights

### ✨ Features

- add configuration import/export functionality ([2066e6de9ddac2e2dad8507d9f78703fcb15adfd](/commit/2066e6de9ddac2e2dad8507d9f78703fcb15adfd))
- add import preview confirmation dialog before applying changes ([e364561c46ce834927292a306dbbef9030fb2689](/commit/e364561c46ce834927292a306dbbef9030fb2689))
- add insertOnly option and Execution Mode dropdown UI ([5dd5f8985a50c4e6c8977bdf3cbc5976ee52dde2](/commit/5dd5f8985a50c4e6c8977bdf3cbc5976ee52dde2))
- add type safety for ButtonConfig with discriminated union ([fe084dae2fb12146f2716896d7e6dcbc5c09254b](/commit/fe084dae2fb12146f2716896d7e6dcbc5c09254b))
- add type system for Local configuration scope ([f48e3d8db80c1968563f56129378db125c7419f1](/commit/f48e3d8db80c1968563f56129378db125c7419f1))
- Added duplicate shortcut validation and introduced a form system based on React Hook Form + Zod ([fa4ae67d7a2b19f384333e3aa4122998b8cdc437](/commit/fa4ae67d7a2b19f384333e3aa4122998b8cdc437))
- Change the webview title ([43d43a7751541661491fb820913086af75f5ef6a](/commit/43d43a7751541661491fb820913086af75f5ef6a))
- detect and display shortcut conflicts during import ([c7b6f0db1014da8367f074f4b1fd92eec3dbc399](/commit/c7b6f0db1014da8367f074f4b1fd92eec3dbc399))
- display codicon icons in tree view ([bed967b47bfc6913d30e317609f6065148e2cec7](/commit/bed967b47bfc6913d30e317609f6065148e2cec7))
- **i18n:** add internationalization infrastructure for VS Code extension and Webview ([cc6a6afe78e1ffb213f39e925ec5a6cd2d82a59e](/commit/cc6a6afe78e1ffb213f39e925ec5a6cd2d82a59e))
- **i18n:** add language selection dropdown to webview header ([851e091c829654b808f4096dd03647f375af3879](/commit/851e091c829654b808f4096dd03647f375af3879))
- implement Local configuration scope functionality ([bb3e57f9a480c8f5403bdc62d32670ddf2e51b4b](/commit/bb3e57f9a480c8f5403bdc62d32670ddf2e51b4b))
- support Import/Export configuration from Webview UI ([b25a567dd49066585bf5adc5868e5bc8b17a6110](/commit/b25a567dd49066585bf5adc5868e5bc8b17a6110))
- **ui:** add help text for VS Code API command input ([c1c337186150b44e5cc33f2e7b711312374fb4b9](/commit/c1c337186150b44e5cc33f2e7b711312374fb4b9))
- use button name as default terminal name with [QCB] prefix ([f870d9087cb597883390962b1309e09392bc75b8](/commit/f870d9087cb597883390962b1309e09392bc75b8))
- **view:** add color picker component for color selection UI ([4477b58dc6a6bdfdc2c41a3b2704d3fb239f919f](/commit/4477b58dc6a6bdfdc2c41a3b2704d3fb239f919f))
- Webview title one size up ([f9039d5838253b15f7d2ec4446a668cef4d6d433](/commit/f9039d5838253b15f7d2ec4446a668cef4d6d433))
- **webview:** add dialog variant system and premium input styling ([a8a8cfabaeb827fd72352e914dc2d8ab204c5ea3](/commit/a8a8cfabaeb827fd72352e914dc2d8ab204c5ea3))
- **webview:** add header glassmorphism and premium interactions ([2a370fc90ed009ff96be7087c5fd7122789d9926](/commit/2a370fc90ed009ff96be7087c5fd7122789d9926))
- **webview:** apply Inter font and improve header layout ([c9f4438cbfb51f4174c7fdf2afc808637deab9ac](/commit/c9f4438cbfb51f4174c7fdf2afc808637deab9ac))
- **webview:** migrate from border-based to shadow-based floating surface design ([e481ed13924e0e0b36b7dd8191926461897c0d86](/commit/e481ed13924e0e0b36b7dd8191926461897c0d86))
- **webview:** migrate to Linear/Vercel-style monochrome color system ([d62a6455e15c6aeffd91eb7556f3807571bc0613](/commit/d62a6455e15c6aeffd91eb7556f3807571bc0613))
- **webview:** polish empty-state, dialog, badge components ([bca50ed5dc197f7700b50a5af5c70115be9e84dd](/commit/bca50ed5dc197f7700b50a5af5c70115be9e84dd))

### 🐛 Bug Fixes

- "Unsaved Changes" modal incorrectly shown after saving config ([fb15de1fc4fb22dcc8e31760ede0e04b4184c0cd](/commit/fb15de1fc4fb22dcc8e31760ede0e04b4184c0cd))
- codicon icons not displaying in webview ([08c8882b5d3fd61f66bb25aae8d8735252fe1b0f](/commit/08c8882b5d3fd61f66bb25aae8d8735252fe1b0f))
- configuration data not auto-reloading on scope switch ([9a9706a8d29efa2c2e083ea874872bc056d3c2cf](/commit/9a9706a8d29efa2c2e083ea874872bc056d3c2cf))
- incorrect shortcut matching due to control characters ([87dabdfbdd12ea465b0356730b8d7809a0d37275](/commit/87dabdfbdd12ea465b0356730b8d7809a0d37275))
- search interrupted by shortcut keys within group ([1c3c340d442ea624cea68ebcd65541f3608bb710](/commit/1c3c340d442ea624cea68ebcd65541f3608bb710))
- UI bug showing only divider line in Unsaved Changes modal without body ([70f21a6f19816e7fc31c2da47538609d049258dd](/commit/70f21a6f19816e7fc31c2da47538609d049258dd))
- **view:** dialog body content not being displayed ([085e3f05cfbc22b9a1d564759554066e3b62b04a](/commit/085e3f05cfbc22b9a1d564759554066e3b62b04a))
- **view:** scrollbar disappearing when dropdown opens ([2fdeaed0dce9c43ac3ca0b3be4456594f147aa0c](/commit/2fdeaed0dce9c43ac3ca0b3be4456594f147aa0c))
- **webview:** preserve unsaved changes when switching language ([6db65101f07d5f4cdc30853a4289f02f6b9416d7](/commit/6db65101f07d5f4cdc30853a4289f02f6b9416d7))

## 🔧 Maintenance

### 🔧 Internal Fixes

- **e2e:** fix test selectors not matching actual UI elements ([776478ebc896dbeb36e3193b315e7f79a95ea363](/commit/776478ebc896dbeb36e3193b315e7f79a95ea363))
- fix webview asset path test patterns to match actual build output ([4477dc220f84411c6ace33a34b1ef192f081d630](/commit/4477dc220f84411c6ace33a34b1ef192f081d630))
- stale code running in debug mode ([bf0f561bcee5c86180e4110aa469ec1e762407ce](/commit/bf0f561bcee5c86180e4110aa469ec1e762407ce))
- **view:** fix timing issue in execution mode cycling e2e test ([7c2e7c912a24eb7986fcc2ff63f54456990d424a](/commit/7c2e7c912a24eb7986fcc2ff63f54456990d424a))

### 📚 Documentation

- Remove subagent assignment model ([93a62e91ce9238d7ad4491e26a49c72f9cde3cb5](/commit/93a62e91ce9238d7ad4491e26a49c72f9cde3cb5))
- synchronizing documentation from the ai-config-toolkit repository ([fd0d9f1bf0e4f480faefa5be8eea9865840e0911](/commit/fd0d9f1bf0e4f480faefa5be8eea9865840e0911))
- Update docs ([2eca5fc20ab2180100b06c48c5ce60eb6035ad28](/commit/2eca5fc20ab2180100b06c48c5ce60eb6035ad28))

### ♻️ Refactoring

- simplify user configuration by removing id field from saved data ([cb3b24d3a34cf9f7702104cb638ad4738337e863](/commit/cb3b24d3a34cf9f7702104cb638ad4738337e863))

### ✅ Tests

- add 7 E2E tests for UI configuration features ([effba11c5524f2e6508d1117c42473c88cc0fd14](/commit/effba11c5524f2e6508d1117c42473c88cc0fd14))
- add E2E test for converting group to single command ([ab654c58cfbce325e52a5b83b99be41417d9ed59](/commit/ab654c58cfbce325e52a5b83b99be41417d9ed59))
- add E2E test for converting single command to group ([100cace98a7e33882645ac8354eb9cb2f6994f1d](/commit/100cace98a7e33882645ac8354eb9cb2f6994f1d))

### 🔨 Chore

- Add useful action button commands ([1349518f855048cd65940e0e05adabadfda54654](/commit/1349518f855048cd65940e0e05adabadfda54654))
- add useful command ([4482b25c14193a7f6c72e52e1fe76feed6b6ea71](/commit/4482b25c14193a7f6c72e52e1fe76feed6b6ea71))
- test command integration ([8488d1688f8f372bb2f53a21547c2812815148df](/commit/8488d1688f8f372bb2f53a21547c2812815148df))

## 🎯 Highlights

### 🐛 Bug Fixes

- infinite scroll loop after drag and drop in long command list ([98c8a206ba0452bd2395166768589909a2d5fc8a](/commit/98c8a206ba0452bd2395166768589909a2d5fc8a))

## 🔧 Maintenance

### 🔧 Internal Fixes

- Playwright dragTo() not triggering [@dnd-kit](https://github.com/dnd-kit) drag and drop ([a6273e81f814ae27224f8e4f8055a561c18a34a7](/commit/a6273e81f814ae27224f8e4f8055a561c18a34a7))

### ✅ Tests

- add configuration save and scope switch E2E tests ([d2dccfd3803292eeb099eea017bc0787996a70d0](/commit/d2dccfd3803292eeb099eea017bc0787996a70d0))
- add group and nested group command E2E tests ([e0d95e15b402ae6293c791778fc7ced976438b7c](/commit/e0d95e15b402ae6293c791778fc7ced976438b7c))
- add UI E2E testing infrastructure ([4bec86def7dcf93eed6eb66dc4aba1d20f943155](/commit/4bec86def7dcf93eed6eb66dc4aba1d20f943155))

### 🔨 Chore

- syncing documentation from the ai-config-toolkit repository ([9c69ea033d882022c720051b205895b943974ef5](/commit/9c69ea033d882022c720051b205895b943974ef5))

## 🎯 Highlights

### 🐛 Bug Fixes

- keyboard layout mapping causing shortcut malfunction ([e9dff6e34a0a255e6e553907a49c4bcf2a2aa2f2](/commit/e9dff6e34a0a255e6e553907a49c4bcf2a2aa2f2))

## 🔧 Maintenance

### ♻️ Refactoring

- Switch to using reusable workflows from the workflow-toolkit repository ([981d74d728487ee58797fcd83e39497a21a73a3e](/commit/981d74d728487ee58797fcd83e39497a21a73a3e))

### 🔨 Chore

- just simplify installation ([63b86b0b0febd3cc2a985862d586f99874bc8fe8](/commit/63b86b0b0febd3cc2a985862d586f99874bc8fe8))
- simplifying gitignore ([6f563678f9f2d27b7f17134120e955c66057ebbb](/commit/6f563678f9f2d27b7f17134120e955c66057ebbb))

## 🎯 Highlights

### ✨ Features

- **view:** add EmptyState component for empty command list ([9e6c8e8236a6de7398a2248eb8e7e3dc3fc2e2d4](/commit/9e6c8e8236a6de7398a2248eb8e7e3dc3fc2e2d4))
- **view:** add Linear-style backdrop blur to dialog overlay ([d86728e164447cc17462eb2225a78a5b3766ea0c](/commit/d86728e164447cc17462eb2225a78a5b3766ea0c))
- **view:** add list animations with Motion AnimatePresence ([b81ebe56e0d0ef8d007d4795781d8c4a1a7dfbfa](/commit/b81ebe56e0d0ef8d007d4795781d8c4a1a7dfbfa))
- **view:** add premium animation system and accessibility improvements ([5f4116ead519b7f4fa5bc74aac6ef5f9fc8d801d](/commit/5f4116ead519b7f4fa5bc74aac6ef5f9fc8d801d))
- **view:** apply Linear-inspired design to CommandCard component ([c8d1aa52494cfb3679d1f7cfd4a976815dbee929](/commit/c8d1aa52494cfb3679d1f7cfd4a976815dbee929))
- **view:** apply Linear-inspired styling to Dialog and Form components ([44ac5bf2eba1c85e6aff553a386398eeb8cf4aff](/commit/44ac5bf2eba1c85e6aff553a386398eeb8cf4aff))
- **view:** apply spring-like easing to dialog animation ([5993a7fb12adeb0cb44ee357c225b79f41aab570](/commit/5993a7fb12adeb0cb44ee357c225b79f41aab570))
- **view:** change Activity Bar icon to zap ([bd087c21e66d1a81f15018a3351b74c65da3d2ed](/commit/bd087c21e66d1a81f15018a3351b74c65da3d2ed))
- **view:** establish Linear-inspired color system and typography foundation ([3470ecbb4156b3de6246f50393bcdb3b3822d503](/commit/3470ecbb4156b3de6246f50393bcdb3b3822d503))
- **view:** redesign Button/Badge components with Linear-inspired style ([ccdc027a546a279118791fad6a84ed5f60c713fc](/commit/ccdc027a546a279118791fad6a84ed5f60c713fc))
- **view:** redesign Card/Input/Textarea components with Linear-inspired style ([514f631cfecf4e87e738643a8c7fafbae2e7151e](/commit/514f631cfecf4e87e738643a8c7fafbae2e7151e))
- **view:** redesign Header component with lucide-react icons ([fdd5b7a1278598596471394cbdef330fb4e76f79](/commit/fdd5b7a1278598596471394cbdef330fb4e76f79))
- **view:** redesign keyboard shortcut badge with kbd style ([d652e6137dd13858b52a41a4becbf415390ef454](/commit/d652e6137dd13858b52a41a4becbf415390ef454))
- **view:** render VS Code icon syntax as actual icons ([56d765b06bde35f253f3792af94c49e8f12cc0ca](/commit/56d765b06bde35f253f3792af94c49e8f12cc0ca))
- **view:** show delete button destructive style only on hover ([4caf69c1aecfed3a59be6b5941e7934da2db956d](/commit/4caf69c1aecfed3a59be6b5941e7934da2db956d))

### ⚡ Performance

- **build:** optimize VSIX package with esbuild bundling ([6d15b2d5a89c0a9a89a56cbe49866bc7c32acbe1](/commit/6d15b2d5a89c0a9a89a56cbe49866bc7c32acbe1))

## 🔧 Maintenance

### 📚 Documentation

- sync ai documentation from the ai-config-toolkit repository ([d69b6df8310e27dc9289cdedf4ba0e632253edbf](/commit/d69b6df8310e27dc9289cdedf4ba0e632253edbf))

### 💄 Styles

- **view:** polish typography and unify text colors ([8893e66a1ec3e2f587fc4642e1aab4609ac95ad9](/commit/8893e66a1ec3e2f587fc4642e1aab4609ac95ad9))

### ♻️ Refactoring

- **view:** apply button hierarchy with single primary action ([5c48e5f7d7b875966ce6e3ef70991f1c034e1a65](/commit/5c48e5f7d7b875966ce6e3ef70991f1c034e1a65))
- **view:** replace Configuration Scope banner with Linear-style left-border indicator ([2b733d2c5c2416a5394a93a599e48aa86c245ce7](/commit/2b733d2c5c2416a5394a93a599e48aa86c245ce7))

### 🔨 Chore

- Adding to the GitHub CLI container default settings ([cb8d5038613b0c5ffcccc64a2435f094770770fb](/commit/cb8d5038613b0c5ffcccc64a2435f094770770fb))
- Modified to require user confirmation when executing the release command ([e708c438d9f1a4d13f9079970889c1f3557c0172](/commit/e708c438d9f1a4d13f9079970889c1f3557c0172))
- remove docker-in-docker feature ([ca430c7e7b0519585cfde11ba155249deba56384](/commit/ca430c7e7b0519585cfde11ba155249deba56384))

## 🔧 Maintenance

### 🔧 Internal Fixes

- fix marketplace publish failure ([4ebc2b134f8ed97e9d8338e70ad939d6dffba8f7](/commit/4ebc2b134f8ed97e9d8338e70ad939d6dffba8f7))

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
