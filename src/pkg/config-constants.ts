import * as vscode from "vscode";
import { CONFIG, CONFIGURATION_TARGET } from "../shared/constants";

export const CONFIG_SECTION = CONFIG.SECTION;
export const CONFIG_KEYS = CONFIG.KEYS;
export const CONFIGURATION_TARGETS = CONFIGURATION_TARGET;

export const VS_CODE_CONFIGURATION_TARGETS = {
  [CONFIGURATION_TARGETS.GLOBAL]: vscode.ConfigurationTarget.Global,
  [CONFIGURATION_TARGETS.WORKSPACE]: vscode.ConfigurationTarget.Workspace,
} as const;

export type ConfigurationTargetType =
  (typeof CONFIGURATION_TARGET)[keyof typeof CONFIGURATION_TARGET];
export type ConfigKeyType = (typeof CONFIG.KEYS)[keyof typeof CONFIG.KEYS];
