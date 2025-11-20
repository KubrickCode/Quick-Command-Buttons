import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import perfectionist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

export const baseRules = {
  "@typescript-eslint/consistent-type-definitions": ["error", "type"],
  "@typescript-eslint/no-explicit-any": "warn",
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
};

export const basePlugins = {
  "@typescript-eslint": tseslint.plugin,
  import: importPlugin,
  perfectionist,
};

export const baseConfig = [
  {
    ignores: ["**/node_modules/**", "**/out/**", "**/dist/**", "**/coverage/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];
