#!/bin/bash

input=$(cat)

model_display_name=$(echo "$input" | jq -r '.model.display_name')
output_style=$(echo "$input" | jq -r '.output_style.name // "default"')

# Context window usage
context_size=$(echo "$input" | jq -r '.context_window.context_window_size // 0')
current_usage=$(echo "$input" | jq '.context_window.current_usage')

if [ "$current_usage" != "null" ] && [ "$context_size" -gt 0 ] 2>/dev/null; then
    input_tokens=$(echo "$current_usage" | jq -r '.input_tokens // 0')
    cache_creation=$(echo "$current_usage" | jq -r '.cache_creation_input_tokens // 0')
    cache_read=$(echo "$current_usage" | jq -r '.cache_read_input_tokens // 0')

    used_tokens=$((input_tokens + cache_creation + cache_read))
    context_pct=$(awk "BEGIN {printf \"%.1f\", ($used_tokens / $context_size) * 100}")

    # Color by usage level
    if (( $(echo "$context_pct >= 80" | bc -l) )); then
        context_color="\033[31m"  # red
    elif (( $(echo "$context_pct >= 50" | bc -l) )); then
        context_color="\033[33m"  # yellow
    else
        context_color="\033[32m"  # green
    fi
else
    context_pct="--"
    context_color="\033[90m"  # gray
fi

printf "Model: \033[36m%s\033[0m | Output: \033[35m%s\033[0m | Context: ${context_color}%s%%\033[0m" "$model_display_name" "$output_style" "$context_pct"
