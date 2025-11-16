set dotenv-load := true

root_dir := justfile_directory()
extension_dir := root_dir + "/src/extension"
web_view_dir := root_dir + "/src/web-view"

deps: deps-root deps-extension deps-web-view

deps-root:
    cd "{{ root_dir }}" && pnpm install

deps-extension:
    cd "{{ extension_dir }}" && pnpm install

deps-web-view:
    cd "{{ web_view_dir }}" && pnpm install

install-package:
    cd "{{ root_dir }}" && pnpm install-package

clean-build:
    rm -rf "{{ web_view_dir }}/dist"
    rm -rf "{{ extension_dir }}/web-view-dist"
    rm -rf "{{ root_dir }}/out"

lint target="all":
    #!/usr/bin/env bash
    set -euox pipefail
    case "{{ target }}" in
      all)
        just lint extension
        just lint web-view
        just lint config
        just lint justfile
        ;;
      extension)
        npx prettier --write "{{ extension_dir }}/src/**/*.ts"
        cd "{{ extension_dir }}"
        pnpm lint
        ;;
      web-view)
        npx prettier --write "{{ web_view_dir }}/src/**/*.{ts,tsx}"
        cd "{{ web_view_dir }}"
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
    cd "{{ web_view_dir }}" && pnpm build
    cp -r "{{ web_view_dir }}/dist" "{{ extension_dir }}/web-view-dist"
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

release version="patch":
    @echo "🚀 Creating {{ version }} release..."
    npm version {{ version }}
    git push origin main --tags
    git checkout release
    git merge main
    git push origin release
    git checkout main
    @echo "✅ Release complete! Check GitHub Actions."

run-view:
    cd "{{ web_view_dir }}" && pnpm dev

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
