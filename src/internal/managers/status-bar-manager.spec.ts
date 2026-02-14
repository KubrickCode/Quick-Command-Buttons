import { ButtonConfig } from "../../pkg/types";
import { createAppStore } from "../stores/app-store";
import type { AppStoreInstance } from "../stores/app-store";
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
    let mockStore: AppStoreInstance;
    let statusBarManager: StatusBarManager;

    // Mock vscode module to avoid undefined errors
    vi.mock("vscode", () => ({
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
        getRefreshConfig: vi.fn().mockReturnValue({
          color: "#FF0000",
          enabled: false, // Disable refresh button to simplify tests
          icon: "🔄",
        }),
        getSetIndicatorConfig: vi.fn().mockReturnValue({
          enabled: true,
        }),
      };

      mockStatusBarCreator = vi.fn().mockImplementation(() => ({
        color: "",
        command: "",
        dispose: vi.fn(),
        show: vi.fn(),
        text: "",
        tooltip: "",
      }));

      mockStore = createAppStore();
      mockStore.getState().setButtons([
        { command: "echo test1", id: "btn-1", name: "Test Button 1" },
        { command: "echo test2", id: "btn-2", name: "Test Button 2" },
      ]);
    });

    afterEach(() => {
      if (statusBarManager) {
        statusBarManager.dispose();
      }
    });

    describe("Store subscription", () => {
      it("should subscribe to store on creation", () => {
        const subscribeSpy = vi.spyOn(mockStore, "subscribe");

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        expect(subscribeSpy).toHaveBeenCalled();
      });

      it("should call refreshButtons when store buttons change", () => {
        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        const refreshSpy = vi.spyOn(statusBarManager, "refreshButtons");

        mockStore
          .getState()
          .setButtons([{ command: "echo new", id: "new-btn", name: "New Button" }]);

        expect(refreshSpy).toHaveBeenCalled();
      });

      it("should call refreshButtons when activeSet changes", () => {
        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        const refreshSpy = vi.spyOn(statusBarManager, "refreshButtons");

        mockStore.getState().setActiveSet("Frontend");

        expect(refreshSpy).toHaveBeenCalled();
      });

      it("should use buttons from store for status bar", () => {
        mockStore
          .getState()
          .setButtons([{ command: "echo store", id: "store-btn", name: "Store Button" }]);

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        statusBarManager.refreshButtons();

        const createdItems = mockStatusBarCreator.mock.results.map((r: any) => r.value);
        const buttonItem = createdItems.find((item: any) => item.text === "Store Button");
        expect(buttonItem).toBeDefined();
      });

      it("should display activeSet from store in set indicator", () => {
        mockStore.getState().setActiveSet("TestSet");

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        // Call refreshButtons to create status bar items
        mockStatusBarCreator.mockClear();
        statusBarManager.refreshButtons();

        const createdItems = mockStatusBarCreator.mock.results.map((r: any) => r.value);
        const setIndicator = createdItems.find((item: any) => item.text === "$(layers) [TestSet]");
        expect(setIndicator).toBeDefined();
      });
    });

    describe("refreshButtons", () => {
      it("should apply button color when specified", () => {
        mockStore
          .getState()
          .setButtons([
            { color: "#FF5733", command: "echo colored", id: "colored-btn", name: "Colored" },
          ]);

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        statusBarManager.refreshButtons();

        const createdItems = mockStatusBarCreator.mock.results.map((r: any) => r.value);
        const coloredButton = createdItems.find((item: any) => item.text === "Colored");
        expect(coloredButton?.color).toBe("#FF5733");
      });

      it("should not set color when button has no color", () => {
        mockStore
          .getState()
          .setButtons([{ command: "echo plain", id: "plain-btn", name: "Plain" }]);

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        statusBarManager.refreshButtons();

        const createdItems = mockStatusBarCreator.mock.results.map((r: any) => r.value);
        const plainButton = createdItems.find((item: any) => item.text === "Plain");
        expect(plainButton?.color).toBe("");
      });
    });

    describe("dispose", () => {
      it("should dispose all status bar items", () => {
        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        statusBarManager.refreshButtons();

        const statusBarItems = mockStatusBarCreator.mock.results.map((result: any) => result.value);

        statusBarManager.dispose();

        statusBarItems.forEach((item: any) => {
          expect(item.dispose).toHaveBeenCalled();
        });
      });

      it("should unsubscribe from store when disposed", () => {
        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        statusBarManager.dispose();

        const refreshSpy = vi.spyOn(statusBarManager, "refreshButtons");
        mockStore.getState().setButtons([]);

        expect(refreshSpy).not.toHaveBeenCalled();
      });
    });

    describe("error handling", () => {
      it("should catch and log error when refreshButtons throws during store update", () => {
        const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        vi.spyOn(statusBarManager, "refreshButtons").mockImplementation(() => {
          throw new Error("Refresh failed");
        });

        expect(() => {
          mockStore.getState().setButtons([{ command: "echo test", id: "test", name: "Test" }]);
        }).not.toThrow();

        expect(consoleSpy).toHaveBeenCalledWith(
          "[StatusBarManager] Failed to refresh buttons:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });
    });

    describe("set indicator visibility", () => {
      type MockStatusBarItem = {
        color: string | null;
        command: string;
        dispose: ReturnType<typeof vi.fn>;
        show: ReturnType<typeof vi.fn>;
        text: string;
        tooltip: string;
      };

      const getCreatedItems = (): MockStatusBarItem[] =>
        mockStatusBarCreator.mock.results.map(
          (r: { value: MockStatusBarItem }) => r.value
        );

      it("should not create set indicator when enabled is false", () => {
        mockConfigReader.getSetIndicatorConfig.mockReturnValue({ enabled: false });

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        mockStatusBarCreator.mockClear();
        statusBarManager.refreshButtons();

        const setIndicator = getCreatedItems().find((item) =>
          item.text.startsWith("$(layers)")
        );
        expect(setIndicator).toBeUndefined();
      });

      it("should create set indicator when enabled is true", () => {
        mockConfigReader.getSetIndicatorConfig.mockReturnValue({ enabled: true });

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        mockStatusBarCreator.mockClear();
        statusBarManager.refreshButtons();

        const setIndicator = getCreatedItems().find((item) =>
          item.text.startsWith("$(layers)")
        );
        expect(setIndicator).toBeDefined();
      });

      it("should create set indicator by default", () => {
        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        mockStatusBarCreator.mockClear();
        statusBarManager.refreshButtons();

        const setIndicator = getCreatedItems().find((item) =>
          item.text.startsWith("$(layers)")
        );
        expect(setIndicator).toBeDefined();
      });

      it("should still create command buttons when set indicator is disabled", () => {
        mockConfigReader.getSetIndicatorConfig.mockReturnValue({ enabled: false });

        statusBarManager = StatusBarManager.create({
          configReader: mockConfigReader,
          statusBarCreator: mockStatusBarCreator,
          store: mockStore,
        });

        mockStatusBarCreator.mockClear();
        statusBarManager.refreshButtons();

        const commandButton = getCreatedItems().find(
          (item) => item.text === "Test Button 1"
        );
        expect(commandButton).toBeDefined();
      });
    });
  });
});
