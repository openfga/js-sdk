"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validation_1 = require("../validation");
const node_test_1 = require("node:test");
const expect_1 = require("./helpers/expect");
(0, node_test_1.describe)("validation.ts", () => {
    (0, node_test_1.describe)("isWellFormedUlidString", () => {
        (0, node_test_1.it)("should return true on valid ulids", async () => {
            const ulids = [
                "01H0GVCS1HCQM6SJRJ4A026FZ9",
                "01H0GVD9ACPFKGMWJV0Y93ZM7H",
                "01H0GVDH0FRZ4WAFED6T9KZYZR",
                "01H0GVDSW72AZ8QV3R0HJ91QBX",
            ];
            ulids.forEach(ulid => {
                const result = (0, validation_1.isWellFormedUlidString)(ulid);
                (0, expect_1.expect)(result).toBe(true);
            });
        });
        (0, node_test_1.it)("should return false on invalid ulids", async () => {
            const ulids = [
                "abc",
                123,
                null,
                "01H0GVDSW72AZ8QV3R0HJ91QBXa",
                "b523ad13-8adb-4803-a6db-013ac50197ca",
                "9240BFC0-DA00-457B-A328-FC370A598D60",
            ];
            ulids.forEach(ulid => {
                const result = (0, validation_1.isWellFormedUlidString)(ulid);
                (0, expect_1.expect)(result).toBe(false);
            });
        });
    });
});
//# sourceMappingURL=validation.test.js.map