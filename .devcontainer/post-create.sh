#!/usr/bin/env bash

npm install -g @anthropic-ai/claude-code

claude mcp add-json "sequential-thinking" '{"command":"npx","args":["-y","@modelcontextprotocol/server-sequential-thinking"]}'
claude mcp add-json "context7" '{"command":"npx","args":["-y","@upstash/context7-mcp@latest"]}'
