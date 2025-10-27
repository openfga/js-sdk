import { isWellFormedUlidString } from "../validation";

describe("validation.ts", () => {
  describe("isWellFormedUlidString", () => {
    it("should return true on valid ulids", async () => {
      const ulids: string[] = [
        "01H0GVCS1HCQM6SJRJ4A026FZ9",
        "01H0GVD9ACPFKGMWJV0Y93ZM7H",
        "01H0GVDH0FRZ4WAFED6T9KZYZR",
        "01H0GVDSW72AZ8QV3R0HJ91QBX",
      ];
      ulids.forEach(ulid => {
        const result = isWellFormedUlidString(ulid);
        expect(result).toBe(true);
      });
    });

    it("should return false on invalid ulids", async () => {
      const ulids: string[] = [
        "abc",
        123 as any,
        null,
        "01H0GVDSW72AZ8QV3R0HJ91QBXa",
        "b523ad13-8adb-4803-a6db-013ac50197ca",
        "9240BFC0-DA00-457B-A328-FC370A598D60",
      ];
      ulids.forEach(ulid => {
        const result = isWellFormedUlidString(ulid);
        expect(result).toBe(false);
      });
    });
  });
});
