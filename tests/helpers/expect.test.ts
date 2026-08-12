import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { expect } from "./expect";

test("toMatchObject compares non-plain objects by value", () => {
  expect({ values: new Set([1, 2, 3]) }).toMatchObject({ values: new Set([1, 2, 3]) });
  assert.throws(() => {
    expect({ values: new Set([99]) }).toMatchObject({ values: new Set([1, 2, 3]) });
  });
});

test("toHaveBeenCalledWith compares Dates by value", () => {
  const callback = mock.fn();
  callback(new Date("2026-01-01T00:00:00.000Z"));

  expect(callback).toHaveBeenCalledWith(new Date("2026-01-01T00:00:00.000Z"));
  assert.throws(() => {
    expect(callback).toHaveBeenCalledWith(new Date("2026-01-02T00:00:00.000Z"));
  });
});

test("arrayContaining requires full element equality unless explicitly partial", () => {
  const actual = [{ id: 1, extra: true }];

  assert.throws(() => {
    expect(actual).toEqual(expect.arrayContaining([{ id: 1 }]));
  });
  expect(actual).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1 })]));
  expect([{ id: 1, extra: undefined }]).toEqual(expect.arrayContaining([{ id: 1 }]));
});

test("toThrow recognizes undefined as a thrown value", () => {
  expect(() => {
    throw undefined;
  }).toThrow();
});
