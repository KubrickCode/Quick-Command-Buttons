import * as vscode from "vscode";
import {
  createVSCodeConfigReader,
  createVSCodeStatusBarCreator,
  createVSCodeQuickPickCreator,
  createVSCodeConfigWriter,
} from "../internal/adapters";
import { executeButtonCommand } from "../internal/command-executor";
import { ConfigManager } from "../internal/managers/config-manager";
import { StatusBarManager } from "../internal/managers/status-bar-manager";
import { TerminalManager } from "../internal/managers/terminal-manager";
import { CommandTreeProvider, CommandTreeItem } from "../internal/providers/command-tree-provider";
import { ConfigWebviewProvider } from "../internal/providers/webview-provider";
import { createShowAllCommandsCommand } from "../internal/show-all-commands";
import { CONFIGURATION_TARGETS } from "../pkg/config-constants";
import { ButtonConfig } from "../pkg/types";

export const registerCommands = (
  context: vscode.ExtensionContext,
  configReader: ReturnType<typeof createVSCodeConfigReader>,
  quickPickCreator: ReturnType<typeof createVSCodeQuickPickCreator>,
  terminalManager: TerminalManager,
  statusBarManager: StatusBarManager,
  treeProvider: CommandTreeProvider,
  configManager: ConfigManager
) => {
  const executeCommand = vscode.commands.registerCommand(
    "quickCommandButtons.execute",
    (button: ButtonConfig) =>
      executeButtonCommand(button, terminalManager.executeCommand, quickPickCreator)
  );

  const executeFromTreeCommand = vscode.commands.registerCommand(
    "quickCommandButtons.executeFromTree",
    (item: CommandTreeItem) =>
      CommandTreeProvider.executeFromTree(item, terminalManager.executeCommand)
  );

  const refreshTreeCommand = vscode.commands.registerCommand(
    "quickCommandButtons.refreshTree",
    () => treeProvider.refresh()
  );

  const refreshCommand = vscode.commands.registerCommand("quickCommandButtons.refresh", () => {
    statusBarManager.refreshButtons();
    treeProvider.refresh();
    vscode.window.showInformationMessage("Quick Command Buttons refreshed!");
  });

  const showAllCommandsCommand = vscode.commands.registerCommand(
    "quickCommandButtons.showAllCommands",
    createShowAllCommandsCommand(configReader, terminalManager.executeCommand, quickPickCreator)
  );

  const openConfigCommand = vscode.commands.registerCommand(
    "quickCommandButtons.openConfig",
    ConfigWebviewProvider.createWebviewCommand(context.extensionUri, configReader, configManager)
  );

  const toggleConfigurationTargetCommand = vscode.commands.registerCommand(
    "quickCommandButtons.toggleConfigurationTarget",
    async () => {
      const currentTarget = configManager.getCurrentConfigurationTarget();
      const newTarget =
        currentTarget === CONFIGURATION_TARGETS.WORKSPACE
          ? CONFIGURATION_TARGETS.GLOBAL
          : CONFIGURATION_TARGETS.WORKSPACE;

      await configManager.updateConfigurationTarget(newTarget);
    }
  );

  return {
    executeCommand,
    executeFromTreeCommand,
    openConfigCommand,
    refreshCommand,
    refreshTreeCommand,
    showAllCommandsCommand,
    toggleConfigurationTargetCommand,
  };
};

export const activate = (context: vscode.ExtensionContext) => {
  const configReader = createVSCodeConfigReader();
  const statusBarCreator = createVSCodeStatusBarCreator();
  const quickPickCreator = createVSCodeQuickPickCreator();
  const configWriter = createVSCodeConfigWriter();

  const terminalManager = TerminalManager.create();
  const statusBarManager = StatusBarManager.create(configReader, statusBarCreator);
  const treeProvider = CommandTreeProvider.create(configReader);
  const configManager = ConfigManager.create(configWriter);

  statusBarManager.refreshButtons();

  const configChangeListener = configReader.onConfigChange(() => {
    statusBarManager.refreshButtons();
    treeProvider.refresh();
  });

  const commands = registerCommands(
    context,
    configReader,
    quickPickCreator,
    terminalManager,
    statusBarManager,
    treeProvider,
    configManager
  );

  const treeView = vscode.window.createTreeView("quickCommandsTree", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(
    ...Object.values(commands),
    treeView,
    statusBarManager,
    terminalManager,
    configChangeListener
  );
};

export const deactivate = () => {
  // Cleanup will be handled by context.subscriptions disposal
};
