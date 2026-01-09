#!/bin/bash

cat > /dev/null

MESSAGE="${1:-✅ Work completed!}"

curl -s -X POST \
  -H 'Content-type: application/json' \
  --data "{\"content\":\"$MESSAGE\"}" \
  "$DISCORD_NOTIFY_WEBHOOK_URL" || true
