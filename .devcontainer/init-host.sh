#!/bin/bash

touch "${HOME}/.env.secrets"

[ -s .claude-session-config.json ] || echo '{}' > .claude-session-config.json

mkdir -p .claude-sessions
