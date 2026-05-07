module.exports = {
  preset: "ts-jest",
  rootDir: "../",
  testEnvironment: "node",
  transform: {
    "^.+\\.ts?$": ["ts-jest", { tsconfig: "tests/tsconfig.spec.json" }],
  },
  moduleFileExtensions: ["js", "d.ts", "ts", "json"],
  setupFilesAfterEnv: ["./tests/setup.ts"],
  collectCoverage: true,
  coverageReporters: ["text", "cobertura", "lcov"],
  collectCoverageFrom: [
    "**/**.{ts,tsx,js,jsx}",
    "!**/**.d.ts",
    "!**/**.eslintrc.js",
    "!eslint.config.*",
    "!**/coverage/**",
    "!**/dist/**",
    "!**/example/**",
    "!**/node_modules/**",
    "!**/tests/**",
  ],
};
