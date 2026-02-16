import { FgaError } from "../errors";

describe("errors.ts", () => {
  describe("FgaError", () => {
    test("should use explicit message when msg argument is provided", () => {
      const err = new FgaError(new Error("wrapped-error"), "explicit-message");

      expect(err.message).toBe("explicit-message");
    });
  });
});
