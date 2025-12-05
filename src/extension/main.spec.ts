import * as vscode from "vscode";
import { registerCommands } from "./main";
import { EventBus } from "../internal/event-bus";
import { ButtonSetManager } from "../internal/managers/button-set-manager";
import { ConfigManager } from "../internal/managers/config-manager";
import { ImportExportManager } from "../internal/managers/import-export-manager";
import { TerminalManager } from "../internal/managers/terminal-manager";
import { ConfigWebviewProvider } from "../internal/providers/webview-provider";
import { createShowAllCommandsCommand } from "../internal/show-all-commands";

// Mock other modules
vi.mock("../internal/command-executor", () => ({
  executeButtonCommand: vi.fn(),
}));

vi.mock("../internal/show-all-commands", () => ({
  createShowAllCommandsCommand: vi.fn(),
}));

vi.mock("../internal/providers/webview-provider", () => ({
  ConfigWebviewProvider: {
    createWebviewCommand: vi.fn(),
  },
}));

vi.mock("../internal/providers/command-tree-provider", () => ({
  CommandTreeProvider: {
    executeFromTree: vi.fn(),
  },
}));

describe("main", () => {
  let mockContext: vscode.ExtensionContext;
  let mockConfigReader: any;
  let mockQuickPickCreator: any;
  let mockTerminalManager: TerminalManager;
  let mockConfigManager: ConfigManager;
  let mockImportExportManager: ImportExportManager;
  let mockButtonSetManager: ButtonSetManager;
  let mockEventBus: EventBus;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
      extensionUri: "mockUri" as any,
    } as vscode.ExtensionContext;

    mockConfigReader = {
      getButtons: vi.fn(),
      onConfigChange: vi.fn(),
    };

    mockQuickPickCreator = vi.fn();

    mockTerminalManager = {
      executeCommand: vi.fn(),
    } as any;

    mockConfigManager = {
      getCurrentConfigurationTarget: vi.fn().mockReturnValue("workspace"),
      updateConfigurationTarget: vi.fn(),
    } as any;

    mockImportExportManager = {
      exportConfiguration: vi.fn(),
      importConfiguration: vi.fn(),
    } as any;

    mockButtonSetManager = {
      deleteButtonSet: vi.fn(),
      getActiveSet: vi.fn().mockReturnValue(null),
      getButtonSets: vi.fn().mockReturnValue([]),
      saveAsButtonSet: vi.fn().mockResolvedValue({ success: true }),
      setActiveSet: vi.fn(),
      validateUniqueName: vi.fn().mockReturnValue(true),
    } as any;

    mockEventBus = {
      emit: vi.fn(),
      on: vi.fn().mockReturnValue(() => {}),
      off: vi.fn(),
      dispose: vi.fn(),
    } as any;

    (vscode.commands.registerCommand as vi.Mock).mockReturnValue("mockDisposable");
  });

  describe("registerCommands", () => {
    it("should register quickCommandButtons.execute command", () => {
      const commands = registerCommands({
        buttonSetManager: mockButtonSetManager,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
        context: mockContext,
        eventBus: mockEventBus,
        importExportManager: mockImportExportManager,
        quickPickCreator: mockQuickPickCreator,
        terminalManager: mockTerminalManager,
      });

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.execute",
        expect.any(Function)
      );
      expect(commands.executeCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.executeFromTree command", () => {
      const commands = registerCommands({
        buttonSetManager: mockButtonSetManager,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
        context: mockContext,
        eventBus: mockEventBus,
        importExportManager: mockImportExportManager,
        quickPickCreator: mockQuickPickCreator,
        terminalManager: mockTerminalManager,
      });

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.executeFromTree",
        expect.any(Function)
      );
      expect(commands.executeFromTreeCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.refreshTree command", () => {
      const commands = registerCommands({
        buttonSetManager: mockButtonSetManager,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
        context: mockContext,
        eventBus: mockEventBus,
        importExportManager: mockImportExportManager,
        quickPickCreator: mockQuickPickCreator,
        terminalManager: mockTerminalManager,
      });

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.refreshTree",
        expect.any(Function)
      );
      expect(commands.refreshTreeCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.refresh command", () => {
      const commands = registerCommands({
        buttonSetManager: mockButtonSetManager,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
        context: mockContext,
        eventBus: mockEventBus,
        importExportManager: mockImportExportManager,
        quickPickCreator: mockQuickPickCreator,
        terminalManager: mockTerminalManager,
      });

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.refresh",
        expect.any(Function)
      );
      expect(commands.refreshCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.showAllCommands command", () => {
      const mockShowAllCommand = vi.fn();
      (createShowAllCommandsCommand as vi.Mock).mockReturnValue(mockShowAllCommand);

      const commands = registerCommands({
        buttonSetManager: mockButtonSetManager,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
        context: mockContext,
        eventBus: mockEventBus,
        importExportManager: mockImportExportManager,
        quickPickCreator: mockQuickPickCreator,
        terminalManager: mockTerminalManager,
      });

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.showAllCommands",
        mockShowAllCommand
      );
      expect(createShowAllCommandsCommand).toHaveBeenCalledWith(
        mockConfigReader,
        mockTerminalManager.executeCommand,
        mockQuickPickCreator,
        mockConfigManager,
        mockButtonSetManager
      );
      expect(commands.showAllCommandsCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.openConfig command", () => {
      const mockWebviewCommand = vi.fn();
      (ConfigWebviewProvider.createWebviewCommand as vi.Mock).mockReturnValue(mockWebviewCommand);

      const commands = registerCommands({
        buttonSetManager: mockButtonSetManager,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
        context: mockContext,
        eventBus: mockEventBus,
        importExportManager: mockImportExportManager,
        quickPickCreator: mockQuickPickCreator,
        terminalManager: mockTerminalManager,
      });

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.openConfig",
        mockWebviewCommand
      );
      expect(ConfigWebviewProvider.createWebviewCommand).toHaveBeenCalledWith(
        mockContext.extensionUri,
        mockConfigReader,
        mockConfigManager,
        mockImportExportManager,
        mockButtonSetManager
      );
      expect(commands.openConfigCommand).toBe("mockDisposable");
    });

    it("should return all registered command disposables", () => {
      const commands = registerCommands({
        buttonSetManager: mockButtonSetManager,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
        context: mockContext,
        eventBus: mockEventBus,
        importExportManager: mockImportExportManager,
        quickPickCreator: mockQuickPickCreator,
        terminalManager: mockTerminalManager,
      });

      expect(commands).toEqual({
        deleteButtonSetCommand: "mockDisposable",
        executeCommand: "mockDisposable",
        executeFromTreeCommand: "mockDisposable",
        exportConfigurationCommand: "mockDisposable",
        importConfigurationCommand: "mockDisposable",
        openConfigCommand: "mockDisposable",
        refreshCommand: "mockDisposable",
        refreshTreeCommand: "mockDisposable",
        saveAsButtonSetCommand: "mockDisposable",
        showAllCommandsCommand: "mockDisposable",
        switchButtonSetCommand: "mockDisposable",
        toggleConfigurationTargetCommand: "mockDisposable",
      });
    });
  });
});
