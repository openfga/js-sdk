"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const node_test_1 = require("node:test");
const expect_1 = require("./helpers/expect");
(0, node_test_1.describe)("errors.ts", () => {
    (0, node_test_1.describe)("FgaError", () => {
        (0, node_test_1.test)("should use explicit message when msg argument is provided", () => {
            const err = new errors_1.FgaError(new Error("wrapped-error"), "explicit-message");
            (0, expect_1.expect)(err.message).toBe("explicit-message");
        });
        (0, node_test_1.test)("should derive message from string err when msg is not provided", () => {
            const err = new errors_1.FgaError("string-error");
            (0, expect_1.expect)(err.message).toBe("string-error");
        });
        (0, node_test_1.test)("should derive message from Error err when msg is not provided", () => {
            const err = new errors_1.FgaError(new Error("inner"));
            (0, expect_1.expect)(err.message).toBe("FGA Error: inner");
        });
        (0, node_test_1.test)("should preserve empty string msg", () => {
            const err = new errors_1.FgaError(new Error("inner"), "");
            (0, expect_1.expect)(err.message).toBe("");
        });
    });
});
//# sourceMappingURL=errors.test.js.map