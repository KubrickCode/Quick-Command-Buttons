module.exports = {
  "src/extension/**/*.ts": () => "just lint extension",
  "src/web-view/**/*.{ts,tsx}": () => "just lint web-view",
  "**/*.{json,yml,yaml,md}": () => "just lint config",
  justfile: () => "just lint justfile",
};
