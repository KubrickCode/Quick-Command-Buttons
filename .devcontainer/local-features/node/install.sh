#!/usr/bin/env bash

set -e

corepack enable
corepack prepare pnpm@9.15.0 --activate

export SHELL=/bin/bash
pnpm setup
