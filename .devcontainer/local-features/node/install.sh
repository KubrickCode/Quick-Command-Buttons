#!/usr/bin/env bash

set -e

# Use the latest version of Yarn
yarn set version berry

npm install -g yo generator-code

npm install -g @vscode/vsce

# Install OpenVSX CLI (for Cursor and other editors)
npm install -g ovsx

echo "✅ Node.js development tools installed:"
echo "  - Yarn (berry)"
echo "  - @vscode/vsce (VS Code Extension Manager)"
echo "  - ovsx (OpenVSX Registry CLI)"