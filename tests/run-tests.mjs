import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const testDirectory = join(process.cwd(), ".test-dist", "tests");
const testPattern = ".test-dist/tests/**/*.test.js";
const setupFile = pathToFileURL(join(testDirectory, "setup.js")).href;
const coverageArguments = [
  "--experimental-test-coverage",
  "--test-coverage-exclude=**/tests/**",
  "--test-reporter=spec",
  "--test-reporter-destination=stdout",
  "--test-reporter=lcov",
  "--test-reporter-destination=coverage/lcov.info",
];

const result = spawnSync(process.execPath, [
  "--enable-source-maps",
  `--import=${setupFile}`,
  "--test",
  "--test-timeout=30000",
  ...coverageArguments,
  testPattern,
], { stdio: "inherit" });

if (result.error) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
