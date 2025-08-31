import * as vscode from "vscode";
import { ButtonConfig } from "./types";
import { StatusBarManager } from "./status-bar-manager";
import { CommandTreeProvider, CommandTreeItem } from "./command-tree-provider";
import { TerminalManager } from "./terminal-manager";

export const activate = (context: vscode.ExtensionContext) => {
  const statusBarManager = new StatusBarManager();
  const treeProvider = new CommandTreeProvider();

  statusBarManager.refreshButtons();

  vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration("quickCommandButtons")) {
      statusBarManager.refreshButtons();
      treeProvider.refresh();
    }
  });

  const executeCommand = vscode.commands.registerCommand(
    "quickCommandButtons.execute",
    (button: ButtonConfig) => StatusBarManager.executeCommand(button)
  );

  const executeFromTreeCommand = vscode.commands.registerCommand(
    "quickCommandButtons.executeFromTree",
    (item: CommandTreeItem) => CommandTreeProvider.executeFromTree(item)
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

  const treeView = vscode.window.createTreeView("quickCommandsTree", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(
    executeCommand,
    executeFromTreeCommand,
    refreshTreeCommand,
    refreshCommand,
    treeView,
    statusBarManager
  );
};

export const deactivate = () => {
  TerminalManager.dispose();
};