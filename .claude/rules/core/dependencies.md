# Dependency Management

## Version Pinning

- Dependencies: exact versions only (`package@1.2.3`)
- Forbid `^`, `~`, `latest`, ranges
- New installs: check latest stable version first, then pin it

## Package Manager

- Respect workspace tooling conventions
- Detect from lock files: pnpm-lock.yaml → pnpm, yarn.lock → yarn, package-lock.json → npm
- CI must use frozen mode (`npm ci`, `pnpm install --frozen-lockfile`)

## Workspace Tooling

- Prefer just commands when task exists in justfile or adding recurring tasks
- Direct command execution acceptable for one-off operations
