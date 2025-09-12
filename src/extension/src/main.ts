import * as vscode from "vscode";
import { ButtonConfig } from "./types";
import { StatusBarManager } from "./status-bar-manager";
import { CommandTreeProvider, CommandTreeItem } from "./command-tree-provider";
import { TerminalManager } from "./terminal-manager";
import { executeButtonCommand } from "./command-executor";
import { createShowAllCommandsCommand } from "./show-all-commands";
import { ConfigWebviewProvider } from "./webview-provider";
import {
  createVSCodeConfigReader,
  createVSCodeStatusBarCreator,
  createVSCodeQuickPickCreator,
} from "./adapters";

export const activate = (context: vscode.ExtensionContext) => {
  const configReader = createVSCodeConfigReader();
  const statusBarCreator = createVSCodeStatusBarCreator();
  const quickPickCreator = createVSCodeQuickPickCreator();

  const terminalManager = TerminalManager.create();
  const statusBarManager = StatusBarManager.create(
    configReader,
    statusBarCreator
  );
  const treeProvider = CommandTreeProvider.create(configReader);

  statusBarManager.refreshButtons();

  const configChangeListener = configReader.onConfigChange(() => {
    statusBarManager.refreshButtons();
    treeProvider.refresh();
  });

  const executeCommand = vscode.commands.registerCommand(
    "quickCommandButtons.execute",
    (button: ButtonConfig) =>
      executeButtonCommand(
        button,
        terminalManager.executeCommand,
        quickPickCreator
      )
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

  const refreshCommand = vscode.commands.registerCommand(
    "quickCommandButtons.refresh",
    () => {
      statusBarManager.refreshButtons();
      treeProvider.refresh();
      vscode.window.showInformationMessage("Quick Command Buttons refreshed!");
    }
  );

  const showAllCommandsCommand = vscode.commands.registerCommand(
    "quickCommandButtons.showAllCommands",
    createShowAllCommandsCommand(
      configReader,
      terminalManager.executeCommand,
      quickPickCreator
    )
  );

  const openConfigCommand = vscode.commands.registerCommand(
    "quickCommandButtons.openConfig",
    ConfigWebviewProvider.createWebviewCommand(
      context.extensionUri,
      configReader
    )
  );

  const treeView = vscode.window.createTreeView("quickCommandsTree", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(
    executeCommand,
    executeFromTreeCommand,
    refreshTreeCommand,
    refreshCommand,
    showAllCommandsCommand,
    openConfigCommand,
    treeView,
    statusBarManager,
    configChangeListener
  );
};

export const deactivate = () => {
  // Cleanup will be handled by context.subscriptions disposal
};
