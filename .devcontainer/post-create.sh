#!/bin/bash

npm install -g @anthropic-ai/claude-code
npm install -g baedal
npm install -g @vscode/vsce
npm install -g ovsx

if [ ! -f ~/.claude/config.json ]; then
    echo '{}' > ~/.claude/config.json
fi

if [ -f ~/.claude.json ] && [ ! -L ~/.claude.json ]; then
    mv ~/.claude.json ~/.claude/config.json
fi

ln -sf ~/.claude/config.json ~/.claude.json
