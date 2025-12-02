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
  setButtons: jest.fn(),
});

const createMockButtonSetLocalStorage = (): MockButtonSetLocalStorage => ({
  getActiveSet: jest.fn(() => null),
  getButtonSets: jest.fn(() => []),
  setActiveSet: jest.fn(),
  setButtonSets: jest.fn(),
});

describe("StoreSync", () => {
  let mockConfigReader: MockConfigReader;
  let mockLocalStorage: MockLocalStorage;
  let mockButtonSetLocalStorage: MockButtonSetLocalStorage;
  let mockWorkspaceConfig: {
    get: jest.Mock;
    inspect: jest.Mock;
  };
  let onDidChangeConfigurationCallback: ((e: vscode.ConfigurationChangeEvent) => void) | null;

  beforeEach(() => {
    resetAppStore();
    mockConfigReader = createMockConfigReader();
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
});
