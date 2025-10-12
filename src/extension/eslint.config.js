import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    ignores: ["dist", "node_modules"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        project: "./tsconfig.json",
        sourceType: "module",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      import: importPlugin,
      perfectionist,
    },
    rules: {
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
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
        },
      ],
      "perfectionist/sort-classes": [
        "error",
        {
          order: "asc",
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-interfaces": [
        "error",
        {
          order: "asc",
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-object-types": [
        "error",
        {
          order: "asc",
          type: "alphabetical",
        },
      ],
      "perfectionist/sort-objects": [
        "error",
        {
          order: "asc",
          partitionByComment: true,
          type: "alphabetical",
        },
      ],
    },
  },
];