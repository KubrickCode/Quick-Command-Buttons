#!/bin/bash
set -euo pipefail

[ -s /root/.claude.json ] || echo '{}' > /root/.claude.json

command -v claude &>/dev/null || curl -fsSL https://claude.ai/install.sh | bash

# 글로벌 패키지
npm install -g baedal
npm install -g @vscode/vsce
npm install -g ovsx
