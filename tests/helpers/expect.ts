import assert from "node:assert/strict";
import { inspect, isDeepStrictEqual } from "node:util";

const asymmetricMatcher = Symbol("asymmetricMatcher");

type Constructor = (abstract new (...args: never[]) => unknown) & { name: string };

interface AsymmetricMatcher {
  [asymmetricMatcher](actual: unknown): boolean;
  description: string;
}

interface MockCall {
  arguments: unknown[];
}

interface MockFunction {
  mock: {
    calls: MockCall[];
    callCount(): number;
  };
}

function matcher(description: string, matches: (actual: unknown) => boolean): AsymmetricMatcher {
  return {
    [asymmetricMatcher]: matches,
    description,
  };
}

function isAsymmetricMatcher(value: unknown): value is AsymmetricMatcher {
  return typeof value === "object" && value !== null && asymmetricMatcher in value;
}

function containsAsymmetricMatcher(value: unknown): boolean {
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

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === null || prototype === Object.prototype;
}

function matches(actual: unknown, expected: unknown, partial = false): boolean {
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
      return isDeepStrictEqual(actual, expected);
    }

    const expectedEntries = Object.entries(expected)
      .filter(([, value]) => partial || value !== undefined);
    const actualKeys = Object.keys(actual)
      .filter(key => partial || (actual as Record<string, unknown>)[key] !== undefined);
    return (partial || actualKeys.length === expectedEntries.length)
      && expectedEntries.every(([key, value]) => key in actual && matches((actual as Record<string, unknown>)[key], value, partial));
  }

  return Object.is(actual, expected);
}

function mismatchMessage(actual: unknown, expected: unknown): string {
  const inspectOptions = { depth: null, sorted: true } as const;
  return `Expected:\n${inspect(expected, inspectOptions)}\nActual:\n${inspect(actual, inspectOptions)}`;
}

function assertEqual(actual: unknown, expected: unknown): void {
  if (containsAsymmetricMatcher(expected)) {
    assert.ok(matches(actual, expected), mismatchMessage(actual, expected));
    return;
  }
  assert.deepStrictEqual(actual, expected);
}

function assertThrownMatches(error: unknown, expected?: unknown): void {
  if (expected === undefined) {
    return;
  }
  if (typeof expected === "string") {
    assert.ok(error instanceof Error && error.message.includes(expected), `expected error message to include ${JSON.stringify(expected)}`);
    return;
  }
  if (expected instanceof RegExp) {
    assert.ok(error instanceof Error && expected.test(error.message), `expected error message to match ${expected}`);
    return;
  }
  if (typeof expected === "function") {
    assert.ok(error instanceof (expected as Constructor), `expected error to be an instance of ${(expected as Constructor).name}`);
    return;
  }
  if (expected instanceof Error) {
    assert.ok(error instanceof Error);
    assert.strictEqual(error.message, expected.message);
    return;
  }
  assertEqual(error, expected);
}

function assertThrows(actual: unknown, expected?: unknown): void {
  assert.strictEqual(typeof actual, "function", "expected a function that throws");
  let thrown: unknown;
  let didThrow = false;
  try {
    (actual as () => unknown)();
  } catch (error) {
    thrown = error;
    didThrow = true;
  }
  assert.ok(didThrow, "expected function to throw");
  assertThrownMatches(thrown, expected);
}

function asMockFunction(actual: unknown): MockFunction {
  assert.strictEqual(typeof actual, "function", "expected a node:test mock function");
  assert.ok((actual as Partial<MockFunction>).mock, "expected a node:test mock function");
  return actual as MockFunction;
}

export function expect(actual: unknown) {
  return {
    toBe(expected: unknown): void {
      assert.strictEqual(actual, expected);
    },
    toEqual(expected: unknown): void {
      assertEqual(actual, expected);
    },
    toMatchObject(expected: unknown): void {
      assert.ok(matches(actual, expected, true), mismatchMessage(actual, expected));
    },
    toHaveLength(expected: number): void {
      assert.ok(actual !== null && actual !== undefined && "length" in Object(actual));
      assert.strictEqual((actual as { length: number }).length, expected);
    },
    toBeInstanceOf(expected: Constructor): void {
      assert.ok(actual instanceof expected);
    },
    toBeUndefined(): void {
      assert.strictEqual(actual, undefined);
    },
    toBeDefined(): void {
      assert.notStrictEqual(actual, undefined);
    },
    toBeLessThan(expected: number): void {
      assert.ok(typeof actual === "number" && actual < expected);
    },
    toBeGreaterThan(expected: number): void {
      assert.ok(typeof actual === "number" && actual > expected);
    },
    toMatch(expected: string | RegExp): void {
      assert.strictEqual(typeof actual, "string");
      const actualString = actual as string;
      assert.ok(typeof expected === "string" ? actualString.includes(expected) : expected.test(actualString));
    },
    toHaveProperty(expected: string): void {
      assert.ok(actual !== null && typeof actual === "object" && expected in actual);
    },
    toHaveBeenCalled(): void {
      assert.ok(asMockFunction(actual).mock.callCount() > 0);
    },
    toHaveBeenCalledTimes(expected: number): void {
      assert.strictEqual(asMockFunction(actual).mock.callCount(), expected);
    },
    toHaveBeenCalledWith(...expected: unknown[]): void {
      const calls = asMockFunction(actual).mock.calls;
      assert.ok(calls.some(call => matches(call.arguments, expected)), "mock was not called with the expected arguments");
    },
    toThrow(expected?: unknown): void {
      assertThrows(actual, expected);
    },
    not: {
      toBe(expected: unknown): void {
        assert.notStrictEqual(actual, expected);
      },
      toThrow(): void {
        assert.doesNotThrow(actual as () => unknown);
      },
    },
    resolves: {
      async toEqual(expected: unknown): Promise<void> {
        assertEqual(await Promise.resolve(actual), expected);
      },
    },
    rejects: {
      async toThrow(expected?: unknown): Promise<void> {
        let thrown: unknown;
        let didThrow = false;
        try {
          await Promise.resolve(typeof actual === "function" ? (actual as () => unknown)() : actual);
        } catch (error) {
          thrown = error;
          didThrow = true;
        }
        assert.ok(didThrow, "expected promise to reject");
        assertThrownMatches(thrown, expected);
      },
    },
  };
}

expect.any = (expected: Constructor): any => matcher(`any ${expected.name}`, actual => {
  if (expected === String) return typeof actual === "string";
  if (expected === Number) return typeof actual === "number";
  if (expected === Boolean) return typeof actual === "boolean";
  if (expected === Object) return actual !== null && (typeof actual === "object" || typeof actual === "function");
  return actual instanceof expected;
});

expect.objectContaining = (expected: Record<string, unknown>): any =>
  matcher("object containing expected properties", actual => matches(actual, expected, true));

expect.arrayContaining = (expected: unknown[]): any => matcher("array containing expected values", actual =>
  Array.isArray(actual) && expected.every(expectedValue => actual.some(actualValue => matches(actualValue, expectedValue))));
