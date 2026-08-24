"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expect = expect;
const strict_1 = __importDefault(require("node:assert/strict"));
const node_util_1 = require("node:util");
const asymmetricMatcher = Symbol("asymmetricMatcher");
function matcher(description, matches) {
    return {
        [asymmetricMatcher]: matches,
        description,
    };
}
function isAsymmetricMatcher(value) {
    return typeof value === "object" && value !== null && asymmetricMatcher in value;
}
function containsAsymmetricMatcher(value) {
    if (isAsymmetricMatcher(value)) {
        return true;
    }
    if (Array.isArray(value)) {
        return value.some(containsAsymmetricMatcher);
    }
    if (value !== null && typeof value === "object") {
        return Object.values(value).some(containsAsymmetricMatcher);
    }
    return false;
}
function isPlainObject(value) {
    const prototype = Object.getPrototypeOf(value);
    return prototype === null || prototype === Object.prototype;
}
function matches(actual, expected, partial = false) {
    if (isAsymmetricMatcher(expected)) {
        return expected[asymmetricMatcher](actual);
    }
    if (Array.isArray(expected)) {
        return Array.isArray(actual)
            && actual.length === expected.length
            && expected.every((value, index) => matches(actual[index], value, partial));
    }
    if (expected !== null && typeof expected === "object") {
        if (actual === null || typeof actual !== "object") {
            return false;
        }
        if (!isPlainObject(expected)) {
            return (0, node_util_1.isDeepStrictEqual)(actual, expected);
        }
        const expectedEntries = Object.entries(expected)
            .filter(([, value]) => partial || value !== undefined);
        const actualKeys = Object.keys(actual)
            .filter(key => partial || actual[key] !== undefined);
        return (partial || actualKeys.length === expectedEntries.length)
            && expectedEntries.every(([key, value]) => key in actual && matches(actual[key], value, partial));
    }
    return Object.is(actual, expected);
}
function mismatchMessage(actual, expected) {
    const inspectOptions = { depth: null, sorted: true };
    return `Expected:\n${(0, node_util_1.inspect)(expected, inspectOptions)}\nActual:\n${(0, node_util_1.inspect)(actual, inspectOptions)}`;
}
function assertEqual(actual, expected) {
    if (containsAsymmetricMatcher(expected)) {
        strict_1.default.ok(matches(actual, expected), mismatchMessage(actual, expected));
        return;
    }
    strict_1.default.deepStrictEqual(actual, expected);
}
function assertThrownMatches(error, expected) {
    if (expected === undefined) {
        return;
    }
    if (typeof expected === "string") {
        strict_1.default.ok(error instanceof Error && error.message.includes(expected), `expected error message to include ${JSON.stringify(expected)}`);
        return;
    }
    if (expected instanceof RegExp) {
        strict_1.default.ok(error instanceof Error && expected.test(error.message), `expected error message to match ${expected}`);
        return;
    }
    if (typeof expected === "function") {
        strict_1.default.ok(error instanceof expected, `expected error to be an instance of ${expected.name}`);
        return;
    }
    if (expected instanceof Error) {
        strict_1.default.ok(error instanceof Error);
        strict_1.default.strictEqual(error.message, expected.message);
        return;
    }
    assertEqual(error, expected);
}
function assertThrows(actual, expected) {
    strict_1.default.strictEqual(typeof actual, "function", "expected a function that throws");
    let thrown;
    let didThrow = false;
    try {
        actual();
    }
    catch (error) {
        thrown = error;
        didThrow = true;
    }
    strict_1.default.ok(didThrow, "expected function to throw");
    assertThrownMatches(thrown, expected);
}
function asMockFunction(actual) {
    strict_1.default.strictEqual(typeof actual, "function", "expected a node:test mock function");
    strict_1.default.ok(actual.mock, "expected a node:test mock function");
    return actual;
}
function expect(actual) {
    return {
        toBe(expected) {
            strict_1.default.strictEqual(actual, expected);
        },
        toEqual(expected) {
            assertEqual(actual, expected);
        },
        toMatchObject(expected) {
            strict_1.default.ok(matches(actual, expected, true), mismatchMessage(actual, expected));
        },
        toHaveLength(expected) {
            strict_1.default.ok(actual !== null && actual !== undefined && "length" in Object(actual));
            strict_1.default.strictEqual(actual.length, expected);
        },
        toBeInstanceOf(expected) {
            strict_1.default.ok(actual instanceof expected);
        },
        toBeUndefined() {
            strict_1.default.strictEqual(actual, undefined);
        },
        toBeDefined() {
            strict_1.default.notStrictEqual(actual, undefined);
        },
        toBeLessThan(expected) {
            strict_1.default.ok(typeof actual === "number" && actual < expected);
        },
        toBeGreaterThan(expected) {
            strict_1.default.ok(typeof actual === "number" && actual > expected);
        },
        toMatch(expected) {
            strict_1.default.strictEqual(typeof actual, "string");
            const actualString = actual;
            strict_1.default.ok(typeof expected === "string" ? actualString.includes(expected) : expected.test(actualString));
        },
        toHaveProperty(expected) {
            strict_1.default.ok(actual !== null && typeof actual === "object" && expected in actual);
        },
        toHaveBeenCalled() {
            strict_1.default.ok(asMockFunction(actual).mock.callCount() > 0);
        },
        toHaveBeenCalledTimes(expected) {
            strict_1.default.strictEqual(asMockFunction(actual).mock.callCount(), expected);
        },
        toHaveBeenCalledWith(...expected) {
            const calls = asMockFunction(actual).mock.calls;
            strict_1.default.ok(calls.some(call => matches(call.arguments, expected)), "mock was not called with the expected arguments");
        },
        toThrow(expected) {
            assertThrows(actual, expected);
        },
        not: {
            toBe(expected) {
                strict_1.default.notStrictEqual(actual, expected);
            },
            toThrow() {
                strict_1.default.doesNotThrow(actual);
            },
        },
        resolves: {
            async toEqual(expected) {
                assertEqual(await Promise.resolve(actual), expected);
            },
        },
        rejects: {
            async toThrow(expected) {
                let thrown;
                let didThrow = false;
                try {
                    await Promise.resolve(typeof actual === "function" ? actual() : actual);
                }
                catch (error) {
                    thrown = error;
                    didThrow = true;
                }
                strict_1.default.ok(didThrow, "expected promise to reject");
                assertThrownMatches(thrown, expected);
            },
        },
    };
}
expect.any = (expected) => matcher(`any ${expected.name}`, actual => {
    if (expected === String)
        return typeof actual === "string";
    if (expected === Number)
        return typeof actual === "number";
    if (expected === Boolean)
        return typeof actual === "boolean";
    if (expected === Object)
        return actual !== null && (typeof actual === "object" || typeof actual === "function");
    return actual instanceof expected;
});
expect.objectContaining = (expected) => matcher("object containing expected properties", actual => matches(actual, expected, true));
expect.arrayContaining = (expected) => matcher("array containing expected values", actual => Array.isArray(actual) && expected.every(expectedValue => actual.some(actualValue => matches(actualValue, expectedValue))));
//# sourceMappingURL=expect.js.map