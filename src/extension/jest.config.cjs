/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "<rootDir>/extension/**/*.ts",
    "<rootDir>/internal/**/*.ts",
    "<rootDir>/pkg/**/*.ts",
    "!**/*.d.ts",
    "!**/*.spec.ts",
    "!**/__mocks__/**",
  ],
  coverageDirectory: "<rootDir>/extension/coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleDirectories: [
    "node_modules",
    "<rootDir>/extension/node_modules",
    "<rootDir>/../node_modules",
  ],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^vscode$": "<rootDir>/extension/__mocks__/vscode.js",
  },
  preset: "ts-jest",
  restoreMocks: true,
  rootDir: "..",
  roots: ["<rootDir>/extension", "<rootDir>/internal", "<rootDir>/pkg"],
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/extension/tsconfig.json",
      },
    ],
  },
  transformIgnorePatterns: ["node_modules/(?!(zod)/)"],
  verbose: true,
};
