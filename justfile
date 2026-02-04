set dotenv-load := true

root_dir := justfile_directory()
src_dir := root_dir + "/src"
extension_dir := src_dir + "/extension"
view_dir := src_dir + "/view"

deps: deps-root deps-extension deps-view deps-playwright

deps-compact: deps-root deps-extension deps-view

deps-root:
    cd "{{ root_dir }}" && pnpm install

deps-extension:
    cd "{{ extension_dir }}" && pnpm install

deps-view:
    cd "{{ view_dir }}" && pnpm install

deps-playwright:
    cd "{{ view_dir }}" && pnpm exec playwright install-deps
    cd "{{ view_dir }}" && pnpm exec playwright install chromium

install-package:
    cd "{{ root_dir }}" && pnpm install-package

clean-build:
    rm -rf "{{ view_dir }}/dist"
    rm -rf "{{ extension_dir }}/view-dist"
    rm -rf "{{ extension_dir }}/out"

kill-port port:
    #!/usr/bin/env bash
    set -euo pipefail
    pid=$(ss -tlnp | grep ":{{ port }} " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)
    if [ -n "$pid" ]; then
        echo "Killing process $pid on port {{ port }}"
        kill -9 $pid
    else
        echo "No process found on port {{ port }}"
    fi

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
        cd "{{ extension_dir }}"
        pnpm lint
        ;;
      view)
        cd "{{ view_dir }}"
        pnpm lint
        ;;
      config)
        cd "{{ root_dir }}"
        pnpm lint:config
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
    pnpm package

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
    #!/usr/bin/env bash
    set -euo pipefail
    echo "⚠️  WARNING: This will trigger a production release!"
    echo "   - Merge main → release"
    echo "   - Push to origin/release"
    echo "   - Trigger GitHub Actions release workflow"
    echo ""
    read -p "Continue? (type 'yes' to confirm): " confirm
    if [[ "$confirm" != "yes" ]]; then
      echo "❌ Release cancelled."
      exit 1
    fi

    echo "🚀 Starting release process..."
    echo "📦 Merging main to release branch..."
    git checkout release
    git merge main
    git push origin release
    git checkout main
    echo ""
    echo "✅ Release branch updated!"
    echo "🔄 GitHub Actions will now:"
    echo "   1. Analyze commits for version bump"
    echo "   2. Generate release notes"
    echo "   3. Create tag and GitHub release"
    echo "   4. Update CHANGELOG.md"
    echo "   5. Build and upload to VS Code Marketplace"
    echo ""
    echo "📊 Check progress: https://github.com/KubrickCode/quick-command-buttons/actions"

run-view:
    cd "{{ view_dir }}" && pnpm dev

test target="" mode="" shard="":
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{ target }}" in
      "")
        just test extension "{{ mode }}" "{{ shard }}"
        just test e2e-ui "{{ mode }}" "{{ shard }}"
        ;;
      extension)
        cd "{{ extension_dir }}"
        if [ "{{ mode }}" = "watch" ]; then
          pnpm test -- --watch
        elif [ "{{ mode }}" = "coverage" ]; then
          if [ -n "{{ shard }}" ]; then
            pnpm test -- --coverage --shard="{{ shard }}"
          else
            pnpm test -- --coverage
          fi
        else
          if [ -n "{{ shard }}" ]; then
            pnpm test -- --shard="{{ shard }}"
          else
            pnpm test
          fi
        fi
        ;;
      e2e-ui)
        cd "{{ view_dir }}"
        if [ "{{ mode }}" = "report" ]; then
          if [ ! -f "playwright-report/index.html" ]; then
            echo "No report found. Run tests first: just test e2e-ui"
            exit 1
          fi
          pnpm test:e2e-ui:report
        else
          if [ -n "{{ shard }}" ]; then
            pnpm exec playwright test --shard="{{ shard }}"
          else
            pnpm test:e2e-ui
          fi
        fi
        ;;
      *)
        echo "Unknown target: {{ target }}"
        echo "Usage: just test [extension|e2e-ui] [mode] [shard]"
        exit 1
        ;;
    esac

lint-file file:
    #!/usr/bin/env bash
    set -euo pipefail
    case "{{ file }}" in
      */justfile|*Justfile)
        just --fmt --unstable
        ;;
      *.json|*.yml|*.yaml|*.md)
        npx prettier --write --cache "{{ file }}"
        ;;
      *.ts|*.tsx)
        npx prettier --write --cache "{{ file }}"
        npx eslint --fix "{{ file }}" 2>/dev/null || true
        ;;
      *)
        echo "No lint rule for: {{ file }}"
        ;;
    esac

typecheck-file file:
    #!/usr/bin/env bash
    set -euo pipefail
    dir=$(dirname "{{ file }}")
    while [[ "$dir" != "." && "$dir" != "/" ]]; do
      if [[ -f "$dir/tsconfig.json" ]]; then
        (cd "$dir" && npx tsc --noEmit --incremental)
        exit 0
      fi
      dir=$(dirname "$dir")
    done
    if [[ -f "tsconfig.json" ]]; then
      npx tsc --noEmit --incremental
    fi
