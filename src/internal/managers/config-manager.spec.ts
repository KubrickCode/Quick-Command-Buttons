import * as vscode from "vscode";
import { CONFIGURATION_TARGETS } from "../../pkg/config-constants";
import { ConfigManager } from "./config-manager";

describe("ConfigManager", () => {
  const createMockConfig = () => ({
    get: jest.fn(),
    update: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("should create ConfigManager instance", () => {
      const configManager = ConfigManager.create();
      expect(configManager).toBeInstanceOf(ConfigManager);
    });
  });

  describe("getCurrentConfigurationTarget", () => {
    it("should return workspace target by default", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
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
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      const result = configManager.getCurrentConfigurationTarget();

      expect(result).toBe(CONFIGURATION_TARGETS.GLOBAL);
    });
  });

  describe("getVSCodeConfigurationTarget", () => {
    it("should return vscode.ConfigurationTarget.Workspace for workspace target", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      const result = configManager.getVSCodeConfigurationTarget();

      expect(result).toBe(vscode.ConfigurationTarget.Workspace);
    });

    it("should return vscode.ConfigurationTarget.Global for global target", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      const result = configManager.getVSCodeConfigurationTarget();

      expect(result).toBe(vscode.ConfigurationTarget.Global);
    });
  });

  describe("getConfigDataForWebview", () => {
    it("should return buttons and configuration target", () => {
      const mockButtons = [
        { command: "echo test1", name: "Test 1" },
        { command: "echo test2", name: "Test 2" },
      ];
      const mockConfigReader = {
        getButtons: jest.fn().mockReturnValue(mockButtons),
      };
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      const result = configManager.getConfigDataForWebview(mockConfigReader);

      expect(result).toEqual({
        buttons: mockButtons,
        configurationTarget: CONFIGURATION_TARGETS.WORKSPACE,
      });
      expect(mockConfigReader.getButtons).toHaveBeenCalled();
    });
  });

  describe("updateButtonConfiguration", () => {
    it("should update buttons configuration with correct target", async () => {
      const mockButtons = [{ command: "echo test", id: "test-btn", name: "Test" }];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.update.mockResolvedValue(undefined);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      await configManager.updateButtonConfiguration(mockButtons);

      expect(mockConfig.update).toHaveBeenCalledWith(
        "buttons",
        mockButtons,
        vscode.ConfigurationTarget.Workspace
      );
    });

    it("should use global target when configured", async () => {
      const mockButtons = [{ command: "echo test", id: "test-btn", name: "Test" }];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      mockConfig.update.mockResolvedValue(undefined);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      await configManager.updateButtonConfiguration(mockButtons);

      expect(mockConfig.update).toHaveBeenCalledWith(
        "buttons",
        mockButtons,
        vscode.ConfigurationTarget.Global
      );
    });
  });

  describe("updateConfigurationTarget", () => {
    it("should update configuration target to global", async () => {
      const mockConfig = createMockConfig();
      mockConfig.update.mockResolvedValue(undefined);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      await configManager.updateConfigurationTarget(CONFIGURATION_TARGETS.GLOBAL);

      expect(mockConfig.update).toHaveBeenCalledWith(
        "configurationTarget",
        CONFIGURATION_TARGETS.GLOBAL,
        vscode.ConfigurationTarget.Global
      );
    });

    it("should update configuration target to workspace", async () => {
      const mockConfig = createMockConfig();
      mockConfig.update.mockResolvedValue(undefined);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      await configManager.updateConfigurationTarget(CONFIGURATION_TARGETS.WORKSPACE);

      expect(mockConfig.update).toHaveBeenCalledWith(
        "configurationTarget",
        CONFIGURATION_TARGETS.WORKSPACE,
        vscode.ConfigurationTarget.Global
      );
    });

    it("should always use Global target for configurationTarget setting", async () => {
      const mockConfig = createMockConfig();
      mockConfig.update.mockResolvedValue(undefined);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = ConfigManager.create();
      await configManager.updateConfigurationTarget(CONFIGURATION_TARGETS.WORKSPACE);

      const updateCall = mockConfig.update.mock.calls[0];
      expect(updateCall[2]).toBe(vscode.ConfigurationTarget.Global);
    });
  });
});
