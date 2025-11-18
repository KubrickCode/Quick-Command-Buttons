module.exports = {
  "src/extension/**/*.ts": () => "just lint extension",
  "src/view/**/*.{ts,tsx}": () => "just lint view",
  "**/*.{json,yml,yaml,md}": () => "just lint config",
  justfile: () => "just lint justfile",
};
