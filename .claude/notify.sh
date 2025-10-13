#!/bin/bash

# TODO: Need a way to manage using environment variable.
WEBHOOK_URL=$DISCORD_WEBHOOK_URL

cat > /dev/null

curl -s -X POST \
  -H 'Content-type: application/json' \
  --data '{"content":"✅ 작업 완료!"}' \
  "$WEBHOOK_URL" || true
