import tseslint from "typescript-eslint";

import { baseConfig, basePlugins, baseRules } from "../eslint.config.base.js";

export default [
  ...baseConfig,
  {
    ignores: ["**/__mocks__/**", "**/*.config.*", "**/view/**"],
  },
  {
    files: ["extension/main.ts", "internal/**/*.ts", "pkg/**/*.ts", "shared/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        project: "./extension/tsconfig.json",
        sourceType: "module",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: basePlugins,
    rules: {
      ...baseRules,
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/interface-name-prefix": "off",
    },
  },
  {
    files: ["tests/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: basePlugins,
    rules: {
      ...baseRules,
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
    },
  },
];
