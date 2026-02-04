#!/bin/bash

cat > /dev/null

PROJECT_NAME=$(basename "$PWD")
MESSAGE="${1:-✅ Work completed!}"
FULL_MESSAGE="[$PROJECT_NAME] $MESSAGE"

curl -s -X POST \
  -H 'Content-type: application/json' \
  --data "{\"content\":\"$FULL_MESSAGE\"}" \
  "$DISCORD_NOTIFY_WEBHOOK_URL" || true
