import * as vscode from "vscode";
import { ButtonConfig, RefreshButtonConfig } from "./types";

const CONFIG_SECTION = "quickCommandButtons";
const DEFAULT_REFRESH_CONFIG: RefreshButtonConfig = {
  icon: "$(refresh)",
  color: "#00BCD4",
  enabled: true,
};

export type TerminalExecutor = (
  command: string,
  useVsCodeApi?: boolean,
  terminalName?: string
) => void;

export type ConfigReader = {
  getButtons: () => ButtonConfig[];
  getRefreshConfig: () => RefreshButtonConfig;
  onConfigChange: (listener: () => void) => vscode.Disposable;
};

export type StatusBarCreator = (
  alignment: vscode.StatusBarAlignment,
  priority: number
) => vscode.StatusBarItem;

export type QuickPickCreator = <
  T extends vscode.QuickPickItem
>() => vscode.QuickPick<T>;

const getButtonsFromConfig = (
  config: vscode.WorkspaceConfiguration
): ButtonConfig[] => config.get("buttons") || [];

const getRefreshConfigFromConfig = (
  config: vscode.WorkspaceConfiguration
): RefreshButtonConfig => config.get("refreshButton") || DEFAULT_REFRESH_CONFIG;

const isQuickCommandButtonsConfigChange = (
  event: vscode.ConfigurationChangeEvent
): boolean => event.affectsConfiguration(CONFIG_SECTION);

export const createVSCodeConfigReader = (): ConfigReader => ({
  getButtons: () => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return getButtonsFromConfig(config);
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

export const createVSCodeStatusBarCreator =
  (): StatusBarCreator => (alignment, priority) =>
    vscode.window.createStatusBarItem(alignment, priority);

export const createVSCodeQuickPickCreator =
  (): QuickPickCreator =>
  <T extends vscode.QuickPickItem>() =>
    vscode.window.createQuickPick<T>();
