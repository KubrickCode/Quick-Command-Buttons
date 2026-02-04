#!/bin/bash

input=$(cat)

model_display_name=$(echo "$input" | jq -r '.model.display_name')
output_style=$(echo "$input" | jq -r '.output_style.name // "default"')

context_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

if [ -n "$context_pct" ]; then
    context_color=$(awk -v pct="$context_pct" 'BEGIN {
        if (pct >= 80) print "\033[31m"      # red
        else if (pct >= 50) print "\033[33m" # yellow
        else print "\033[32m"                # green
    }')
else
    context_pct="--"
    context_color="\033[90m"  # gray
fi

printf "Model: \033[36m%s\033[0m | Output: \033[35m%s\033[0m | Context: ${context_color}%s%%\033[0m" "$model_display_name" "$output_style" "$context_pct"
