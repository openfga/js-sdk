import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

function findTestFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      return findTestFiles(path);
    }
    return entry.name.endsWith(".test.js") ? [path] : [];
  });
}

const testDirectory = join(process.cwd(), ".test-dist", "tests");
const testFiles = findTestFiles(testDirectory).sort();
const setupFile = pathToFileURL(join(testDirectory, "setup.js")).href;
const coverageSupported = process.allowedNodeEnvironmentFlags.has("--test-coverage-exclude");
const coverageArguments = coverageSupported ? [
  "--experimental-test-coverage",
  "--test-coverage-exclude=**/tests/**",
  "--test-reporter=spec",
  "--test-reporter-destination=stdout",
  "--test-reporter=lcov",
  "--test-reporter-destination=coverage/lcov.info",
] : [
  "--test-reporter=spec",
];

const result = spawnSync(process.execPath, [
  "--enable-source-maps",
  `--import=${setupFile}`,
  "--test",
  ...coverageArguments,
  ...testFiles,
], { stdio: "inherit" });

if (result.error) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
