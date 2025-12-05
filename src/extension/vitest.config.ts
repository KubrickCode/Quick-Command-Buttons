import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extModules = path.resolve(__dirname, "node_modules");

// Workaround: pnpm symlinks not resolved by vitest ESM
const extensionDeps = [
  "@indic-transliteration/sanscript",
  "convert-layout",
  "tiny-pinyin",
  "wanakana",
  "zustand",
  "zundo",
];

export default defineConfig({
  resolve: {
    alias: Object.fromEntries(extensionDeps.map((d) => [d, path.join(extModules, d)])),
  },
  test: {
    clearMocks: true,
    coverage: {
      include: ["extension/**/*.ts", "internal/**/*.ts", "pkg/**/*.ts"],
      exclude: ["**/*.d.ts", "**/*.spec.ts", "**/__mocks__/**"],
      reportsDirectory: "extension/coverage",
      reporter: ["text", "lcov", "html", "json"],
    },
    environment: "node",
    exclude: ["view/**/*", "**/node_modules/**"],
    globals: true,
    include: ["**/*.spec.ts"],
    restoreMocks: true,
    root: "..",
    alias: {
      vscode: path.resolve(__dirname, "__mocks__/vscode.js"),
    },
  },
});
