#!/bin/bash

WEBHOOK_URL="https://discord.com/api/webhooks/1426399609382506588/4RZ1VJgLs4uczKgRw1mIeK_BMm8lXLIFul3mkozAz1maIhTW2-THqJXSI6EJnU_XUpbi"

cat > /dev/null

curl -s -X POST \
  -H 'Content-type: application/json' \
  --data '{"content":"✅ 작업 완료!"}' \
  "$WEBHOOK_URL" || true
