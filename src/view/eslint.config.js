import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

import { baseConfig, basePlugins, baseRules } from "../../eslint.config.base.js";

export default [
  ...baseConfig,
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    ignores: ["dist", ".eslintrc.cjs", "**/*.generated.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        project: "./tsconfig.app.json",
        sourceType: "module",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      ...basePlugins,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...baseRules,
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "import/order": [
        "error",
        {
          alphabetize: {
            caseInsensitive: true,
            order: "asc",
          },
          groups: [
            ["builtin", "external"],
            ["internal"],
            ["parent", "sibling", "index"],
          ],
          "newlines-between": "always",
          pathGroups: [
            {
              group: "internal",
              pattern: "~/**",
            },
          ],
        },
      ],
      "perfectionist/sort-jsx-props": [
        "error",
        {
          order: "asc",
          type: "alphabetical",
        },
      ],
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react/jsx-sort-props": "error",
    },
  },
];
