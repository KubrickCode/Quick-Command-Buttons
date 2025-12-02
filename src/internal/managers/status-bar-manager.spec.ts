import { ButtonConfig } from "../../pkg/types";
import { EventBus } from "../event-bus";
import {
  calculateButtonPriority,
  createTooltipText,
  createButtonCommand,
  configureRefreshButton,
  configureSetIndicator,
  StatusBarManager,
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

  describe("configureSetIndicator", () => {
    let mockStatusBarItem: any;

    beforeEach(() => {
      mockStatusBarItem = {
        color: "",
        command: "",
        text: "",
        tooltip: "",
      };
    });

    it("should display Default when activeSetName is null", () => {
      configureSetIndicator(mockStatusBarItem, null);

      // l10n mock replaces placeholders with actual values
      expect(mockStatusBarItem.text).toBe("$(layers) [Default]");
      expect(mockStatusBarItem.tooltip).toBe("Current Set: Default (Click to switch)");
      expect(mockStatusBarItem.command).toBe("quickCommandButtons.switchButtonSet");
    });

    it("should display set name when activeSetName is provided", () => {
      configureSetIndicator(mockStatusBarItem, "Frontend");

      expect(mockStatusBarItem.text).toBe("$(layers) [Frontend]");
      expect(mockStatusBarItem.tooltip).toBe("Current Set: Frontend (Click to switch)");
      expect(mockStatusBarItem.command).toBe("quickCommandButtons.switchButtonSet");
    });

    it("should handle set name with special characters", () => {
      configureSetIndicator(mockStatusBarItem, "Dev & Test");

      expect(mockStatusBarItem.text).toBe("$(layers) [Dev & Test]");
      expect(mockStatusBarItem.tooltip).toBe("Current Set: Dev & Test (Click to switch)");
    });

    it("should handle empty string as set name", () => {
      configureSetIndicator(mockStatusBarItem, "");

      expect(mockStatusBarItem.text).toBe("$(layers) []");
      expect(mockStatusBarItem.tooltip).toBe("Current Set:  (Click to switch)");
    });
  });

  describe("StatusBarManager", () => {
    let mockConfigReader: any;
    let mockStatusBarCreator: any;
    let mockConfigManager: any;
    let eventBus: EventBus;
    let statusBarManager: StatusBarManager;

    // Mock vscode module to avoid undefined errors
    jest.mock("vscode", () => ({
      l10n: {
        t: (key: string, ...args: any[]) => {
          // Simple template replacement for tests
          return key.replace(/\{(\d+)\}/g, (_, index) => args[index] || "");
        },
      },
      StatusBarAlignment: {
        Left: 1,
        Right: 2,
      },
    }));

    beforeEach(() => {
      mockConfigReader = {
        getRefreshConfig: jest.fn().mockReturnValue({
          color: "#FF0000",
          enabled: false, // Disable refresh button to simplify tests
          icon: "🔄",
        }),
      };

      mockStatusBarCreator = jest.fn().mockReturnValue({
        color: "",
        command: "",
        dispose: jest.fn(),
        show: jest.fn(),
        text: "",
        tooltip: "",
      });

      mockConfigManager = {
        getButtonsWithFallback: jest.fn().mockReturnValue({
          buttons: [
            { command: "echo test1", id: "btn-1", name: "Test Button 1" },
            { command: "echo test2", id: "btn-2", name: "Test Button 2" },
          ],
        }),
      };

      eventBus = new EventBus();
    });

    afterEach(() => {
      if (statusBarManager) {
        statusBarManager.dispose();
      }
      eventBus.dispose();
    });

    describe("EventBus integration", () => {
      it("should subscribe to config:changed event when eventBus is provided", () => {
        const eventBusSpy = jest.spyOn(eventBus, "on");

        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          eventBus,
          statusBarCreator: mockStatusBarCreator,
        });

        expect(eventBusSpy).toHaveBeenCalledWith("config:changed", expect.any(Function));
        expect(eventBusSpy).toHaveBeenCalledWith("buttonSet:switched", expect.any(Function));
      });

      it("should not subscribe to events when eventBus is not provided", () => {
        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
        });

        // Should not throw errors - manager should handle missing eventBus gracefully
        expect(statusBarManager).toBeDefined();
      });

      it("should call refreshButtons when config:changed event is emitted", () => {
        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          eventBus,
          statusBarCreator: mockStatusBarCreator,
        });

        const refreshSpy = jest.spyOn(statusBarManager, "refreshButtons");

        eventBus.emit("config:changed", { scope: "local" });

        expect(refreshSpy).toHaveBeenCalled();
      });

      it("should call refreshButtons when buttonSet:switched event is emitted", () => {
        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          eventBus,
          statusBarCreator: mockStatusBarCreator,
        });

        const refreshSpy = jest.spyOn(statusBarManager, "refreshButtons");

        eventBus.emit("buttonSet:switched", { setName: "Frontend" });

        expect(refreshSpy).toHaveBeenCalled();
      });

      it("should unsubscribe from events when disposed", () => {
        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          eventBus,
          statusBarCreator: mockStatusBarCreator,
        });

        const refreshSpy = jest.spyOn(statusBarManager, "refreshButtons");

        // Dispose the manager
        statusBarManager.dispose();

        // Clear the spy to reset call count
        refreshSpy.mockClear();

        // Emit events after disposal
        eventBus.emit("config:changed", { scope: "workspace" });
        eventBus.emit("buttonSet:switched", { setName: null });

        // refreshButtons should not be called after disposal
        expect(refreshSpy).not.toHaveBeenCalled();
      });

      it("should handle multiple event emissions", () => {
        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          eventBus,
          statusBarCreator: mockStatusBarCreator,
        });

        // Mock refreshButtons to avoid vscode module issues
        const refreshSpy = jest.spyOn(statusBarManager, "refreshButtons").mockImplementation(() => {
          // No-op for test
        });

        eventBus.emit("config:changed", { scope: "local" });
        eventBus.emit("buttonSet:switched", { setName: "Backend" });
        eventBus.emit("config:changed", { scope: "global" });

        expect(refreshSpy).toHaveBeenCalledTimes(3);
      });

      it("should preserve button set manager reference after event refresh", () => {
        const mockButtonSetManager = {
          getActiveSet: jest.fn().mockReturnValue("TestSet"),
          getButtonsForActiveSet: jest
            .fn()
            .mockReturnValue([{ command: "echo set", id: "set-btn", name: "Set Button" }]),
        };

        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          eventBus,
          statusBarCreator: mockStatusBarCreator,
        });

        // Set up the button set manager
        statusBarManager.setButtonSetManager(mockButtonSetManager as any);

        // Manually trigger refresh to verify button set manager is used
        statusBarManager.refreshButtons();

        // Verify that button set manager is still accessible after refresh
        expect(mockButtonSetManager.getButtonsForActiveSet).toHaveBeenCalled();
      });
    });

    describe("dispose", () => {
      it("should dispose all status bar items", () => {
        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
        });

        statusBarManager.refreshButtons();

        const statusBarItems = mockStatusBarCreator.mock.results.map((result: any) => result.value);

        statusBarManager.dispose();

        statusBarItems.forEach((item: any) => {
          expect(item.dispose).toHaveBeenCalled();
        });
      });

      it("should clear unsubscribers array", () => {
        statusBarManager = StatusBarManager.create({
          configManager: mockConfigManager,
          configReader: mockConfigReader,
          eventBus,
          statusBarCreator: mockStatusBarCreator,
        });

        statusBarManager.dispose();

        // Verify unsubscribers were cleared by checking events don't trigger after disposal
        const refreshSpy = jest.spyOn(statusBarManager, "refreshButtons");
        eventBus.emit("config:changed", { scope: "local" });

        expect(refreshSpy).not.toHaveBeenCalled();
      });
    });
  });
});
