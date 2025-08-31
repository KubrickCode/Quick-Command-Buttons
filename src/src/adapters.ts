import * as vscode from "vscode";
import { ButtonConfig, RefreshButtonConfig } from "./types";

export type TerminalExecutor = (command: string, useVsCodeApi?: boolean, terminalName?: string) => void;

export type ConfigReader = {
  getButtons: () => ButtonConfig[];
  getRefreshConfig: () => RefreshButtonConfig;
  onConfigChange: (listener: () => void) => vscode.Disposable;
};

export type StatusBarCreator = (alignment: vscode.StatusBarAlignment, priority: number) => vscode.StatusBarItem;

export type QuickPickCreator = <T extends vscode.QuickPickItem>() => vscode.QuickPick<T>;

export const createVSCodeConfigReader = (): ConfigReader => ({
  getButtons: () => vscode.workspace.getConfiguration("quickCommandButtons").get("buttons") || [],
  getRefreshConfig: () => vscode.workspace.getConfiguration("quickCommandButtons").get("refreshButton") || {
    icon: "$(refresh)",
    color: "#00BCD4",
    enabled: true,
  },
  onConfigChange: (listener: () => void) => vscode.workspace.onDidChangeConfiguration((event) => {
    if (!event.affectsConfiguration("quickCommandButtons")) return;
    listener();
  }),
});

export const createVSCodeStatusBarCreator = (): StatusBarCreator => 
  (alignment, priority) => vscode.window.createStatusBarItem(alignment, priority);

export const createVSCodeQuickPickCreator = (): QuickPickCreator => 
  <T extends vscode.QuickPickItem>() => vscode.window.createQuickPick<T>();