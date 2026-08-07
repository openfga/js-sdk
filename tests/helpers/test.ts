import assert from "node:assert/strict";

const matcherType = Symbol("matcherType");

type MatcherType = "any" | "arrayContaining" | "objectContaining";
// Constructors may have arbitrary signatures, but only their prototype is used for matching.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: any[]) => unknown;

interface Matcher {
  [matcherType]: MatcherType;
}

export interface AnyMatcher extends Matcher {
  expectedConstructor: Constructor;
}

export interface ArrayContainingMatcher extends Matcher {
  expected: unknown[];
}

export interface ObjectContainingMatcher extends Matcher {
  expected: Record<string, unknown>;
}

export interface Spy {
  calls: unknown[][];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mockImplementation(implementation?: (...args: any[]) => unknown): this;
  mockResolvedValue(value: unknown): this;
  mockReturnValue(value: unknown): this;
  mockRestore(): void;
}

function isMatcher(value: unknown): value is Matcher {
  return typeof value === "object" && value !== null && matcherType in value;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function matches(actual: unknown, expected: unknown, partialObjects = false): boolean {
  if (isMatcher(expected)) {
    switch (expected[matcherType]) {
    case "any": {
      const constructor = (expected as AnyMatcher).expectedConstructor;
      if (constructor === String) {
        return typeof actual === "string" || actual instanceof String;
      }
      if (constructor === Number) {
        return typeof actual === "number" || actual instanceof Number;
      }
      if (constructor === Boolean) {
        return typeof actual === "boolean" || actual instanceof Boolean;
      }
      if (constructor === Function) {
        return typeof actual === "function";
      }
      if (constructor === Object) {
        return (typeof actual === "object" && actual !== null) || typeof actual === "function";
      }
      return actual instanceof constructor;
    }
    case "arrayContaining": {
      if (!Array.isArray(actual)) {
        return false;
      }
      return (expected as ArrayContainingMatcher).expected.every((item) =>
        actual.some((actualItem) => matches(actualItem, item, true)),
      );
    }
    case "objectContaining": {
      if (!isRecord(actual)) {
        return false;
      }
      return Object.entries((expected as ObjectContainingMatcher).expected).every(([key, value]) =>
        key in actual && matches(actual[key], value, true),
      );
    }
    }
  }

  if (Object.is(actual, expected)) {
    return true;
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (!partialObjects && actual.length !== expected.length) {
      return false;
    }
    if (actual.length < expected.length) {
      return false;
    }
    return expected.every((item, index) => matches(actual[index], item, partialObjects));
  }

  if (Array.isArray(actual) && isRecord(expected) && partialObjects) {
    return false;
  }

  if (isRecord(actual) && isRecord(expected)) {
    const expectedEntries = Object.entries(expected);
    if (!partialObjects && Object.keys(actual).length !== expectedEntries.length) {
      return false;
    }
    return expectedEntries.every(([key, value]) => key in actual && matches(actual[key], value, partialObjects));
  }

  return false;
}

function containsMatcher(value: unknown): boolean {
  if (isMatcher(value)) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.some(containsMatcher);
  }
  if (isRecord(value)) {
    return Object.values(value).some(containsMatcher);
  }
  return false;
}

function assertMatches(actual: unknown, expected: unknown, partialObjects = false): void {
  if (!partialObjects && !containsMatcher(expected)) {
    assert.deepStrictEqual(actual, expected);
    return;
  }
  assert.ok(matches(actual, expected, partialObjects), "Expected values to match");
}

function thrownBy(actual: unknown): unknown {
  assert.equal(typeof actual, "function", "toThrow expects a function");
  try {
    (actual as () => unknown)();
  } catch (error) {
    return error;
  }
  assert.fail("Expected function to throw");
}

function assertThrownMatches(error: unknown, expected?: unknown): void {
  if (expected === undefined) {
    return;
  }
  if (typeof expected === "string") {
    assert.match(String((error as Error).message), new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    return;
  }
  if (expected instanceof RegExp) {
    assert.match(String((error as Error).message), expected);
    return;
  }
  if (typeof expected === "function") {
    assert.ok(error instanceof (expected as Constructor));
    return;
  }
  if (expected instanceof Error) {
    assert.equal((error as Error).message, expected.message);
    return;
  }
  assert.fail("Unsupported toThrow expectation");
}

function assertSpy(actual: unknown): asserts actual is Spy {
  assert.ok(
    typeof actual === "object" && actual !== null && "calls" in actual,
    "Expected a spy created by spyOn",
  );
}

export interface Expectation {
  readonly not: Pick<Expectation, "toThrow">;
  readonly rejects: Pick<Expectation, "toThrow">;
  readonly resolves: Pick<Expectation, "toEqual">;
  toBe(expected: unknown): void;
  toBeDefined(): void;
  toBeGreaterThan(expected: number): void;
  toBeInstanceOf(expected: Constructor): void;
  toBeLessThan(expected: number): void;
  toBeUndefined(): void;
  toEqual(expected: unknown): void;
  toHaveBeenCalled(): void;
  toHaveBeenCalledTimes(expected: number): void;
  toHaveBeenCalledWith(...expected: unknown[]): void;
  toHaveLength(expected: number): void;
  toHaveProperty(expected: string): void;
  toMatch(expected: RegExp): void;
  toMatchObject(expected: unknown): void;
  toThrow(expected?: unknown): void;
}

export interface Expect {
  (actual: unknown): Expectation;
  any(constructor: Constructor): AnyMatcher;
  arrayContaining(expected: unknown[]): ArrayContainingMatcher;
  objectContaining(expected: Record<string, unknown>): ObjectContainingMatcher;
}

export const expect: Expect = Object.assign(
  (actual: unknown): Expectation => ({
    not: {
      toThrow(expected?: unknown): void {
        try {
          const error = thrownBy(actual);
          try {
            assertThrownMatches(error, expected);
          } catch {
            return;
          }
        } catch (error) {
          if ((error as Error).message === "Expected function to throw") {
            return;
          }
          throw error;
        }
        assert.fail("Expected function not to throw");
      },
    },
    rejects: {
      async toThrow(expected?: unknown): Promise<void> {
        const promise = typeof actual === "function" ? actual() : actual;
        assert.ok(promise instanceof Promise, "rejects expects a promise or promise-returning function");
        try {
          await promise;
        } catch (error) {
          assertThrownMatches(error, expected);
          return;
        }
        assert.fail("Expected promise to reject");
      },
    },
    resolves: {
      async toEqual(expected: unknown): Promise<void> {
        assert.ok(actual instanceof Promise, "resolves expects a promise");
        assertMatches(await actual, expected);
      },
    },
    toBe(expected: unknown): void {
      assert.strictEqual(actual, expected);
    },
    toBeDefined(): void {
      assert.notStrictEqual(actual, undefined);
    },
    toBeGreaterThan(expected: number): void {
      assert.ok((actual as number) > expected);
    },
    toBeInstanceOf(expected: Constructor): void {
      assert.ok(actual instanceof expected);
    },
    toBeLessThan(expected: number): void {
      assert.ok((actual as number) < expected);
    },
    toBeUndefined(): void {
      assert.strictEqual(actual, undefined);
    },
    toEqual(expected: unknown): void {
      assertMatches(actual, expected);
    },
    toHaveBeenCalled(): void {
      assertSpy(actual);
      assert.ok(actual.calls.length > 0);
    },
    toHaveBeenCalledTimes(expected: number): void {
      assertSpy(actual);
      assert.equal(actual.calls.length, expected);
    },
    toHaveBeenCalledWith(...expected: unknown[]): void {
      assertSpy(actual);
      assert.ok(
        actual.calls.some((args) => args.length === expected.length && args.every((arg, index) => matches(arg, expected[index], true))),
        "Expected spy to be called with matching arguments",
      );
    },
    toHaveLength(expected: number): void {
      assert.equal((actual as { length: number }).length, expected);
    },
    toHaveProperty(expected: string): void {
      assert.ok(isRecord(actual) && expected in actual);
    },
    toMatch(expected: RegExp): void {
      assert.match(String(actual), expected);
    },
    toMatchObject(expected: unknown): void {
      assertMatches(actual, expected, true);
    },
    toThrow(expected?: unknown): void {
      assertThrownMatches(thrownBy(actual), expected);
    },
  }),
  {
    any(constructor: Constructor): AnyMatcher {
      return { [matcherType]: "any", expectedConstructor: constructor };
    },
    arrayContaining(expected: unknown[]): ArrayContainingMatcher {
      return { [matcherType]: "arrayContaining", expected };
    },
    objectContaining(expected: Record<string, unknown>): ObjectContainingMatcher {
      return { [matcherType]: "objectContaining", expected };
    },
  },
);

export function spyOn<T extends object, K extends keyof T>(target: T, key: K): Spy {
  const original = target[key];
  assert.equal(typeof original, "function", `Cannot spy on ${String(key)} because it is not a function`);

  const calls: unknown[][] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let implementation = original as (...args: any[]) => unknown;
  const spy: Spy = {
    calls,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockImplementation(nextImplementation: (...args: any[]) => unknown = () => undefined): Spy {
      implementation = nextImplementation;
      return spy;
    },
    mockResolvedValue(value: unknown): Spy {
      implementation = () => Promise.resolve(value);
      return spy;
    },
    mockReturnValue(value: unknown): Spy {
      implementation = () => value;
      return spy;
    },
    mockRestore(): void {
      target[key] = original;
    },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target[key] = function (this: unknown, ...args: any[]): unknown {
    calls.push(args);
    return implementation.apply(this, args);
  } as T[K];

  return spy;
}
