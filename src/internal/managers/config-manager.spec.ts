import * as vscode from "vscode";
import { CONFIGURATION_TARGETS } from "../../pkg/config-constants";
import { ConfigWriter } from "../adapters";
import { ConfigManager } from "./config-manager";

describe("ConfigManager", () => {
  const createMockConfig = () => ({
    get: jest.fn(),
    update: jest.fn(),
  });

  const createMockConfigWriter = (): ConfigWriter => ({
    writeButtons: jest.fn(),
    writeConfigurationTarget: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("should create ConfigManager instance", () => {
      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
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

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
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

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
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

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
      const result = configManager.getVSCodeConfigurationTarget();

      expect(result).toBe(vscode.ConfigurationTarget.Workspace);
    });

    it("should return vscode.ConfigurationTarget.Global for global target", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
      const result = configManager.getVSCodeConfigurationTarget();

      expect(result).toBe(vscode.ConfigurationTarget.Global);
    });
  });

  describe("getConfigDataForWebview", () => {
    it("should return buttons from workspace scope when configuration target is workspace", () => {
      const mockButtons = [
        { command: "echo test1", name: "Test 1" },
        { command: "echo test2", name: "Test 2" },
      ];
      const mockConfigReader = {
        getButtons: jest.fn().mockReturnValue(mockButtons),
        getButtonsFromScope: jest.fn().mockReturnValue(mockButtons),
      };
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
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
        getButtons: jest.fn().mockReturnValue([]),
        getButtonsFromScope: jest.fn().mockReturnValue(mockGlobalButtons),
      };
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
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
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
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
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
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
      const configManager = ConfigManager.create(mockConfigWriter);
      await configManager.updateConfigurationTarget(CONFIGURATION_TARGETS.GLOBAL);

      expect(mockConfigWriter.writeConfigurationTarget).toHaveBeenCalledWith(
        CONFIGURATION_TARGETS.GLOBAL
      );
    });

    it("should update configuration target to workspace", async () => {
      const mockConfigWriter = createMockConfigWriter();
      const configManager = ConfigManager.create(mockConfigWriter);
      await configManager.updateConfigurationTarget(CONFIGURATION_TARGETS.WORKSPACE);

      expect(mockConfigWriter.writeConfigurationTarget).toHaveBeenCalledWith(
        CONFIGURATION_TARGETS.WORKSPACE
      );
    });
  });
});
