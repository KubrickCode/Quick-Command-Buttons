import * as vscode from "vscode";
import { CONFIG_SECTION } from "../pkg/config-constants";
import { ButtonConfig, RefreshButtonConfig } from "../pkg/types";
import { ButtonConfigWithOptionalId, ensureIdsInArray, stripIdsInArray } from "./utils/ensure-id";

const DEFAULT_REFRESH_CONFIG: RefreshButtonConfig = {
  color: "#00BCD4",
  enabled: true,
  icon: "$(refresh)",
};

export const LOCAL_BUTTONS_STORAGE_KEY = "quickCommandButtons.localButtons";

export type TerminalExecutor = (
  command: string,
  useVsCodeApi?: boolean,
  terminalName?: string,
  buttonName?: string,
  buttonRef?: object
) => void;

export type ConfigReader = {
  getButtons: () => ButtonConfig[];
  getButtonsFromScope: (target: vscode.ConfigurationTarget) => ButtonConfig[];
  getRefreshConfig: () => RefreshButtonConfig;
  onConfigChange: (listener: () => void) => vscode.Disposable;
};

export type StatusBarCreator = (
  alignment: vscode.StatusBarAlignment,
  priority: number
) => vscode.StatusBarItem;

export type QuickPickCreator = <T extends vscode.QuickPickItem>() => vscode.QuickPick<T>;

export type ConfigWriter = {
  writeButtons: (buttons: ButtonConfig[], target: vscode.ConfigurationTarget) => Promise<void>;
  writeConfigurationTarget: (target: string) => Promise<void>;
};

export type ProjectLocalStorage = {
  getButtons: () => ButtonConfig[];
  setButtons: (buttons: ButtonConfig[]) => Promise<void>;
};

const getButtonsFromConfig = (
  config: vscode.WorkspaceConfiguration
): ButtonConfigWithOptionalId[] => config.get("buttons") || [];

const getRefreshConfigFromConfig = (config: vscode.WorkspaceConfiguration): RefreshButtonConfig =>
  config.get("refreshButton") || DEFAULT_REFRESH_CONFIG;

const isQuickCommandButtonsConfigChange = (event: vscode.ConfigurationChangeEvent): boolean =>
  event.affectsConfiguration(CONFIG_SECTION);

export const createVSCodeConfigReader = (): ConfigReader => ({
  getButtons: () => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const buttons = getButtonsFromConfig(config);
    return ensureIdsInArray(buttons);
  },
  getButtonsFromScope: (target: vscode.ConfigurationTarget) => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const inspection = config.inspect<ButtonConfigWithOptionalId[]>("buttons");

    let buttons: ButtonConfigWithOptionalId[] = [];
    if (target === vscode.ConfigurationTarget.Global) {
      buttons = inspection?.globalValue || [];
    } else if (target === vscode.ConfigurationTarget.Workspace) {
      buttons = inspection?.workspaceValue || [];
    }

    return ensureIdsInArray(buttons);
  },
  getRefreshConfig: () => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return getRefreshConfigFromConfig(config);
  },
  onConfigChange: (listener: () => void) =>
    vscode.workspace.onDidChangeConfiguration((event) => {
      if (!isQuickCommandButtonsConfigChange(event)) return;
      listener();
    }),
});

export const createVSCodeStatusBarCreator = (): StatusBarCreator => (alignment, priority) =>
  vscode.window.createStatusBarItem(alignment, priority);

export const createVSCodeQuickPickCreator =
  (): QuickPickCreator =>
  <T extends vscode.QuickPickItem>() =>
    vscode.window.createQuickPick<T>();

export const createVSCodeConfigWriter = (): ConfigWriter => ({
  writeButtons: async (buttons: ButtonConfig[], target: vscode.ConfigurationTarget) => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const buttonsWithoutIds = stripIdsInArray(buttons);
    await config.update("buttons", buttonsWithoutIds, target);
  },
  writeConfigurationTarget: async (target: string) => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    await config.update("configurationTarget", target, vscode.ConfigurationTarget.Global);
  },
});

export const createProjectLocalStorage = (
  context: vscode.ExtensionContext
): ProjectLocalStorage => {
  return {
    getButtons: () => {
      const buttons =
        context.workspaceState.get<ButtonConfigWithOptionalId[]>(LOCAL_BUTTONS_STORAGE_KEY) || [];
      return ensureIdsInArray(buttons);
    },
    setButtons: async (buttons: ButtonConfig[]) => {
      const buttonsWithoutIds = stripIdsInArray(buttons);
      await context.workspaceState.update(LOCAL_BUTTONS_STORAGE_KEY, buttonsWithoutIds);
    },
  };
};

export type FileSystemOperations = {
  createDirectory: (uri: vscode.Uri) => Promise<void>;
  exists: (uri: vscode.Uri) => Promise<boolean>;
  readFile: (uri: vscode.Uri) => Promise<string>;
  showOpenDialog: (options: vscode.OpenDialogOptions) => Promise<vscode.Uri[] | undefined>;
  showSaveDialog: (options: vscode.SaveDialogOptions) => Promise<vscode.Uri | undefined>;
  stat: (uri: vscode.Uri) => Promise<{ size: number }>;
  writeFile: (uri: vscode.Uri, content: string) => Promise<void>;
};

export const createVSCodeFileSystem = (): FileSystemOperations => ({
  createDirectory: async (uri: vscode.Uri) => {
    await vscode.workspace.fs.createDirectory(uri);
  },
  exists: async (uri: vscode.Uri) => {
    try {
      await vscode.workspace.fs.stat(uri);
      return true;
    } catch {
      return false;
    }
  },
  readFile: async (uri: vscode.Uri) => {
    const bytes = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(bytes).toString("utf-8");
  },
  showOpenDialog: async (options: vscode.OpenDialogOptions) => {
    return await vscode.window.showOpenDialog(options);
  },
  showSaveDialog: async (options: vscode.SaveDialogOptions) => {
    return await vscode.window.showSaveDialog(options);
  },
  stat: async (uri: vscode.Uri) => {
    const stat = await vscode.workspace.fs.stat(uri);
    return { size: stat.size };
  },
  writeFile: async (uri: vscode.Uri, content: string) => {
    const bytes = Buffer.from(content, "utf-8");
    await vscode.workspace.fs.writeFile(uri, bytes);
  },
});
