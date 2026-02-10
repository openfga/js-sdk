module.exports = {
  preset: "ts-jest",
  rootDir: "../",
  testEnvironment: "node",
  moduleFileExtensions: ["js", "d.ts", "ts", "json"],
  collectCoverage: true,
  coverageReporters: ["text", "cobertura", "lcov"],
  collectCoverageFrom: [
    "**/**.{ts,tsx,js,jsx}",
    "!**/**.d.ts",
    "!**/**.eslintrc.js",
    "!**/coverage/**",
    "!**/dist/**",
    "!**/example/**",
    "!**/node_modules/**",
    "!**/tests/**",
  ],
  transformIgnorePatterns: [
    "node_modules/(?!jose)",
  ],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "ts-jest",
  },
};
