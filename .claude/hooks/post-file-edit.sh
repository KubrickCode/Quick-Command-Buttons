#!/bin/bash

set -euo pipefail

INPUT=$(cat)

FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

if [[ ! -f "$FILE_PATH" ]]; then
    exit 0
fi

cd "$(git rev-parse --show-toplevel 2>/dev/null || pwd)"

if command -v just &> /dev/null && [[ -f "justfile" ]]; then
    just lint-file "$FILE_PATH" 2>&1 || true

    case "$FILE_PATH" in
      *.ts|*.tsx)
        just typecheck-file "$FILE_PATH" 2>&1 || true
        ;;
    esac
fi

exit 0
