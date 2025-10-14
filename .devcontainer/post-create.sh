#!/bin/bash

npm install -g @anthropic-ai/claude-code
npm install -g prettier
npm install -g baedal
npm install -g @vscode/vsce
npm install -g ovsx

if [ -f /workspaces/quick-command-buttons/.env ]; then
  grep -v '^#' /workspaces/quick-command-buttons/.env | sed 's/^/export /' >> ~/.bashrc
fi
