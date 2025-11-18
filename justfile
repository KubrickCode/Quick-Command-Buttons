set dotenv-load := true

root_dir := justfile_directory()
src_dir := root_dir + "/src"
extension_dir := src_dir + "/extension"
view_dir := src_dir + "/view"

deps: deps-root deps-src deps-extension deps-view

deps-root:
    cd "{{ root_dir }}" && pnpm install

deps-src:
    cd "{{ src_dir }}" && pnpm install

deps-extension:
    cd "{{ extension_dir }}" && pnpm install

deps-view:
    cd "{{ view_dir }}" && pnpm install

install-package:
    cd "{{ root_dir }}" && pnpm install-package

clean-build:
    rm -rf "{{ view_dir }}/dist"
    rm -rf "{{ extension_dir }}/view-dist"
    rm -rf "{{ extension_dir }}/out"

lint target="all":
    #!/usr/bin/env bash
    set -euox pipefail
    case "{{ target }}" in
      all)
        just lint extension
        just lint view
        just lint config
        just lint justfile
        ;;
      extension)
        npx prettier --write "{{ src_dir }}/{extension,internal,pkg,shared,tests}/**/*.ts"
        cd "{{ src_dir }}"
        npx eslint --fix extension/main.ts internal pkg shared tests
        ;;
      view)
        npx prettier --write "{{ view_dir }}/src/**/*.{ts,tsx}"
        cd "{{ view_dir }}"
        pnpm lint
        ;;
      config)
        npx prettier --write "**/*.{json,yml,yaml,md}"
        ;;
      justfile)
        just --fmt --unstable
        ;;
      *)
        echo "Unknown target: {{ target }}"
        exit 1
        ;;
    esac

package: clean-build
    cd "{{ view_dir }}" && pnpm build
    cp -r "{{ view_dir }}/dist" "{{ extension_dir }}/view-dist"
    cd "{{ extension_dir }}" && pnpm compile
    cd "{{ root_dir }}" && pnpm package

publish target="both":
    #!/usr/bin/env bash
    cd "{{ root_dir }}"
    if [ "{{ target }}" = "vsce" ] || [ "{{ target }}" = "both" ]; then
      echo "Publishing to VS Code Marketplace..."
      if [ -n "$VSCE_ACCESS_TOKEN" ]; then
        pnpm vsce-publish --pat "$VSCE_ACCESS_TOKEN"
      else
        pnpm vsce-publish
      fi
    fi
    if [ "{{ target }}" = "ovsx" ] || [ "{{ target }}" = "both" ]; then
      echo "Publishing to Open VSX Registry..."
      if [ -n "$OVSX_ACCESS_TOKEN" ]; then
        pnpm ovsx-publish --pat "$OVSX_ACCESS_TOKEN"
      else
        pnpm ovsx-publish
      fi
    fi

release:
    @echo "🚀 Starting release process..."
    @echo "📦 Merging main to release branch..."
    git checkout release
    git merge main
    git push origin release
    git checkout main
    @echo ""
    @echo "✅ Release branch updated!"
    @echo "🔄 GitHub Actions will now:"
    @echo "   1. Analyze commits for version bump"
    @echo "   2. Generate release notes"
    @echo "   3. Create tag and GitHub release"
    @echo "   4. Update CHANGELOG.md"
    @echo "   5. Build and upload to VS Code Marketplace"
    @echo ""
    @echo "📊 Check progress: https://github.com/KubrickCode/quick-command-buttons/actions"

run-view:
    cd "{{ view_dir }}" && pnpm dev

test mode="":
    #!/usr/bin/env bash
    cd "{{ extension_dir }}"
    if [ "{{ mode }}" = "watch" ]; then
      pnpm test:watch
    elif [ "{{ mode }}" = "coverage" ]; then
      pnpm test:coverage
    else
      pnpm test
    fi
