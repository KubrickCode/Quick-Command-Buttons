import { calculateButtonPriority } from "./status-bar-manager";

describe("status-bar-manager", () => {
  describe("calculateButtonPriority", () => {
    it("should calculate priority for index 0", () => {
      const result = calculateButtonPriority(0);
      expect(result).toBe(1000);
    });

    it("should calculate priority for positive index", () => {
      const result = calculateButtonPriority(5);
      expect(result).toBe(995);
    });

    it("should calculate priority for large index", () => {
      const result = calculateButtonPriority(500);
      expect(result).toBe(500);
    });

    it("should handle negative index", () => {
      const result = calculateButtonPriority(-1);
      expect(result).toBe(1001);
    });

    it("should maintain descending order for sequential indices", () => {
      const priority0 = calculateButtonPriority(0);
      const priority1 = calculateButtonPriority(1);
      const priority2 = calculateButtonPriority(2);

      expect(priority0).toBeGreaterThan(priority1);
      expect(priority1).toBeGreaterThan(priority2);
    });
  });
});