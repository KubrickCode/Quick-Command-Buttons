import { calculateButtonPriority, createTooltipText } from "./status-bar-manager";
import { ButtonConfig } from "./types";

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

  describe("createTooltipText", () => {
    it("should return button name with options text for group buttons", () => {
      const button: ButtonConfig = {
        name: "Test Group",
        group: [
          { name: "Child 1", command: "echo test1" },
          { name: "Child 2", command: "echo test2" }
        ]
      };

      const result = createTooltipText(button);
      expect(result).toBe("Test Group (Click to see options)");
    });

    it("should return command when button has command and no group", () => {
      const button: ButtonConfig = {
        name: "Test Button",
        command: "echo hello"
      };

      const result = createTooltipText(button);
      expect(result).toBe("echo hello");
    });

    it("should return button name when button has no command and no group", () => {
      const button: ButtonConfig = {
        name: "Test Button"
      };

      const result = createTooltipText(button);
      expect(result).toBe("Test Button");
    });

    it("should return button name with options text for empty group", () => {
      const button: ButtonConfig = {
        name: "Empty Group",
        group: []
      };

      const result = createTooltipText(button);
      expect(result).toBe("Empty Group (Click to see options)");
    });

    it("should prioritize group over command when both exist", () => {
      const button: ButtonConfig = {
        name: "Mixed Button",
        command: "echo test",
        group: [{ name: "Child", command: "echo child" }]
      };

      const result = createTooltipText(button);
      expect(result).toBe("Mixed Button (Click to see options)");
    });
  });
});