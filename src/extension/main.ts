import * as path from "path";
import * as vscode from "vscode";
import {
  createVSCodeConfigReader,
  createVSCodeStatusBarCreator,
  createVSCodeQuickPickCreator,
  createVSCodeConfigWriter,
  createProjectLocalStorage,
  createVSCodeFileSystem,
} from "../internal/adapters";
import { executeButtonCommand } from "../internal/command-executor";
import { ConfigManager } from "../internal/managers/config-manager";
import { ImportExportManager } from "../internal/managers/import-export-manager";
import { StatusBarManager } from "../internal/managers/status-bar-manager";
import { TerminalManager } from "../internal/managers/terminal-manager";
import { CommandTreeProvider, CommandTreeItem } from "../internal/providers/command-tree-provider";
import { ConfigWebviewProvider } from "../internal/providers/webview-provider";
import { createShowAllCommandsCommand } from "../internal/show-all-commands";
import { CONFIGURATION_TARGETS } from "../pkg/config-constants";
import { ButtonConfig } from "../pkg/types";
import { COMMANDS } from "../shared/constants";
import { ImportStrategy } from "../shared/types";

const IMPORT_STRATEGY_MERGE_LABEL = "Merge (Recommended)";
const IMPORT_STRATEGY_MERGE_DESCRIPTION =
  "Keep existing buttons, update conflicts with imported data";
const IMPORT_STRATEGY_REPLACE_LABEL = "Replace All";
const IMPORT_STRATEGY_REPLACE_DESCRIPTION =
  "Remove all existing buttons and replace with imported data";
const IMPORT_STRATEGY_PLACEHOLDER = "Select import strategy";
const IMPORT_STRATEGY_TITLE = "Import Configuration";

export const registerCommands = (
  context: vscode.ExtensionContext,
  configReader: ReturnType<typeof createVSCodeConfigReader>,
  quickPickCreator: ReturnType<typeof createVSCodeQuickPickCreator>,
  terminalManager: TerminalManager,
  statusBarManager: StatusBarManager,
  treeProvider: CommandTreeProvider,
  configManager: ConfigManager,
  importExportManager: ImportExportManager
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

  const refreshCommand = vscode.commands.registerCommand(COMMANDS.REFRESH, () => {
    statusBarManager.refreshButtons();
    treeProvider.refresh();
    ConfigWebviewProvider.getInstance()?.refresh();
    vscode.window.showInformationMessage("Quick Command Buttons refreshed!");
  });

  const showAllCommandsCommand = vscode.commands.registerCommand(
    "quickCommandButtons.showAllCommands",
    createShowAllCommandsCommand(configReader, terminalManager.executeCommand, quickPickCreator)
  );

  const openConfigCommand = vscode.commands.registerCommand(
    "quickCommandButtons.openConfig",
    ConfigWebviewProvider.createWebviewCommand(
      context.extensionUri,
      configReader,
      configManager,
      importExportManager
    )
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

  const exportConfigurationCommand = vscode.commands.registerCommand(
    "quickCommandButtons.exportConfiguration",
    async () => {
      const currentTarget = configManager.getCurrentConfigurationTarget();
      const result = await importExportManager.exportConfiguration(currentTarget);

      if (result.success && result.filePath) {
        vscode.window.showInformationMessage(
          `Configuration exported successfully to ${path.basename(result.filePath)}`
        );
      } else if (result.error) {
        vscode.window.showErrorMessage(`Failed to export configuration: ${result.error}`);
      }
    }
  );

  const importConfigurationCommand = vscode.commands.registerCommand(
    "quickCommandButtons.importConfiguration",
    async () => {
      const items: Array<vscode.QuickPickItem & { strategy: ImportStrategy }> = [
        {
          description: IMPORT_STRATEGY_MERGE_DESCRIPTION,
          label: IMPORT_STRATEGY_MERGE_LABEL,
          strategy: "merge",
        },
        {
          description: IMPORT_STRATEGY_REPLACE_DESCRIPTION,
          label: IMPORT_STRATEGY_REPLACE_LABEL,
          strategy: "replace",
        },
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: IMPORT_STRATEGY_PLACEHOLDER,
        title: IMPORT_STRATEGY_TITLE,
      });

      if (!selected) {
        return;
      }

      const currentTarget = configManager.getCurrentConfigurationTarget();
      const result = await importExportManager.importConfiguration(
        currentTarget,
        undefined,
        selected.strategy
      );

      if (result.success) {
        const scopeLabel = currentTarget.charAt(0).toUpperCase() + currentTarget.slice(1);
        vscode.window.showInformationMessage(
          `Successfully imported ${result.importedCount} buttons to ${scopeLabel} scope. ${result.conflictsResolved} conflicts resolved.`
        );
        statusBarManager.refreshButtons();
        treeProvider.refresh();
        const webviewInstance = ConfigWebviewProvider.getInstance();
        webviewInstance?.refresh();
      } else if (result.error) {
        vscode.window.showErrorMessage(`Failed to import configuration: ${result.error}`);
      }
    }
  );

  return {
    executeCommand,
    executeFromTreeCommand,
    exportConfigurationCommand,
    importConfigurationCommand,
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
  const localStorage = createProjectLocalStorage(context);
  const fileSystem = createVSCodeFileSystem();

  const terminalManager = TerminalManager.create();
  const configManager = ConfigManager.create(configWriter, localStorage);
  const statusBarManager = StatusBarManager.create(configReader, statusBarCreator, configManager);
  const treeProvider = CommandTreeProvider.create(configReader, configManager);
  const importExportManager = ImportExportManager.create(
    fileSystem,
    configReader,
    configWriter,
    configManager,
    localStorage,
    context
  );

  new ConfigWebviewProvider(context.extensionUri, configReader, configManager, importExportManager);

  statusBarManager.refreshButtons();

  const configChangeListener = configReader.onConfigChange(() => {
    statusBarManager.refreshButtons();
    treeProvider.refresh();
    ConfigWebviewProvider.getInstance()?.refresh();
  });

  const commands = registerCommands(
    context,
    configReader,
    quickPickCreator,
    terminalManager,
    statusBarManager,
    treeProvider,
    configManager,
    importExportManager
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
