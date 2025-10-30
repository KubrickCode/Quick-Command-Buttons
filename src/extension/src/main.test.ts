import * as vscode from "vscode";
import { CommandTreeProvider } from "./command-tree-provider";
import { registerCommands } from "./main";
import { createShowAllCommandsCommand } from "./show-all-commands";
import { StatusBarManager } from "./status-bar-manager";
import { TerminalManager } from "./terminal-manager";
import { ConfigWebviewProvider } from "./webview-provider";

// Mock other modules
jest.mock("./command-executor", () => ({
  executeButtonCommand: jest.fn(),
}));

jest.mock("./show-all-commands", () => ({
  createShowAllCommandsCommand: jest.fn(),
}));

jest.mock("./webview-provider", () => ({
  ConfigWebviewProvider: {
    createWebviewCommand: jest.fn(),
  },
}));

jest.mock("./command-tree-provider", () => ({
  CommandTreeProvider: {
    executeFromTree: jest.fn(),
  },
}));

describe("main", () => {
  let mockContext: vscode.ExtensionContext;
  let mockConfigReader: any;
  let mockQuickPickCreator: any;
  let mockTerminalManager: TerminalManager;
  let mockStatusBarManager: StatusBarManager;
  let mockTreeProvider: CommandTreeProvider;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContext = {
      extensionUri: "mockUri" as any,
    } as vscode.ExtensionContext;

    mockConfigReader = {
      getButtons: jest.fn(),
      onConfigChange: jest.fn(),
    };

    mockQuickPickCreator = jest.fn();

    mockTerminalManager = {
      executeCommand: jest.fn(),
    } as any;

    mockStatusBarManager = {
      refreshButtons: jest.fn(),
    } as any;

    mockTreeProvider = {
      refresh: jest.fn(),
    } as any;

    (vscode.commands.registerCommand as jest.Mock).mockReturnValue("mockDisposable");
  });

  describe("registerCommands", () => {
    it("should register quickCommandButtons.execute command", () => {
      const commands = registerCommands(
        mockContext,
        mockConfigReader,
        mockQuickPickCreator,
        mockTerminalManager,
        mockStatusBarManager,
        mockTreeProvider
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.execute",
        expect.any(Function)
      );
      expect(commands.executeCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.executeFromTree command", () => {
      const commands = registerCommands(
        mockContext,
        mockConfigReader,
        mockQuickPickCreator,
        mockTerminalManager,
        mockStatusBarManager,
        mockTreeProvider
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.executeFromTree",
        expect.any(Function)
      );
      expect(commands.executeFromTreeCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.refreshTree command", () => {
      const commands = registerCommands(
        mockContext,
        mockConfigReader,
        mockQuickPickCreator,
        mockTerminalManager,
        mockStatusBarManager,
        mockTreeProvider
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.refreshTree",
        expect.any(Function)
      );
      expect(commands.refreshTreeCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.refresh command", () => {
      const commands = registerCommands(
        mockContext,
        mockConfigReader,
        mockQuickPickCreator,
        mockTerminalManager,
        mockStatusBarManager,
        mockTreeProvider
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.refresh",
        expect.any(Function)
      );
      expect(commands.refreshCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.showAllCommands command", () => {
      const mockShowAllCommand = jest.fn();
      (createShowAllCommandsCommand as jest.Mock).mockReturnValue(mockShowAllCommand);

      const commands = registerCommands(
        mockContext,
        mockConfigReader,
        mockQuickPickCreator,
        mockTerminalManager,
        mockStatusBarManager,
        mockTreeProvider
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.showAllCommands",
        mockShowAllCommand
      );
      expect(createShowAllCommandsCommand).toHaveBeenCalledWith(
        mockConfigReader,
        mockTerminalManager.executeCommand,
        mockQuickPickCreator
      );
      expect(commands.showAllCommandsCommand).toBe("mockDisposable");
    });

    it("should register quickCommandButtons.openConfig command", () => {
      const mockWebviewCommand = jest.fn();
      (ConfigWebviewProvider.createWebviewCommand as jest.Mock).mockReturnValue(mockWebviewCommand);

      const commands = registerCommands(
        mockContext,
        mockConfigReader,
        mockQuickPickCreator,
        mockTerminalManager,
        mockStatusBarManager,
        mockTreeProvider
      );

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "quickCommandButtons.openConfig",
        mockWebviewCommand
      );
      expect(ConfigWebviewProvider.createWebviewCommand).toHaveBeenCalledWith(
        mockContext.extensionUri,
        mockConfigReader
      );
      expect(commands.openConfigCommand).toBe("mockDisposable");
    });

    it("should return all registered command disposables", () => {
      const commands = registerCommands(
        mockContext,
        mockConfigReader,
        mockQuickPickCreator,
        mockTerminalManager,
        mockStatusBarManager,
        mockTreeProvider
      );

      expect(commands).toEqual({
        executeCommand: "mockDisposable",
        executeFromTreeCommand: "mockDisposable",
        openConfigCommand: "mockDisposable",
        refreshCommand: "mockDisposable",
        refreshTreeCommand: "mockDisposable",
        showAllCommandsCommand: "mockDisposable",
        toggleConfigurationTargetCommand: "mockDisposable",
      });
    });
  });
});
