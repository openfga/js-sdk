import { FgaError } from "../errors";

describe("errors.ts", () => {
  describe("FgaError", () => {
    test("should use explicit message when msg argument is provided", () => {
      const err = new FgaError(new Error("wrapped-error"), "explicit-message");

      expect(err.message).toBe("explicit-message");
    });

    test("should derive message from string err when msg is not provided", () => {
      const err = new FgaError("string-error");

      expect(err.message).toBe("string-error");
    });

    test("should derive message from Error err when msg is not provided", () => {
      const err = new FgaError(new Error("inner"));

      expect(err.message).toBe("FGA Error: inner");
    });

    test("should preserve empty string msg", () => {
      const err = new FgaError(new Error("inner"), "");

      expect(err.message).toBe("");
    });
  });
});
