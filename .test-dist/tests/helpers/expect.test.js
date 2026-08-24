"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
const node_test_1 = require("node:test");
const expect_1 = require("./expect");
(0, node_test_1.test)("toMatchObject compares non-plain objects by value", () => {
    (0, expect_1.expect)({ values: new Set([1, 2, 3]) }).toMatchObject({ values: new Set([1, 2, 3]) });
    strict_1.default.throws(() => {
        (0, expect_1.expect)({ values: new Set([99]) }).toMatchObject({ values: new Set([1, 2, 3]) });
    });
});
(0, node_test_1.test)("toHaveBeenCalledWith compares Dates by value", () => {
    const callback = node_test_1.mock.fn();
    callback(new Date("2026-01-01T00:00:00.000Z"));
    (0, expect_1.expect)(callback).toHaveBeenCalledWith(new Date("2026-01-01T00:00:00.000Z"));
    strict_1.default.throws(() => {
        (0, expect_1.expect)(callback).toHaveBeenCalledWith(new Date("2026-01-02T00:00:00.000Z"));
    });
});
(0, node_test_1.test)("arrayContaining requires full element equality unless explicitly partial", () => {
    const actual = [{ id: 1, extra: true }];
    strict_1.default.throws(() => {
        (0, expect_1.expect)(actual).toEqual(expect_1.expect.arrayContaining([{ id: 1 }]));
    });
    (0, expect_1.expect)(actual).toEqual(expect_1.expect.arrayContaining([expect_1.expect.objectContaining({ id: 1 })]));
    (0, expect_1.expect)([{ id: 1, extra: undefined }]).toEqual(expect_1.expect.arrayContaining([{ id: 1 }]));
});
(0, node_test_1.test)("toThrow recognizes undefined as a thrown value", () => {
    (0, expect_1.expect)(() => {
        throw undefined;
    }).toThrow();
});
//# sourceMappingURL=expect.test.js.map