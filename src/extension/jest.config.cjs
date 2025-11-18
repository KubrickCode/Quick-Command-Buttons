/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/../tests"],
  testMatch: ["**/*.spec.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  collectCoverageFrom: [
    "../extension/**/*.ts",
    "../internal/**/*.ts",
    "../pkg/**/*.ts",
    "!**/*.d.ts",
    "!**/*.spec.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleDirectories: ["node_modules", "<rootDir>/node_modules"],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  moduleNameMapper: {
    "^vscode$": "<rootDir>/__mocks__/vscode.js",
  },
};
