import * as vscode from "vscode";

export const CONFIG_SECTION = "quickCommandButtons";

export const CONFIG_KEYS = {
  BUTTONS: "buttons",
  CONFIGURATION_TARGET: "configurationTarget",
  REFRESH_BUTTON: "refreshButton",
} as const;

export const CONFIGURATION_TARGETS = {
  WORKSPACE: "workspace",
  GLOBAL: "global",
} as const;

export const VS_CODE_CONFIGURATION_TARGETS = {
  [CONFIGURATION_TARGETS.WORKSPACE]: vscode.ConfigurationTarget.Workspace,
  [CONFIGURATION_TARGETS.GLOBAL]: vscode.ConfigurationTarget.Global,
} as const;

export type ConfigurationTargetType =
  (typeof CONFIGURATION_TARGETS)[keyof typeof CONFIGURATION_TARGETS];
export type ConfigKeyType = (typeof CONFIG_KEYS)[keyof typeof CONFIG_KEYS];
