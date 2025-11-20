export default [
  {
    ignores: ["**/node_modules/**", "**/out/**", "**/dist/**"],
  },
  // The view package is excluded to use its own settings.
  {
    ignores: ["src/view/**"],
  },
];
