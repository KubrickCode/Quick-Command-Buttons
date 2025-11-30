import * as vscode from "vscode";
import { CONFIGURATION_TARGETS } from "../../pkg/config-constants";
import { ButtonConfig, ButtonSet } from "../../pkg/types";
import { ConfigReader } from "../adapters";
import { ButtonSetManager } from "./button-set-manager";
import { ConfigManager } from "./config-manager";

type ButtonSetWriter = {
  writeActiveSet: jest.Mock;
  writeButtonSets: jest.Mock;
};

type ButtonSetLocalStorage = {
  getActiveSet: jest.Mock;
  getButtonSets: jest.Mock;
  setActiveSet: jest.Mock;
  setButtonSets: jest.Mock;
};

describe("ButtonSetManager", () => {
  const createMockConfig = () => ({
    get: jest.fn(),
    inspect: jest.fn(),
    update: jest.fn(),
  });

  const createMockConfigManager = (): ConfigManager => {
    const mockConfigWriter = {
      writeButtons: jest.fn(),
      writeConfigurationTarget: jest.fn(),
    };
    return ConfigManager.create(mockConfigWriter);
  };

  const createMockConfigReader = (): ConfigReader => ({
    getButtons: jest.fn().mockReturnValue([]),
    getButtonsFromScope: jest.fn().mockReturnValue([]),
    getRawButtonsFromScope: jest.fn().mockReturnValue([]),
    getRefreshConfig: jest
      .fn()
      .mockReturnValue({ color: "#00BCD4", enabled: true, icon: "$(refresh)" }),
    onConfigChange: jest.fn().mockReturnValue({ dispose: jest.fn() }),
    validateButtons: jest.fn().mockReturnValue({ errors: [], hasErrors: false }),
  });

  const createMockButtonSetWriter = (): ButtonSetWriter => ({
    writeActiveSet: jest.fn(),
    writeButtonSets: jest.fn(),
  });

  const createMockButtonSetLocalStorage = (): ButtonSetLocalStorage => ({
    getActiveSet: jest.fn().mockReturnValue(null),
    getButtonSets: jest.fn().mockReturnValue([]),
    setActiveSet: jest.fn(),
    setButtonSets: jest.fn(),
  });

  const createTestButtons = (): ButtonConfig[] => [
    { command: "echo test1", id: "btn-1", name: "Test 1" },
    { command: "echo test2", id: "btn-2", name: "Test 2" },
  ];

  const createTestButtonSets = (): ButtonSet[] => [
    {
      buttons: [{ command: "echo frontend", id: "fe-btn", name: "Frontend" }],
      id: "set-1",
      name: "Frontend",
    },
    {
      buttons: [{ command: "echo backend", id: "be-btn", name: "Backend" }],
      id: "set-2",
      name: "Backend",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("create", () => {
    it("should create ButtonSetManager instance", () => {
      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);

      expect(manager).toBeInstanceOf(ButtonSetManager);
    });
  });

  describe("getButtonSets", () => {
    it("should return button sets from workspace scope", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({
        workspaceValue: [{ buttons: [], name: "Test Set" }],
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const sets = manager.getButtonSets();

      expect(sets).toHaveLength(1);
      expect(sets[0].name).toBe("Test Set");
      expect(sets[0].id).toBeDefined();
    });

    it("should return button sets from global scope", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.GLOBAL);
      mockConfig.inspect.mockReturnValue({
        globalValue: [{ buttons: [], name: "Global Set" }],
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const sets = manager.getButtonSets();

      expect(sets).toHaveLength(1);
      expect(sets[0].name).toBe("Global Set");
    });

    it("should return button sets from local storage when local scope", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const localSets = createTestButtonSets();
      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();
      const buttonSetLocalStorage = createMockButtonSetLocalStorage();
      buttonSetLocalStorage.getButtonSets.mockReturnValue(localSets);

      const manager = ButtonSetManager.create(
        configManager,
        configReader,
        buttonSetWriter,
        buttonSetLocalStorage
      );
      const sets = manager.getButtonSets();

      expect(sets).toEqual(localSets);
      expect(buttonSetLocalStorage.getButtonSets).toHaveBeenCalled();
    });
  });

  describe("getActiveSet", () => {
    it("should return null when no active set", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({ workspaceValue: null });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const activeSet = manager.getActiveSet();

      expect(activeSet).toBeNull();
    });

    it("should return active set name from workspace scope", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({ workspaceValue: "Frontend" });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const activeSet = manager.getActiveSet();

      expect(activeSet).toBe("Frontend");
    });

    it("should return active set from local storage when local scope", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();
      const buttonSetLocalStorage = createMockButtonSetLocalStorage();
      buttonSetLocalStorage.getActiveSet.mockReturnValue("LocalSet");

      const manager = ButtonSetManager.create(
        configManager,
        configReader,
        buttonSetWriter,
        buttonSetLocalStorage
      );
      const activeSet = manager.getActiveSet();

      expect(activeSet).toBe("LocalSet");
      expect(buttonSetLocalStorage.getActiveSet).toHaveBeenCalled();
    });
  });

  describe("setActiveSet", () => {
    it("should set active set to workspace scope", async () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      await manager.setActiveSet("Frontend");

      expect(buttonSetWriter.writeActiveSet).toHaveBeenCalledWith(
        "Frontend",
        vscode.ConfigurationTarget.Workspace
      );
    });

    it("should set active set to null (Default)", async () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      await manager.setActiveSet(null);

      expect(buttonSetWriter.writeActiveSet).toHaveBeenCalledWith(
        null,
        vscode.ConfigurationTarget.Workspace
      );
    });

    it("should set active set to local storage when local scope", async () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.LOCAL);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();
      const buttonSetLocalStorage = createMockButtonSetLocalStorage();

      const manager = ButtonSetManager.create(
        configManager,
        configReader,
        buttonSetWriter,
        buttonSetLocalStorage
      );
      await manager.setActiveSet("LocalSet");

      expect(buttonSetLocalStorage.setActiveSet).toHaveBeenCalledWith("LocalSet");
      expect(buttonSetWriter.writeActiveSet).not.toHaveBeenCalled();
    });
  });

  describe("getButtonsForActiveSet", () => {
    it("should return null when no active set", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({
        workspaceValue: null,
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const buttons = manager.getButtonsForActiveSet();

      expect(buttons).toBeNull();
    });

    it("should return buttons from active set", () => {
      const testSets = createTestButtonSets();
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "activeSet") {
          return { workspaceValue: "Frontend" };
        }
        if (key === "buttonSets") {
          return {
            workspaceValue: testSets.map((s) => ({ buttons: s.buttons, name: s.name })),
          };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const buttons = manager.getButtonsForActiveSet();

      expect(buttons).toBeDefined();
      expect(buttons).toHaveLength(1);
      expect(buttons![0].name).toBe("Frontend");
    });

    it("should return null when active set not found", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "activeSet") {
          return { workspaceValue: "NonExistent" };
        }
        if (key === "buttonSets") {
          return { workspaceValue: [] };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const buttons = manager.getButtonsForActiveSet();

      expect(buttons).toBeNull();
    });
  });

  describe("saveAsButtonSet", () => {
    it("should save current buttons as new set", async () => {
      const testButtons = createTestButtons();
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({ workspaceValue: [] });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      jest.spyOn(configManager, "getButtonsWithFallback").mockReturnValue({
        buttons: testButtons,
        scope: CONFIGURATION_TARGETS.WORKSPACE,
      });

      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.saveAsButtonSet("New Set");

      expect(result.success).toBe(true);
      expect(buttonSetWriter.writeButtonSets).toHaveBeenCalled();
      const writtenSets = buttonSetWriter.writeButtonSets.mock.calls[0][0];
      expect(writtenSets).toHaveLength(1);
      expect(writtenSets[0].name).toBe("New Set");
    });

    it("should return error for empty name", async () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.saveAsButtonSet("   ");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("setNameRequired");
      }
    });

    it("should return error for duplicate name", async () => {
      const existingSets = createTestButtonSets();
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({
        workspaceValue: existingSets.map((s) => ({ buttons: s.buttons, name: s.name })),
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.saveAsButtonSet("Frontend");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("duplicateSetName");
      }
    });

    it("should be case-insensitive for duplicate check", async () => {
      const existingSets = createTestButtonSets();
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({
        workspaceValue: existingSets.map((s) => ({ buttons: s.buttons, name: s.name })),
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.saveAsButtonSet("FRONTEND");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("duplicateSetName");
      }
    });

    it("should use active set buttons when active set exists", async () => {
      const activeSetButtons = [
        { command: "active:cmd1", id: "active-1", name: "Active Button 1" },
        { command: "active:cmd2", id: "active-2", name: "Active Button 2" },
      ];
      const existingSets = [{ buttons: activeSetButtons, id: "set-1", name: "Active Set" }];
      const defaultButtons = [{ command: "default:cmd", id: "default-1", name: "Default Button" }];

      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return {
            workspaceValue: existingSets.map((s) => ({ buttons: s.buttons, name: s.name })),
          };
        }
        if (key === "activeSet") {
          return { workspaceValue: "Active Set" };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      jest.spyOn(configManager, "getButtonsWithFallback").mockReturnValue({
        buttons: defaultButtons,
        scope: CONFIGURATION_TARGETS.WORKSPACE,
      });

      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.saveAsButtonSet("New Set From Active");

      expect(result.success).toBe(true);
      expect(buttonSetWriter.writeButtonSets).toHaveBeenCalled();
      const writtenSets = buttonSetWriter.writeButtonSets.mock.calls[0][0];
      expect(writtenSets).toHaveLength(2);
      expect(writtenSets[1].name).toBe("New Set From Active");
      expect(writtenSets[1].buttons).toHaveLength(2);
      expect(writtenSets[1].buttons[0].command).toBe("active:cmd1");
    });
  });

  describe("deleteButtonSet", () => {
    it("should delete existing button set", async () => {
      const existingSets = createTestButtonSets();
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return {
            workspaceValue: existingSets.map((s) => ({ buttons: s.buttons, name: s.name })),
          };
        }
        if (key === "activeSet") {
          return { workspaceValue: null };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      await manager.deleteButtonSet("Frontend");

      expect(buttonSetWriter.writeButtonSets).toHaveBeenCalled();
      const writtenSets = buttonSetWriter.writeButtonSets.mock.calls[0][0];
      expect(writtenSets).toHaveLength(1);
      expect(writtenSets[0].name).toBe("Backend");
    });

    it("should reset active set to null when deleting active set", async () => {
      const existingSets = createTestButtonSets();
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return {
            workspaceValue: existingSets.map((s) => ({ buttons: s.buttons, name: s.name })),
          };
        }
        if (key === "activeSet") {
          return { workspaceValue: "Frontend" };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      await manager.deleteButtonSet("Frontend");

      expect(buttonSetWriter.writeActiveSet).toHaveBeenCalledWith(
        null,
        vscode.ConfigurationTarget.Workspace
      );
    });

    it("should not modify anything when set not found", async () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({ workspaceValue: [] });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      await manager.deleteButtonSet("NonExistent");

      expect(buttonSetWriter.writeButtonSets).not.toHaveBeenCalled();
    });
  });

  describe("validateUniqueName", () => {
    it("should return true for unique name", () => {
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({ workspaceValue: [] });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = manager.validateUniqueName("New Set");

      expect(result).toBe(true);
    });

    it("should return false for existing name", () => {
      const existingSets = createTestButtonSets();
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockReturnValue({
        workspaceValue: existingSets.map((s) => ({ buttons: s.buttons, name: s.name })),
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = manager.validateUniqueName("Frontend");

      expect(result).toBe(false);
    });
  });

  describe("renameButtonSet", () => {
    it("should return setNotFound error when renaming non-existent set", async () => {
      const existingSets = [{ buttons: [], id: "set-1", name: "SetA" }];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return { workspaceValue: existingSets };
        }
        if (key === "activeSet") {
          return { workspaceValue: null };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.renameButtonSet("NonExistent", "NewName");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("setNotFound");
      }
    });

    it("should return setNameRequired error when new name is empty", async () => {
      const existingSets = [{ buttons: [], id: "set-1", name: "SetA" }];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return { workspaceValue: existingSets };
        }
        if (key === "activeSet") {
          return { workspaceValue: null };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.renameButtonSet("SetA", "   ");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("setNameRequired");
      }
    });

    it("should update active set when renaming currently active set", async () => {
      const existingSets = [{ buttons: [], id: "set-1", name: "SetA" }];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return { workspaceValue: existingSets };
        }
        if (key === "activeSet") {
          return { workspaceValue: "SetA" };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.renameButtonSet("SetA", "SetB");

      expect(result.success).toBe(true);
      expect(buttonSetWriter.writeActiveSet).toHaveBeenCalledWith("SetB", expect.anything());
    });

    it("should NOT update active set when renaming non-active set", async () => {
      const existingSets = [
        { buttons: [], id: "set-1", name: "SetA" },
        { buttons: [], id: "set-2", name: "SetB" },
      ];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return { workspaceValue: existingSets };
        }
        if (key === "activeSet") {
          return { workspaceValue: "SetA" };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.renameButtonSet("SetB", "SetC");

      expect(result.success).toBe(true);
      expect(buttonSetWriter.writeActiveSet).not.toHaveBeenCalled();
    });

    it("should detect duplicate when renaming to existing name with different case", async () => {
      const existingSets = [
        { buttons: [], id: "set-1", name: "SetA" },
        { buttons: [], id: "set-2", name: "setb" },
      ];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return {
            workspaceValue: existingSets,
          };
        }
        if (key === "activeSet") {
          return { workspaceValue: null };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.renameButtonSet("SetA", "SETB");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("duplicateSetName");
      }
    });

    it("should allow renaming to same name with different case", async () => {
      const existingSets = [
        { buttons: [], id: "set-1", name: "SetA" },
        { buttons: [], id: "set-2", name: "SetB" },
      ];
      const mockConfig = createMockConfig();
      mockConfig.get.mockReturnValue(CONFIGURATION_TARGETS.WORKSPACE);
      mockConfig.inspect.mockImplementation((key: string) => {
        if (key === "buttonSets") {
          return {
            workspaceValue: existingSets,
          };
        }
        if (key === "activeSet") {
          return { workspaceValue: null };
        }
        return {};
      });
      jest
        .spyOn(vscode.workspace, "getConfiguration")
        .mockReturnValue(mockConfig as unknown as vscode.WorkspaceConfiguration);

      const configManager = createMockConfigManager();
      const configReader = createMockConfigReader();
      const buttonSetWriter = createMockButtonSetWriter();

      const manager = ButtonSetManager.create(configManager, configReader, buttonSetWriter);
      const result = await manager.renameButtonSet("SetA", "SETA");

      expect(result.success).toBe(true);
      expect(buttonSetWriter.writeButtonSets).toHaveBeenCalled();
      const writtenSets = buttonSetWriter.writeButtonSets.mock.calls[0][0];
      expect(writtenSets[0].name).toBe("SETA");
    });
  });
});
