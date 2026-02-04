module.exports = {
  "src/extension/**/*.ts": () => "just lint extension",
  "src/view/**/*.{ts,tsx}": () => "just lint view",
  "**/*.{json,yml,yaml,md}": (files) => files.map((f) => `just lint-file "${f}"`),
  "**/[Jj]ustfile": () => "just lint justfile",
};
