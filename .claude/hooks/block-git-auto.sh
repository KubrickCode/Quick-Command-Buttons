#!/bin/bash
# Block automatic git commit/push commands
# Claude Code PreToolUse hook for Bash tool

# Read JSON input from stdin
input=$(cat)

# Extract the command from tool_input.command
command=$(echo "$input" | jq -r '.tool_input.command // empty')

# Check if command contains git commit or git push
if echo "$command" | grep -qE '(git\s+(commit|push)|git\s+.*&&\s*git\s+(commit|push))'; then
  # Return deny decision with message
  cat << 'EOF'
{
  "decision": "block",
  "reason": "Git commit/push requires explicit user request. Use '/commit' command or ask user for confirmation."
}
EOF
  exit 0
fi

# Allow other commands
exit 0
