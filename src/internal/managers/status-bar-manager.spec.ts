import { ButtonConfig } from "../../pkg/types";
import {
  calculateButtonPriority,
  createTooltipText,
  createButtonCommand,
  configureRefreshButton,
} from "./status-bar-manager";

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
        group: [
          { command: "echo test1", id: "child-1", name: "Child 1" },
          { command: "echo test2", id: "child-2", name: "Child 2" },
        ],
        id: "test-group",
        name: "Test Group",
      };

      const result = createTooltipText(button);
      expect(result).toBe("Test Group (Click to see options)");
    });

    it("should return command when button has command and no group", () => {
      const button: ButtonConfig = {
        command: "echo hello",
        id: "test-btn",
        name: "Test Button",
      };

      const result = createTooltipText(button);
      expect(result).toBe("echo hello");
    });

    it("should return button name when button has no command and no group", () => {
      // Testing invalid configuration scenario
      const button = {
        id: "test-btn",
        name: "Test Button",
      } as unknown as ButtonConfig;

      const result = createTooltipText(button);
      expect(result).toBe("Test Button");
    });

    it("should return button name with options text for empty group", () => {
      const button: ButtonConfig = {
        group: [],
        id: "empty-group",
        name: "Empty Group",
      };

      const result = createTooltipText(button);
      expect(result).toBe("Empty Group (Click to see options)");
    });

    it("should prioritize group over command when both exist", () => {
      // Testing legacy invalid configuration (command + group)
      const button = {
        command: "echo test",
        group: [{ command: "echo child", id: "child-1", name: "Child" }],
        id: "mixed-btn",
        name: "Mixed Button",
      } as unknown as ButtonConfig;

      const result = createTooltipText(button);
      expect(result).toBe("Mixed Button (Click to see options)");
    });
  });

  describe("createButtonCommand", () => {
    it("should create command object with correct structure for command button", () => {
      const button: ButtonConfig = {
        command: "echo hello",
        id: "test-btn",
        name: "Test Button",
      };

      const result = createButtonCommand(button);

      expect(result).toEqual({
        arguments: [button],
        command: "quickCommandButtons.execute",
        title: "Execute Command",
      });
    });

    it("should create command object with correct structure for group button", () => {
      const button: ButtonConfig = {
        group: [
          { command: "echo test1", id: "child-1", name: "Child 1" },
          { command: "echo test2", id: "child-2", name: "Child 2" },
        ],
        id: "test-group",
        name: "Test Group",
      };

      const result = createButtonCommand(button);

      expect(result).toEqual({
        arguments: [button],
        command: "quickCommandButtons.execute",
        title: "Execute Command",
      });
    });

    it("should preserve button object reference in arguments", () => {
      const button: ButtonConfig = {
        command: "echo reference",
        id: "ref-test",
        name: "Reference Test",
      };

      const result = createButtonCommand(button);

      expect(result.arguments[0]).toBe(button);
    });

    it("should handle button with no command or group", () => {
      // Testing invalid configuration scenario
      const button = {
        id: "minimal-btn",
        name: "Minimal Button",
      } as unknown as ButtonConfig;

      const result = createButtonCommand(button);

      expect(result).toEqual({
        arguments: [button],
        command: "quickCommandButtons.execute",
        title: "Execute Command",
      });
    });

    it("should handle button with additional properties", () => {
      const button: ButtonConfig = {
        color: "#FF0000",
        command: "echo test",
        id: "complex-btn",
        name: "Complex Button",
        shortcut: "t",
      };

      const result = createButtonCommand(button);

      expect(result).toEqual({
        arguments: [button],
        command: "quickCommandButtons.execute",
        title: "Execute Command",
      });
      expect(result.arguments[0]).toEqual(button);
    });
  });

  describe("configureRefreshButton", () => {
    let mockStatusBarItem: any;

    beforeEach(() => {
      mockStatusBarItem = {
        color: "",
        command: "",
        text: "",
        tooltip: "",
      };
    });

    it("should configure refresh button with all properties", () => {
      const refreshConfig = {
        color: "#00FF00",
        enabled: true,
        icon: "🔄",
      };

      configureRefreshButton(mockStatusBarItem, refreshConfig);

      expect(mockStatusBarItem.text).toBe("🔄");
      expect(mockStatusBarItem.tooltip).toBe("Refresh Quick Command Buttons");
      expect(mockStatusBarItem.command).toBe("quickCommandButtons.refresh");
      expect(mockStatusBarItem.color).toBe("#00FF00");
    });

    it("should configure refresh button with minimal properties", () => {
      const refreshConfig = {
        color: "",
        enabled: true,
        icon: "⟳",
      };

      configureRefreshButton(mockStatusBarItem, refreshConfig);

      expect(mockStatusBarItem.text).toBe("⟳");
      expect(mockStatusBarItem.tooltip).toBe("Refresh Quick Command Buttons");
      expect(mockStatusBarItem.command).toBe("quickCommandButtons.refresh");
      expect(mockStatusBarItem.color).toBe("");
    });

    it("should handle refresh config with color set to undefined", () => {
      const refreshConfig = {
        color: undefined as any,
        enabled: true,
        icon: "↻",
      };

      configureRefreshButton(mockStatusBarItem, refreshConfig);

      expect(mockStatusBarItem.text).toBe("↻");
      expect(mockStatusBarItem.tooltip).toBe("Refresh Quick Command Buttons");
      expect(mockStatusBarItem.command).toBe("quickCommandButtons.refresh");
      expect(mockStatusBarItem.color).toBeUndefined();
    });

    it("should handle refresh config with empty icon", () => {
      const refreshConfig = {
        color: "#FF0000",
        enabled: true,
        icon: "",
      };

      configureRefreshButton(mockStatusBarItem, refreshConfig);

      expect(mockStatusBarItem.text).toBe("");
      expect(mockStatusBarItem.tooltip).toBe("Refresh Quick Command Buttons");
      expect(mockStatusBarItem.command).toBe("quickCommandButtons.refresh");
      expect(mockStatusBarItem.color).toBe("#FF0000");
    });

    it("should handle refresh config with null color", () => {
      const refreshConfig = {
        color: null as any,
        enabled: true,
        icon: "↺",
      };

      configureRefreshButton(mockStatusBarItem, refreshConfig);

      expect(mockStatusBarItem.text).toBe("↺");
      expect(mockStatusBarItem.tooltip).toBe("Refresh Quick Command Buttons");
      expect(mockStatusBarItem.command).toBe("quickCommandButtons.refresh");
      expect(mockStatusBarItem.color).toBeNull();
    });

    it("should preserve existing statusBarItem properties not being configured", () => {
      mockStatusBarItem.alignment = "left";
      mockStatusBarItem.priority = 1001;

      const refreshConfig = {
        color: "#0000FF",
        enabled: true,
        icon: "🔃",
      };

      configureRefreshButton(mockStatusBarItem, refreshConfig);

      expect(mockStatusBarItem.alignment).toBe("left");
      expect(mockStatusBarItem.priority).toBe(1001);
      expect(mockStatusBarItem.text).toBe("🔃");
      expect(mockStatusBarItem.color).toBe("#0000FF");
    });
  });
});
