#!/bin/bash

cat > /dev/null

curl -s -X POST \
  -H 'Content-type: application/json' \
  --data '{"content":"✅ 작업 완료!"}' \
  "$DISCORD_WEBHOOK_URL" || true
