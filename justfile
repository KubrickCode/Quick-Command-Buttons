set dotenv-load := true

root_dir := justfile_directory()
extension_dir := root_dir + "/src/extension"
web_view_dir := root_dir + "/src/web-view"

deps: deps-root deps-extension deps-web-view

deps-root:
    cd "{{ root_dir }}" && yarn install

deps-extension:
    cd "{{ extension_dir }}" && yarn install

deps-web-view:
    cd "{{ web_view_dir }}" && yarn install

install-package:
    cd "{{ root_dir }}" && yarn install-package

clean-build:
    rm -rf "{{ web_view_dir }}/dist"
    rm -rf "{{ extension_dir }}/web-view-dist"
    rm -rf "{{ root_dir }}/out"

degit source_dir target_dir:
    degit https://github.com/KubrickCode/general/{{ source_dir }} {{ target_dir }}

install-degit:
    #!/usr/bin/env bash
    if ! command -v degit &> /dev/null; then
      npm install -g degit
    fi

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
        prettier --write "{{ extension_dir }}/src/**/*.ts"
        cd "{{ extension_dir }}"
        yarn lint
        ;;
      web-view)
        prettier --write "{{ web_view_dir }}/src/**/*.{ts,tsx}"
        cd "{{ web_view_dir }}"
        yarn lint
        ;;
      config)
        prettier --write "**/*.{json,yml,yaml,md}"
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
    cd "{{ web_view_dir }}" && yarn build
    cp -r "{{ web_view_dir }}/dist" "{{ extension_dir }}/web-view-dist"
    cd "{{ extension_dir }}" && yarn compile
    cd "{{ root_dir }}" && yarn package

publish target="both":
    #!/usr/bin/env bash
    cd "{{ root_dir }}"
    if [ "{{ target }}" = "vsce" ] || [ "{{ target }}" = "both" ]; then
      echo "Publishing to VS Code Marketplace..."
      if [ -n "$VSCE_ACCESS_TOKEN" ]; then
        yarn vsce-publish --pat "$VSCE_ACCESS_TOKEN"
      else
        yarn vsce-publish
      fi
    fi
    if [ "{{ target }}" = "ovsx" ] || [ "{{ target }}" = "both" ]; then
      echo "Publishing to Open VSX Registry..."
      if [ -n "$OVSX_ACCESS_TOKEN" ]; then
        yarn ovsx-publish --pat "$OVSX_ACCESS_TOKEN"
      else
        yarn ovsx-publish
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
    cd "{{ web_view_dir }}" && yarn dev

test mode="":
    #!/usr/bin/env bash
    cd "{{ extension_dir }}"
    if [ "{{ mode }}" = "watch" ]; then
      yarn test:watch
    elif [ "{{ mode }}" = "coverage" ]; then
      yarn test --coverage
    else
      yarn test
    fi
