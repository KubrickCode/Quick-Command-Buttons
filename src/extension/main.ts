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
import { EventBus } from "../internal/event-bus";
import {
  ButtonSetManager,
  createButtonSetLocalStorage,
  createButtonSetWriter,
} from "../internal/managers/button-set-manager";
import { ConfigManager } from "../internal/managers/config-manager";
import { ImportExportManager } from "../internal/managers/import-export-manager";
import { StatusBarManager } from "../internal/managers/status-bar-manager";
import { TerminalManager } from "../internal/managers/terminal-manager";
import { CommandTreeProvider, CommandTreeItem } from "../internal/providers/command-tree-provider";
import { ConfigWebviewProvider } from "../internal/providers/webview-provider";
import { createShowAllCommandsCommand } from "../internal/show-all-commands";
import { getAppStore, StoreSync } from "../internal/stores";
import { formatValidationErrorMessage } from "../internal/utils/validate-button-config";
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

export const registerCommands = ({
  buttonSetManager,
  configManager,
  configReader,
  context,
  eventBus,
  importExportManager,
  quickPickCreator,
  terminalManager,
}: {
  buttonSetManager: ButtonSetManager;
  configManager: ConfigManager;
  configReader: ReturnType<typeof createVSCodeConfigReader>;
  context: vscode.ExtensionContext;
  eventBus: EventBus;
  importExportManager: ImportExportManager;
  quickPickCreator: ReturnType<typeof createVSCodeQuickPickCreator>;
  terminalManager: TerminalManager;
}) => {
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
    () => eventBus.emit("config:changed", { scope: configManager.getCurrentConfigurationTarget() })
  );

  const refreshCommand = vscode.commands.registerCommand(COMMANDS.REFRESH, () => {
    eventBus.emit("config:changed", { scope: configManager.getCurrentConfigurationTarget() });
    vscode.window.showInformationMessage("Quick Command Buttons refreshed!");
  });

  const showAllCommandsCommand = vscode.commands.registerCommand(
    "quickCommandButtons.showAllCommands",
    createShowAllCommandsCommand(
      configReader,
      terminalManager.executeCommand,
      quickPickCreator,
      configManager,
      buttonSetManager
    )
  );

  const openConfigCommand = vscode.commands.registerCommand(
    "quickCommandButtons.openConfig",
    ConfigWebviewProvider.createWebviewCommand(
      context.extensionUri,
      configReader,
      configManager,
      importExportManager,
      buttonSetManager
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
      } else if (result.error) {
        vscode.window.showErrorMessage(`Failed to import configuration: ${result.error}`);
      }
    }
  );

  const switchButtonSetCommand = vscode.commands.registerCommand(
    COMMANDS.SWITCH_BUTTON_SET,
    async () => {
      const sets = buttonSetManager.getButtonSets();
      const activeSet = buttonSetManager.getActiveSet();

      type SetQuickPickItem = vscode.QuickPickItem & { setName: string | null };

      const items: SetQuickPickItem[] = [
        {
          description: activeSet === null ? vscode.l10n.t("(Current)") : undefined,
          label: `$(home) ${vscode.l10n.t("Default")}`,
          setName: null,
        },
        ...sets.map((set) => ({
          description: activeSet === set.name ? vscode.l10n.t("(Current)") : undefined,
          label: `$(layers) ${set.name}`,
          setName: set.name,
        })),
      ];

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t("Select a button set to switch to"),
        title: vscode.l10n.t("Switch Button Set"),
      });

      if (!selected) return;

      await buttonSetManager.setActiveSet(selected.setName);

      const displayName = selected.setName ?? vscode.l10n.t("Default");
      vscode.window.showInformationMessage(
        vscode.l10n.t("Switched to button set: {0}", displayName)
      );
    }
  );

  const saveAsButtonSetCommand = vscode.commands.registerCommand(
    COMMANDS.SAVE_AS_BUTTON_SET,
    async () => {
      const name = await vscode.window.showInputBox({
        placeHolder: vscode.l10n.t("e.g., Frontend, Backend, DevOps"),
        prompt: vscode.l10n.t("Enter a name for the button set"),
        title: vscode.l10n.t("Save as Button Set"),
        validateInput: (value) => {
          if (!value.trim()) {
            return vscode.l10n.t("Button set name is required");
          }
          if (!buttonSetManager.validateUniqueName(value.trim())) {
            return vscode.l10n.t("A button set with name '{0}' already exists", value.trim());
          }
          return undefined;
        },
      });

      if (!name) return;

      const result = await buttonSetManager.saveAsButtonSet(name);

      if (result.success) {
        vscode.window.showInformationMessage(
          vscode.l10n.t("Button set '{0}' saved successfully", name)
        );
      } else if (result.error) {
        vscode.window.showErrorMessage(vscode.l10n.t("Failed to save configuration"));
      }
    }
  );

  const deleteButtonSetCommand = vscode.commands.registerCommand(
    COMMANDS.DELETE_BUTTON_SET,
    async () => {
      const sets = buttonSetManager.getButtonSets();

      if (sets.length === 0) {
        vscode.window.showInformationMessage(vscode.l10n.t("No button sets to delete"));
        return;
      }

      type SetQuickPickItem = vscode.QuickPickItem & { setName: string };

      const items: SetQuickPickItem[] = sets.map((set) => ({
        label: `$(layers) ${set.name}`,
        setName: set.name,
      }));

      const selected = await vscode.window.showQuickPick(items, {
        placeHolder: vscode.l10n.t("Select a button set to delete"),
        title: vscode.l10n.t("Delete Button Set"),
      });

      if (!selected) return;

      const deleteLabel = vscode.l10n.t("Delete");
      const confirm = await vscode.window.showWarningMessage(
        vscode.l10n.t("Are you sure you want to delete the button set '{0}'?", selected.setName),
        { modal: true },
        deleteLabel
      );

      if (confirm !== deleteLabel) return;

      await buttonSetManager.deleteButtonSet(selected.setName);

      vscode.window.showInformationMessage(
        vscode.l10n.t("Button set '{0}' deleted", selected.setName)
      );
    }
  );

  return {
    deleteButtonSetCommand,
    executeCommand,
    executeFromTreeCommand,
    exportConfigurationCommand,
    importConfigurationCommand,
    openConfigCommand,
    refreshCommand,
    refreshTreeCommand,
    saveAsButtonSetCommand,
    showAllCommandsCommand,
    switchButtonSetCommand,
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
  const buttonSetWriter = createButtonSetWriter();
  const buttonSetLocalStorage = createButtonSetLocalStorage(context);

  const eventBus = new EventBus();

  const appStore = getAppStore();
  const storeSync = StoreSync.create({
    buttonSetLocalStorage,
    configReader,
    localStorage,
    store: appStore,
  });
  storeSync.initializeFromSettings();
  storeSync.startSettingsChangeListener();

  const terminalManager = TerminalManager.create(eventBus);
  const configManager = ConfigManager.create({ configWriter, eventBus, localStorage });
  const statusBarManager = StatusBarManager.create({
    configManager,
    configReader,
    eventBus,
    statusBarCreator,
  });
  const treeProvider = CommandTreeProvider.create({ configManager, configReader, eventBus });
  const importExportManager = ImportExportManager.create({
    configManager,
    configReader,
    configWriter,
    eventBus,
    extensionContext: context,
    fileSystem,
    localStorage,
  });
  const buttonSetManager = ButtonSetManager.create({
    buttonSetLocalStorage,
    buttonSetWriter,
    configManager,
    configReader,
    eventBus,
  });

  statusBarManager.setButtonSetManager(buttonSetManager);
  treeProvider.setButtonSetManager(buttonSetManager);

  const webviewProvider = new ConfigWebviewProvider(
    context.extensionUri,
    configReader,
    configManager,
    importExportManager,
    buttonSetManager,
    eventBus
  );

  eventBus.emit("config:changed", { scope: configManager.getCurrentConfigurationTarget() });

  // Validate configuration on extension load
  const validationResult = configReader.validateButtons();
  if (validationResult.hasErrors) {
    const message = formatValidationErrorMessage(validationResult.errors);
    vscode.window.showWarningMessage(message, "Fix Now", "View Details").then(
      (selection) => {
        if (!selection) return;

        if (selection === "Fix Now") {
          vscode.commands.executeCommand(COMMANDS.OPEN_CONFIG);
          return;
        }

        const details = validationResult.errors
          .map((e) => `- ${e.buttonName}: ${e.message}`)
          .join("\n");
        vscode.window.showInformationMessage(details, { modal: true });
      },
      (error: unknown) => {
        console.error("Failed to show validation warning:", error);
      }
    );
  }

  const configChangeListener = configReader.onConfigChange(() => {
    const currentTarget = configManager.getCurrentConfigurationTarget();
    eventBus.emit("config:changed", { scope: currentTarget });
  });

  const commands = registerCommands({
    buttonSetManager,
    configManager,
    configReader,
    context,
    eventBus,
    importExportManager,
    quickPickCreator,
    terminalManager,
  });

  const treeView = vscode.window.createTreeView("quickCommandsTree", {
    treeDataProvider: treeProvider,
  });

  context.subscriptions.push(
    ...Object.values(commands),
    treeView,
    statusBarManager,
    treeProvider,
    webviewProvider,
    terminalManager,
    configChangeListener,
    storeSync,
    eventBus
  );
};

export const deactivate = () => {
  // Cleanup will be handled by context.subscriptions disposal
};
