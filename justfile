set dotenv-load

root_dir := justfile_directory()
extension_dir := root_dir + "/src"

deps:
  cd "{{ extension_dir }}" && yarn install

install-package:
  cd "{{ extension_dir }}" && yarn install-package

package:
  cd "{{ extension_dir }}" && yarn compile && yarn package

publish target="both":
  #!/usr/bin/env bash
  cd "{{ extension_dir }}"
  if [ "{{ target }}" = "vsce" ] || [ "{{ target }}" = "both" ]; then
    echo "Publishing to VS Code Marketplace..."
    yarn vsce-publish
  fi
  if [ "{{ target }}" = "ovsx" ] || [ "{{ target }}" = "both" ]; then
    echo "Publishing to Open VSX Registry..."
    yarn ovsx-publish
  fi
