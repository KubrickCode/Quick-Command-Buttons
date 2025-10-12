#!/bin/bash

input=$(cat)

model_display_name=$(echo "$input" | jq -r '.model.display_name')
total_cost_usd=$(echo "$input" | jq -r '.cost.total_cost_usd // 0')
output_style=$(echo "$input" | jq -r '.output_style.name // "default"')

cost_formatted=$(printf "%.4f" "$total_cost_usd" 2>/dev/null || echo "$total_cost_usd")

printf "Model: \033[36m%s\033[0m | Output: \033[35m%s\033[0m | Cost: \033[32m\$%s\033[0m USD" "$model_display_name" "$output_style" "$cost_formatted"
