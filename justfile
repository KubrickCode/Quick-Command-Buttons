set dotenv-load

root_dir := justfile_directory()
extension_dir := root_dir + "/src/extension"
web_view_dir := root_dir + "/src/web-view"

deps: deps-extension deps-web-view

deps-extension:
  cd "{{ extension_dir }}" && yarn install

deps-web-view:
  cd "{{ web_view_dir }}" && yarn install

install-package:
  cd "{{ extension_dir }}" && yarn install-package

clean-build:
  rm -rf "{{ web_view_dir }}/dist"
  rm -rf "{{ extension_dir }}/web-view-dist"
  rm -rf "{{ extension_dir }}/out"

package: clean-build
  cd "{{ web_view_dir }}" && yarn build
  cp -r "{{ web_view_dir }}/dist" "{{ extension_dir }}/web-view-dist"
  cd "{{ extension_dir }}" && yarn compile && yarn package

publish target="both":
  #!/usr/bin/env bash
  cd "{{ extension_dir }}"
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

run-view:
  cd "{{ web_view_dir }}" && yarn dev
