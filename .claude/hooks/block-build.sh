#!/bin/bash

set -euo pipefail

INPUT=$(cat)

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

if echo "$COMMAND" | grep -qE '(pnpm|npm|yarn|bun)\s+(run\s+)?build|just\s+build|make\s+build|go\s+build\s+[^-]'; then

    if echo "$COMMAND" | grep -qE 'ALLOW_BUILD=|--force-build'; then
        exit 0
    fi

    if echo "$COMMAND" | grep -qE 'analyze|bundle-analyze|ANALYZE='; then
        exit 0
    fi

    cat << 'EOF' >&2
{"decision": "block", "reason": "Build commands blocked during development.\n\nAlternatives:\n- Type check runs automatically after file edit\n- pnpm dev: Development server with HMR\n\nTo force build: ALLOW_BUILD=1 pnpm build"}
EOF
    exit 2
fi

exit 0
