import * as vscode from "vscode";
import { CONFIGURATION_TARGETS } from "../../pkg/config-constants";
import { ConfigWriter, ProjectLocalStorage } from "../adapters";
import { ConfigManager } from "./config-manager";

describe("ConfigManager", () => {
  const createMockConfig = () => ({
    get: vi.fn(),
    update: vi.fn(),
  });

  const createMockConfigWriter = (): ConfigWriter => ({
    writeButtons: vi.fn(),
    writeConfigurationTarget: vi.fn(),
  });

  const createMockLocalStorage = (): ProjectLocalStorage => ({
    getButtons: vi.fn().mockReturnValue([]),
    setButtons: vi.fn(),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("create", () => {
    it("should create ConfigManager instance", () => {
      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      expect(configManager).toBeInstanceOf(ConfigManager);
    });
  });

  describe("getCurrentConfigurationTarget", () => {
    it("should return workspace target by default", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getCurrentConfigurationTarget();

      expect(result).toBe(CONFIGURATION_TARGETS.WORKSPACE);
      expect(mockConfig.get).toHaveBeenCalledWith(
        "configurationTarget",
        CONFIGURATION_TARGETS.WORKSPACE
      );
    });

    it("should return global target when configured", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getCurrentConfigurationTarget();

      expect(result).toBe(CONFIGURATION_TARGETS.GLOBAL);
    });
  });

  describe("getVSCodeConfigurationTarget", () => {
    it("should return vscode.ConfigurationTarget.Workspace for workspace target", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getVSCodeConfigurationTarget();

      expect(result).toBe(vscode.ConfigurationTarget.Workspace);
    });

    it("should return vscode.ConfigurationTarget.Global for global target", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getVSCodeConfigurationTarget();

      expect(result).toBe(vscode.ConfigurationTarget.Global);
    });

    it("should throw error for LOCAL scope", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });

      expect(() => configManager.getVSCodeConfigurationTarget()).toThrow(
        "LOCAL scope uses workspaceState, not VS Code ConfigurationTarget"
      );
    });
  });

  describe("getConfigDataForWebview", () => {
    it("should return buttons from workspace scope when configuration target is workspace", () => {
      const mockButtons = [
        { command: "echo test1", name: "Test 1" },
        { command: "echo test2", name: "Test 2" },
      ];
      const mockConfigReader = {
        getButtons: vi.fn().mockReturnValue(mockButtons),
        getButtonsFromScope: vi.fn().mockReturnValue(mockButtons),
      };
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getConfigDataForWebview(mockConfigReader);

      expect(result).toEqual({
        buttons: mockButtons,
        configurationTarget: CONFIGURATION_TARGETS.WORKSPACE,
      });
      expect(mockConfigReader.getButtonsFromScope).toHaveBeenCalledWith(
        vscode.ConfigurationTarget.Workspace
      );
    });

    it("should return buttons from global scope when configuration target is global", () => {
      const mockGlobalButtons = [{ command: "echo global", name: "Global Command" }];
      const mockConfigReader = {
        getButtons: vi.fn().mockReturnValue([]),
        getButtonsFromScope: vi.fn().mockReturnValue(mockGlobalButtons),
      };
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getConfigDataForWebview(mockConfigReader);

      expect(result).toEqual({
        buttons: mockGlobalButtons,
        configurationTarget: CONFIGURATION_TARGETS.GLOBAL,
      });
      expect(mockConfigReader.getButtonsFromScope).toHaveBeenCalledWith(
        vscode.ConfigurationTarget.Global
      );
    });
  });

  describe("updateButtonConfiguration", () => {
    it("should update buttons configuration with correct target", async () => {
      const mockButtons = [{ command: "echo test", id: "test-btn", name: "Test" }];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      await configManager.updateButtonConfiguration(mockButtons);

      expect(mockConfigWriter.writeButtons).toHaveBeenCalledWith(
        mockButtons,
        vscode.ConfigurationTarget.Workspace
      );
    });

    it("should use global target when configured", async () => {
      const mockButtons = [{ command: "echo test", id: "test-btn", name: "Test" }];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      await configManager.updateButtonConfiguration(mockButtons);

      expect(mockConfigWriter.writeButtons).toHaveBeenCalledWith(
        mockButtons,
        vscode.ConfigurationTarget.Global
      );
    });
  });

  describe("updateConfigurationTarget", () => {
    it("should update configuration target to global", async () => {
      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      await configManager.updateConfigurationTarget(CONFIGURATION_TARGETS.GLOBAL);

      expect(mockConfigWriter.writeConfigurationTarget).toHaveBeenCalledWith(
        CONFIGURATION_TARGETS.GLOBAL
      );
    });

    it("should update configuration target to workspace", async () => {
      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      await configManager.updateConfigurationTarget(CONFIGURATION_TARGETS.WORKSPACE);

      expect(mockConfigWriter.writeConfigurationTarget).toHaveBeenCalledWith(
        CONFIGURATION_TARGETS.WORKSPACE
      );
    });
  });

  describe("getButtonsWithFallback", () => {
    it("should return local buttons when local scope is selected and has buttons", () => {
      const localButtons = [{ command: "echo local", id: "local-btn", name: "Local Command" }];
      const mockLocalStorage = createMockLocalStorage();
      (mockLocalStorage.getButtons as vi.Mock).mockReturnValue(localButtons);

      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({
        configWriter: mockConfigWriter,
        localStorage: mockLocalStorage,
      });
      const result = configManager.getButtonsWithFallback(mockConfigReader);

      expect(result).toEqual({
        buttons: localButtons,
        scope: CONFIGURATION_TARGETS.LOCAL,
      });
      expect(mockLocalStorage.getButtons).toHaveBeenCalled();
    });

    it("should fallback to workspace when local scope is empty", () => {
      const workspaceButtons = [
        { command: "echo workspace", id: "ws-btn", name: "Workspace Command" },
      ];
      const mockLocalStorage = createMockLocalStorage();
      (mockLocalStorage.getButtons as vi.Mock).mockReturnValue([]);

      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn().mockReturnValue(workspaceButtons),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({
        configWriter: mockConfigWriter,
        localStorage: mockLocalStorage,
      });
      const result = configManager.getButtonsWithFallback(mockConfigReader);

      expect(result).toEqual({
        buttons: workspaceButtons,
        scope: CONFIGURATION_TARGETS.WORKSPACE,
      });
    });

    it("should fallback to global when local and workspace are empty", () => {
      const globalButtons = [{ command: "echo global", id: "global-btn", name: "Global Command" }];
      const mockLocalStorage = createMockLocalStorage();
      (mockLocalStorage.getButtons as vi.Mock).mockReturnValue([]);

      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn((target) => {
          if (target === vscode.ConfigurationTarget.Workspace) return [];
          if (target === vscode.ConfigurationTarget.Global) return globalButtons;
          return [];
        }),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({
        configWriter: mockConfigWriter,
        localStorage: mockLocalStorage,
      });
      const result = configManager.getButtonsWithFallback(mockConfigReader);

      expect(result).toEqual({
        buttons: globalButtons,
        scope: CONFIGURATION_TARGETS.GLOBAL,
      });
    });

    it("should return workspace buttons when workspace scope is selected", () => {
      const workspaceButtons = [
        { command: "echo workspace", id: "ws-btn", name: "Workspace Command" },
      ];

      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn().mockReturnValue(workspaceButtons),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getButtonsWithFallback(mockConfigReader);

      expect(result).toEqual({
        buttons: workspaceButtons,
        scope: CONFIGURATION_TARGETS.WORKSPACE,
      });
    });
  });

  describe("updateButtonConfiguration with localStorage", () => {
    it("should save to localStorage when local scope is selected", async () => {
      const mockButtons = [{ command: "echo test", id: "test-btn", name: "Test" }];
      const mockLocalStorage = createMockLocalStorage();

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({
        configWriter: mockConfigWriter,
        localStorage: mockLocalStorage,
      });
      await configManager.updateButtonConfiguration(mockButtons);

      expect(mockLocalStorage.setButtons).toHaveBeenCalledWith(mockButtons);
      expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
    });
  });

  describe("getConfigDataForWebview with localStorage", () => {
    it("should return local buttons when local scope is selected", () => {
      const localButtons = [{ command: "echo local", id: "local-btn", name: "Local Command" }];
      const mockLocalStorage = createMockLocalStorage();
      (mockLocalStorage.getButtons as vi.Mock).mockReturnValue(localButtons);

      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({
        configWriter: mockConfigWriter,
        localStorage: mockLocalStorage,
      });
      const result = configManager.getConfigDataForWebview(mockConfigReader);

      expect(result).toEqual({
        buttons: localButtons,
        configurationTarget: CONFIGURATION_TARGETS.LOCAL,
      });
      expect(mockLocalStorage.getButtons).toHaveBeenCalled();
    });
  });

  describe("getRawButtonsForTarget", () => {
    it("should return empty array when getRawButtonsFromScope is not available", () => {
      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getRawButtonsForTarget(
        CONFIGURATION_TARGETS.WORKSPACE,
        mockConfigReader
      );

      expect(result).toEqual([]);
    });

    it("should return raw buttons from workspace scope", () => {
      const rawButtons = [{ command: "echo raw", name: "Raw Button" }];
      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
        getRawButtonsFromScope: vi.fn().mockReturnValue(rawButtons),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getRawButtonsForTarget(
        CONFIGURATION_TARGETS.WORKSPACE,
        mockConfigReader
      );

      expect(result).toEqual(rawButtons);
      expect(mockConfigReader.getRawButtonsFromScope).toHaveBeenCalledWith(
        vscode.ConfigurationTarget.Workspace
      );
    });

    it("should return raw buttons from global scope", () => {
      const rawButtons = [{ command: "echo global", name: "Global Button" }];
      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
        getRawButtonsFromScope: vi.fn().mockReturnValue(rawButtons),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getRawButtonsForTarget(
        CONFIGURATION_TARGETS.GLOBAL,
        mockConfigReader
      );

      expect(result).toEqual(rawButtons);
      expect(mockConfigReader.getRawButtonsFromScope).toHaveBeenCalledWith(
        vscode.ConfigurationTarget.Global
      );
    });

    it("should return local storage buttons for LOCAL scope", () => {
      const localButtons = [{ command: "echo local", id: "local-btn", name: "Local Button" }];
      const mockLocalStorage = createMockLocalStorage();
      (mockLocalStorage.getButtons as vi.Mock).mockReturnValue(localButtons);

      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
        getRawButtonsFromScope: vi.fn(),
      };

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({
        configWriter: mockConfigWriter,
        localStorage: mockLocalStorage,
      });
      const result = configManager.getRawButtonsForTarget(
        CONFIGURATION_TARGETS.LOCAL,
        mockConfigReader
      );

      expect(result).toEqual(localButtons);
    });

    it("should return empty array for unknown target", () => {
      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
        getRawButtonsFromScope: vi.fn(),
      };

      const mockConfig = createMockConfig();
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getRawButtonsForTarget(
        "unknown" as typeof CONFIGURATION_TARGETS.WORKSPACE,
        mockConfigReader
      );

      expect(result).toEqual([]);
    });
  });

  describe("getButtonsForTarget", () => {
    it("should return empty array for unknown target", () => {
      const mockConfigReader = {
        getButtons: vi.fn(),
        getButtonsFromScope: vi.fn(),
      };

      const mockConfig = createMockConfig();
      vi.spyOn(vscode.workspace, "getConfiguration").mockReturnValue(
        mockConfig as unknown as vscode.WorkspaceConfiguration
      );

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create({ configWriter: mockConfigWriter });
      const result = configManager.getButtonsForTarget(
        "unknown" as typeof CONFIGURATION_TARGETS.WORKSPACE,
        mockConfigReader
      );

      expect(result).toEqual([]);
    });
  });
});
