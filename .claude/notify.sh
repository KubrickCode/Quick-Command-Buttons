#!/bin/bash

cat > /dev/null

curl -s -X POST \
  -H 'Content-type: application/json' \
  --data '{"content":"✅ Work completed!"}' \
  "$DISCORD_NOTIFY_WEBHOOK_URL" || true
