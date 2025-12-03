import * as vscode from "vscode";
import type { ButtonConfig, ButtonSet } from "../../shared/types";
import { createAppStore, resetAppStore } from "./app-store";
import { StoreSync } from "./store-sync";

type MockConfigReader = {
  getButtons: jest.Mock;
  getButtonsFromScope: jest.Mock;
  getRawButtonsFromScope: jest.Mock;
  getRefreshConfig: jest.Mock;
  onConfigChange: jest.Mock;
  validateButtons: jest.Mock;
};

type MockLocalStorage = {
  getButtons: jest.Mock;
  setButtons: jest.Mock;
};

type MockConfigWriter = {
  writeButtons: jest.Mock;
  writeConfigurationTarget: jest.Mock;
};

type MockButtonSetLocalStorage = {
  getActiveSet: jest.Mock;
  getButtonSets: jest.Mock;
  setActiveSet: jest.Mock;
  setButtonSets: jest.Mock;
};

const createMockConfigReader = (): MockConfigReader => ({
  getButtons: jest.fn(() => []),
  getButtonsFromScope: jest.fn(() => []),
  getRawButtonsFromScope: jest.fn(() => []),
  getRefreshConfig: jest.fn(() => ({ color: "#00BCD4", enabled: true, icon: "$(refresh)" })),
  onConfigChange: jest.fn(() => ({ dispose: jest.fn() })),
  validateButtons: jest.fn(() => ({ errors: [], hasErrors: false })),
});

const createMockLocalStorage = (): MockLocalStorage => ({
  getButtons: jest.fn(() => []),
  setButtons: jest.fn().mockResolvedValue(undefined),
});

const createMockConfigWriter = (): MockConfigWriter => ({
  writeButtons: jest.fn().mockResolvedValue(undefined),
  writeConfigurationTarget: jest.fn().mockResolvedValue(undefined),
});

const createMockButtonSetLocalStorage = (): MockButtonSetLocalStorage => ({
  getActiveSet: jest.fn(() => null),
  getButtonSets: jest.fn(() => []),
  setActiveSet: jest.fn().mockResolvedValue(undefined),
  setButtonSets: jest.fn().mockResolvedValue(undefined),
});

describe("StoreSync", () => {
  let mockConfigReader: MockConfigReader;
  let mockConfigWriter: MockConfigWriter;
  let mockLocalStorage: MockLocalStorage;
  let mockButtonSetLocalStorage: MockButtonSetLocalStorage;
  let mockWorkspaceConfig: {
    get: jest.Mock;
    inspect: jest.Mock;
    update: jest.Mock;
  };
  let onDidChangeConfigurationCallback: ((e: vscode.ConfigurationChangeEvent) => void) | null;

  beforeEach(() => {
    resetAppStore();
    mockConfigReader = createMockConfigReader();
    mockConfigWriter = createMockConfigWriter();
    mockLocalStorage = createMockLocalStorage();
    mockButtonSetLocalStorage = createMockButtonSetLocalStorage();
    onDidChangeConfigurationCallback = null;

    mockWorkspaceConfig = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        if (key === "configurationTarget") return defaultValue ?? "workspace";
        return defaultValue;
      }),
      inspect: jest.fn(() => ({
        globalValue: undefined,
        workspaceValue: undefined,
      })),
      update: jest.fn().mockResolvedValue(undefined),
    };

    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockWorkspaceConfig);
    (vscode.workspace.onDidChangeConfiguration as jest.Mock).mockImplementation(
      (callback: (e: vscode.ConfigurationChangeEvent) => void) => {
        onDidChangeConfigurationCallback = callback;
        return { dispose: jest.fn() };
      }
    );
  });

  describe("create", () => {
    it("should create StoreSync instance", () => {
      const store = createAppStore();
      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });

      expect(storeSync).toBeInstanceOf(StoreSync);
    });
  });

  describe("initializeFromSettings", () => {
    it("should load configTarget from settings", () => {
      const store = createAppStore();
      mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === "configurationTarget") return "global";
        return defaultValue;
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().configTarget).toBe("global");
    });

    it("should load buttons from workspace scope", () => {
      const store = createAppStore();
      const workspaceButtons: ButtonConfig[] = [
        { command: "npm run build", id: "1", name: "Build" },
      ];
      mockConfigReader.getButtonsFromScope.mockImplementation((target) => {
        if (target === vscode.ConfigurationTarget.Workspace) {
          return workspaceButtons;
        }
        return [];
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(workspaceButtons);
    });

    it("should fallback to global scope when workspace is empty", () => {
      const store = createAppStore();
      const globalButtons: ButtonConfig[] = [{ command: "npm test", id: "2", name: "Test" }];
      mockConfigReader.getButtonsFromScope.mockImplementation((target) => {
        if (target === vscode.ConfigurationTarget.Global) {
          return globalButtons;
        }
        return [];
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(globalButtons);
    });

    it("should load from local storage when target is local", () => {
      const store = createAppStore();
      const localButtons: ButtonConfig[] = [{ command: "echo local", id: "3", name: "Local" }];
      mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === "configurationTarget") return "local";
        return defaultValue;
      });
      mockLocalStorage.getButtons.mockReturnValue(localButtons);

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        localStorage: mockLocalStorage,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(localButtons);
      expect(store.getState().configTarget).toBe("local");
    });

    it("should fallback from local to workspace when local is empty", () => {
      const store = createAppStore();
      const workspaceButtons: ButtonConfig[] = [{ command: "echo ws", id: "4", name: "Workspace" }];
      mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === "configurationTarget") return "local";
        return defaultValue;
      });
      mockLocalStorage.getButtons.mockReturnValue([]);
      mockConfigReader.getButtonsFromScope.mockImplementation((target) => {
        if (target === vscode.ConfigurationTarget.Workspace) {
          return workspaceButtons;
        }
        return [];
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        localStorage: mockLocalStorage,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(workspaceButtons);
    });

    it("should load button sets from workspace scope", () => {
      const store = createAppStore();
      const buttonSets = [{ buttons: [], id: "set-1", name: "Dev" }];
      mockWorkspaceConfig.inspect.mockReturnValue({
        globalValue: undefined,
        workspaceValue: buttonSets,
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttonSets).toHaveLength(1);
      expect(store.getState().buttonSets[0].name).toBe("Dev");
    });

    it("should load button sets from local storage when target is local", () => {
      const store = createAppStore();
      const localSets: ButtonSet[] = [{ buttons: [], id: "local-set", name: "LocalSet" }];
      mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === "configurationTarget") return "local";
        return defaultValue;
      });
      mockButtonSetLocalStorage.getButtonSets.mockReturnValue(localSets);
      mockLocalStorage.getButtons.mockReturnValue([{ command: "test", id: "1", name: "Btn" }]);

      const storeSync = StoreSync.create({
        buttonSetLocalStorage: mockButtonSetLocalStorage,
        configReader: mockConfigReader,
        localStorage: mockLocalStorage,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttonSets).toEqual(localSets);
    });

    it("should load active set from settings", () => {
      const store = createAppStore();
      mockWorkspaceConfig.inspect.mockImplementation((key: string) => {
        if (key === "activeSet") {
          return { globalValue: undefined, workspaceValue: "DevSet" };
        }
        if (key === "buttonSets") {
          return { globalValue: undefined, workspaceValue: [{ buttons: [], name: "DevSet" }] };
        }
        return { globalValue: undefined, workspaceValue: undefined };
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().activeSet).toBe("DevSet");
    });

    it("should use buttons from active set when active set exists", () => {
      const store = createAppStore();
      const setButtons: ButtonConfig[] = [{ command: "echo set", id: "set-btn", name: "SetBtn" }];
      const buttonSets = [{ buttons: setButtons, id: "set-1", name: "DevSet" }];
      mockWorkspaceConfig.inspect.mockImplementation((key: string) => {
        if (key === "activeSet") {
          return { globalValue: undefined, workspaceValue: "DevSet" };
        }
        if (key === "buttonSets") {
          return { globalValue: undefined, workspaceValue: buttonSets };
        }
        return { globalValue: undefined, workspaceValue: undefined };
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(setButtons);
    });
  });

  describe("startSettingsChangeListener", () => {
    it("should register configuration change listener", () => {
      const store = createAppStore();
      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });

      storeSync.startSettingsChangeListener();

      expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled();
    });

    it("should update store when settings change", () => {
      const store = createAppStore();
      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();
      storeSync.startSettingsChangeListener();

      const newButtons: ButtonConfig[] = [{ command: "echo new", id: "new", name: "New" }];
      mockConfigReader.getButtonsFromScope.mockReturnValue(newButtons);

      onDidChangeConfigurationCallback?.({
        affectsConfiguration: (section: string) => section === "quickCommandButtons",
      } as vscode.ConfigurationChangeEvent);

      expect(store.getState().buttons).toEqual(newButtons);
    });

    it("should not update store when unrelated settings change", () => {
      const store = createAppStore();
      const initialButtons: ButtonConfig[] = [
        { command: "echo initial", id: "initial", name: "Initial" },
      ];
      mockConfigReader.getButtonsFromScope.mockReturnValue(initialButtons);

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();
      storeSync.startSettingsChangeListener();

      mockConfigReader.getButtonsFromScope.mockReturnValue([]);

      onDidChangeConfigurationCallback?.({
        affectsConfiguration: (section: string) => section === "someOtherExtension",
      } as vscode.ConfigurationChangeEvent);

      expect(store.getState().buttons).toEqual(initialButtons);
    });
  });

  describe("dispose", () => {
    it("should dispose configuration change listener", () => {
      const store = createAppStore();
      const disposeMock = jest.fn();
      (vscode.workspace.onDidChangeConfiguration as jest.Mock).mockReturnValue({
        dispose: disposeMock,
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.startSettingsChangeListener();
      storeSync.dispose();

      expect(disposeMock).toHaveBeenCalled();
    });
  });

  describe("3-tier fallback logic", () => {
    it("LOCAL → WORKSPACE → GLOBAL fallback", () => {
      const store = createAppStore();
      const globalButtons: ButtonConfig[] = [
        { command: "echo global", id: "global", name: "Global" },
      ];
      mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === "configurationTarget") return "local";
        return defaultValue;
      });
      mockLocalStorage.getButtons.mockReturnValue([]);
      mockConfigReader.getButtonsFromScope.mockImplementation((target) => {
        if (target === vscode.ConfigurationTarget.Global) {
          return globalButtons;
        }
        return [];
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        localStorage: mockLocalStorage,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(globalButtons);
    });

    it("WORKSPACE → GLOBAL fallback", () => {
      const store = createAppStore();
      const globalButtons: ButtonConfig[] = [
        { command: "echo global", id: "global", name: "Global" },
      ];
      mockConfigReader.getButtonsFromScope.mockImplementation((target) => {
        if (target === vscode.ConfigurationTarget.Global) {
          return globalButtons;
        }
        return [];
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(globalButtons);
    });

    it("should use workspace buttons when available (no fallback)", () => {
      const store = createAppStore();
      const workspaceButtons: ButtonConfig[] = [
        { command: "echo ws", id: "ws", name: "Workspace" },
      ];
      const globalButtons: ButtonConfig[] = [
        { command: "echo global", id: "global", name: "Global" },
      ];
      mockConfigReader.getButtonsFromScope.mockImplementation((target) => {
        if (target === vscode.ConfigurationTarget.Workspace) {
          return workspaceButtons;
        }
        if (target === vscode.ConfigurationTarget.Global) {
          return globalButtons;
        }
        return [];
      });

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });
      storeSync.initializeFromSettings();

      expect(store.getState().buttons).toEqual(workspaceButtons);
    });
  });

  describe("Store → Settings sync (bidirectional)", () => {
    describe("buttons sync", () => {
      it("should save buttons to workspace settings when store changes", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const newButtons: ButtonConfig[] = [{ command: "echo new", id: "new", name: "New" }];
        store.getState().setButtons(newButtons);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockConfigWriter.writeButtons).toHaveBeenCalledWith(
          newButtons,
          vscode.ConfigurationTarget.Workspace
        );
      });

      it("should save buttons to global settings when configTarget is global", async () => {
        const store = createAppStore();
        mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
          if (key === "configurationTarget") return "global";
          return defaultValue;
        });

        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const newButtons: ButtonConfig[] = [{ command: "echo global", id: "g", name: "Global" }];
        store.getState().setButtons(newButtons);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockConfigWriter.writeButtons).toHaveBeenCalledWith(
          newButtons,
          vscode.ConfigurationTarget.Global
        );
      });

      it("should save buttons to local storage when configTarget is local", async () => {
        const store = createAppStore();
        mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
          if (key === "configurationTarget") return "local";
          return defaultValue;
        });
        mockLocalStorage.getButtons.mockReturnValue([{ command: "test", id: "1", name: "Test" }]);

        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          localStorage: mockLocalStorage,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const newButtons: ButtonConfig[] = [{ command: "echo local", id: "l", name: "Local" }];
        store.getState().setButtons(newButtons);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockLocalStorage.setButtons).toHaveBeenCalledWith(newButtons);
        expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
      });
    });

    describe("buttonSets sync", () => {
      it("should save buttonSets to workspace settings when store changes", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const newSets: ButtonSet[] = [{ buttons: [], id: "set-1", name: "DevSet" }];
        store.getState().setButtonSets(newSets);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockWorkspaceConfig.update).toHaveBeenCalledWith(
          "buttonSets",
          [{ buttons: [], name: "DevSet" }],
          vscode.ConfigurationTarget.Workspace
        );
      });

      it("should save buttonSets to local storage when configTarget is local", async () => {
        const store = createAppStore();
        mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
          if (key === "configurationTarget") return "local";
          return defaultValue;
        });
        mockLocalStorage.getButtons.mockReturnValue([{ command: "test", id: "1", name: "Test" }]);

        const storeSync = StoreSync.create({
          buttonSetLocalStorage: mockButtonSetLocalStorage,
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          localStorage: mockLocalStorage,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const newSets: ButtonSet[] = [{ buttons: [], id: "local-set", name: "LocalSet" }];
        store.getState().setButtonSets(newSets);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockButtonSetLocalStorage.setButtonSets).toHaveBeenCalledWith(newSets);
      });
    });

    describe("activeSet sync", () => {
      it("should save activeSet to workspace settings when store changes", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        store.getState().setActiveSet("DevSet");

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockWorkspaceConfig.update).toHaveBeenCalledWith(
          "activeSet",
          "DevSet",
          vscode.ConfigurationTarget.Workspace
        );
      });

      it("should save null activeSet to settings when clearing", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        store.getState().setActiveSet("TempSet");
        await new Promise((resolve) => setTimeout(resolve, 10));
        mockWorkspaceConfig.update.mockClear();

        store.getState().setActiveSet(null);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockWorkspaceConfig.update).toHaveBeenCalledWith(
          "activeSet",
          null,
          vscode.ConfigurationTarget.Workspace
        );
      });

      it("should save activeSet to local storage when configTarget is local", async () => {
        const store = createAppStore();
        mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
          if (key === "configurationTarget") return "local";
          return defaultValue;
        });
        mockLocalStorage.getButtons.mockReturnValue([{ command: "test", id: "1", name: "Test" }]);

        const storeSync = StoreSync.create({
          buttonSetLocalStorage: mockButtonSetLocalStorage,
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          localStorage: mockLocalStorage,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        store.getState().setActiveSet("LocalSet");

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockButtonSetLocalStorage.setActiveSet).toHaveBeenCalledWith("LocalSet");
      });
    });

    describe("circular update prevention", () => {
      it("should not save to settings when syncing from settings", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        mockConfigWriter.writeButtons.mockClear();

        const newButtons: ButtonConfig[] = [{ command: "echo new", id: "new", name: "New" }];
        mockConfigReader.getButtonsFromScope.mockReturnValue(newButtons);

        onDidChangeConfigurationCallback?.({
          affectsConfiguration: (section: string) => section === "quickCommandButtons",
        } as vscode.ConfigurationChangeEvent);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
      });

      it("should not trigger settings change handler when saving to settings", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const newButtons: ButtonConfig[] = [{ command: "echo new", id: "new", name: "New" }];
        store.getState().setButtons(newButtons);

        mockConfigWriter.writeButtons.mockImplementation(async () => {
          onDidChangeConfigurationCallback?.({
            affectsConfiguration: (section: string) => section === "quickCommandButtons",
          } as vscode.ConfigurationChangeEvent);
        });

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(store.getState().buttons).toEqual(newButtons);
      });
    });

    describe("dispose", () => {
      it("should unsubscribe store listeners on dispose", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();
        storeSync.dispose();

        mockConfigWriter.writeButtons.mockClear();
        store.getState().setButtons([{ command: "test", id: "1", name: "Test" }]);

        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
      });
    });

    describe("error handling", () => {
      it("should show error message when save fails", async () => {
        const store = createAppStore();
        mockConfigWriter.writeButtons.mockRejectedValue(new Error("Permission denied"));

        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        store.getState().setButtons([{ command: "test", id: "1", name: "Test" }]);
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(consoleSpy).toHaveBeenCalledWith(
          "[StoreSync] Failed to save buttons:",
          expect.any(Error)
        );
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
          "Failed to save buttons: Permission denied"
        );

        consoleSpy.mockRestore();
      });

      it("should throw error when configWriter is missing for non-local scope", async () => {
        const store = createAppStore();
        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        store.getState().setButtons([{ command: "test", id: "1", name: "Test" }]);
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(consoleSpy).toHaveBeenCalledWith(
          "[StoreSync] Failed to save buttons:",
          expect.objectContaining({
            message: "ConfigWriter is required for workspace/global scope",
          })
        );
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
          "Failed to save buttons: ConfigWriter is required for workspace/global scope"
        );

        consoleSpy.mockRestore();
      });

      it("should handle rapid consecutive updates without losing data", async () => {
        const store = createAppStore();
        let saveCount = 0;
        mockConfigWriter.writeButtons.mockImplementation(async () => {
          saveCount++;
          await new Promise((resolve) => setTimeout(resolve, 5));
        });

        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const buttons1: ButtonConfig[] = [{ command: "echo 1", id: "1", name: "First" }];
        const buttons2: ButtonConfig[] = [{ command: "echo 2", id: "2", name: "Second" }];
        const buttons3: ButtonConfig[] = [{ command: "echo 3", id: "3", name: "Third" }];

        store.getState().setButtons(buttons1);
        store.getState().setButtons(buttons2);
        store.getState().setButtons(buttons3);

        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(saveCount).toBe(3);
        expect(mockConfigWriter.writeButtons).toHaveBeenLastCalledWith(
          buttons3,
          vscode.ConfigurationTarget.Workspace
        );
      });

      it("should handle buttonSets save error gracefully", async () => {
        const store = createAppStore();
        mockWorkspaceConfig.update.mockRejectedValue(new Error("Write failed"));

        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        store.getState().setButtonSets([{ buttons: [], id: "set-1", name: "TestSet" }]);
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(consoleSpy).toHaveBeenCalledWith(
          "[StoreSync] Failed to save buttonSets:",
          expect.any(Error)
        );
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
          "Failed to save buttonSets: Write failed"
        );

        consoleSpy.mockRestore();
      });

      it("should handle activeSet save error gracefully", async () => {
        const store = createAppStore();
        mockWorkspaceConfig.update.mockRejectedValue(new Error("Update failed"));

        const storeSync = StoreSync.create({
          configReader: mockConfigReader,
          configWriter: mockConfigWriter,
          store,
        });
        storeSync.initializeFromSettings();
        storeSync.startBidirectionalSync();

        const consoleSpy = jest.spyOn(console, "error").mockImplementation();

        store.getState().setActiveSet("TestSet");
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(consoleSpy).toHaveBeenCalledWith(
          "[StoreSync] Failed to save activeSet:",
          expect.any(Error)
        );
        expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
          "Failed to save activeSet: Update failed"
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe("EventBus integration", () => {
    const createMockEventBus = () => {
      const handlers = new Map<string, Set<() => void>>();
      return {
        emit: jest.fn((event: string) => {
          const eventHandlers = handlers.get(event);
          if (eventHandlers) {
            eventHandlers.forEach((handler) => handler());
          }
        }),
        on: jest.fn((event: string, handler: () => void) => {
          if (!handlers.has(event)) {
            handlers.set(event, new Set());
          }
          handlers.get(event)?.add(handler);
          return () => handlers.get(event)?.delete(handler);
        }),
      };
    };

    it("should subscribe to buttonSet events when startEventBusListener is called", () => {
      const store = createAppStore();
      const mockEventBus = createMockEventBus();

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        eventBus: mockEventBus as never,
        store,
      });
      storeSync.startEventBusListener();

      expect(mockEventBus.on).toHaveBeenCalledWith("buttonSet:switched", expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith("buttonSet:created", expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith("buttonSet:deleted", expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith("buttonSet:renamed", expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith("config:changed", expect.any(Function));
    });

    it("should sync from settings when buttonSet:switched event is emitted", () => {
      const store = createAppStore();
      const mockEventBus = createMockEventBus();
      const newButtons: ButtonConfig[] = [
        { command: "echo switched", id: "switched", name: "Switched" },
      ];

      mockConfigReader.getButtonsFromScope.mockReturnValue(newButtons);

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        eventBus: mockEventBus as never,
        store,
      });
      storeSync.initializeFromSettings();
      storeSync.startEventBusListener();

      mockConfigReader.getButtonsFromScope.mockReturnValue([
        { command: "echo new", id: "new", name: "New" },
      ]);
      mockEventBus.emit("buttonSet:switched");

      expect(store.getState().buttons).toEqual([{ command: "echo new", id: "new", name: "New" }]);
    });

    it("should not subscribe if eventBus is not provided", () => {
      const store = createAppStore();

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        store,
      });

      // Should not throw
      expect(() => storeSync.startEventBusListener()).not.toThrow();
    });

    it("should unsubscribe from eventBus on dispose", () => {
      const store = createAppStore();
      const mockEventBus = createMockEventBus();
      const unsubscribeMock = jest.fn();
      mockEventBus.on.mockReturnValue(unsubscribeMock);

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        eventBus: mockEventBus as never,
        store,
      });
      storeSync.startEventBusListener();
      storeSync.dispose();

      expect(unsubscribeMock).toHaveBeenCalledTimes(5); // 5 events
    });

    it("should sync from local storage when buttonSet:switched event is emitted in local scope", () => {
      const store = createAppStore();
      const mockEventBus = createMockEventBus();
      const localButtons: ButtonConfig[] = [{ command: "echo local", id: "local", name: "Local" }];

      mockWorkspaceConfig.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === "configurationTarget") return "local";
        return defaultValue;
      });
      mockLocalStorage.getButtons.mockReturnValue(localButtons);

      const storeSync = StoreSync.create({
        configReader: mockConfigReader,
        eventBus: mockEventBus as never,
        localStorage: mockLocalStorage,
        store,
      });
      storeSync.initializeFromSettings();
      storeSync.startEventBusListener();

      const newLocalButtons: ButtonConfig[] = [
        { command: "echo updated", id: "updated", name: "Updated" },
      ];
      mockLocalStorage.getButtons.mockReturnValue(newLocalButtons);

      mockEventBus.emit("buttonSet:switched");

      expect(store.getState().buttons).toEqual(newLocalButtons);
    });
  });
});
