import { mkdirSync, rmSync } from "node:fs";

const testOutput = new URL("../.test-dist/", import.meta.url);
const coverageOutput = new URL("../coverage/", import.meta.url);

rmSync(testOutput, { recursive: true, force: true });
rmSync(coverageOutput, { recursive: true, force: true });
mkdirSync(coverageOutput, { recursive: true });
