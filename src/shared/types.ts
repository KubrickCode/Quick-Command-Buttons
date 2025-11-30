type BaseButtonConfig = {
  color?: string;
  id: string;
  name: string;
  shortcut?: string;
};

export type CommandButton = BaseButtonConfig & {
  command: string;
  group?: never;
  insertOnly?: boolean;
  terminalName?: string;
  useVsCodeApi?: boolean;
};

export type GroupButton = BaseButtonConfig & {
  command?: never;
  executeAll?: boolean;
  group: ButtonConfig[];
};

export type ButtonConfig = CommandButton | GroupButton;

export const isCommandButton = (button: ButtonConfig): button is CommandButton =>
  "command" in button && typeof button.command === "string";

export const isGroupButton = (button: ButtonConfig): button is GroupButton =>
  "group" in button && Array.isArray(button.group);

type BaseButtonConfigWithOptionalId = {
  color?: string;
  id?: string;
  name: string;
  shortcut?: string;
};

export type CommandButtonWithOptionalId = BaseButtonConfigWithOptionalId & {
  command: string;
  group?: never;
  insertOnly?: boolean;
  terminalName?: string;
  useVsCodeApi?: boolean;
};

export type GroupButtonWithOptionalId = BaseButtonConfigWithOptionalId & {
  command?: never;
  executeAll?: boolean;
  group: ButtonConfigWithOptionalId[];
};

export type ButtonConfigWithOptionalId = CommandButtonWithOptionalId | GroupButtonWithOptionalId;

export type RefreshButtonConfig = {
  color: string;
  enabled: boolean;
  icon: string;
};

export type WebviewMessageType =
  | "confirmImport"
  | "createButtonSet"
  | "deleteButtonSet"
  | "exportConfiguration"
  | "getConfig"
  | "importConfiguration"
  | "previewImport"
  | "saveAsButtonSet"
  | "setActiveSet"
  | "setConfig"
  | "setConfigurationTarget"
  | "updateButtonSet";

export type ExtensionMessageType =
  | "configData"
  | "configurationTargetChanged"
  | "error"
  | "importPreviewResult"
  | "importResult"
  | "success";

export type ConfirmImportData = {
  preview: ImportPreviewData;
  strategy: ImportStrategy;
};

export type WebviewMessage = {
  data?:
    | ButtonConfig[]
    | ButtonConfig
    | ConfirmImportData
    | ExportFormat
    | ImportStrategy
    | string
    | { name?: string }
    | { setName?: string | null }
    | { strategy?: string; target?: string }
    | { buttons?: ButtonConfigWithOptionalId[]; name: string; sourceSetId?: string }
    | { buttons: ButtonConfigWithOptionalId[]; id: string; name?: string };
  requestId?: string;
  target?: string;
  type: WebviewMessageType;
};

export type ValidationError = {
  buttonId?: string;
  buttonName: string;
  message: string;
  path: string[];
  rawCommand?: string;
  rawGroup?: unknown[];
};

export type ConfigDataMessage = {
  data: {
    buttons: ButtonConfig[];
    configurationTarget: ConfigurationTarget;
    validationErrors?: ValidationError[];
  };
  requestId?: string;
  type: "configData";
};

export type SuccessMessage = {
  data?: ExportResult | ImportResult;
  requestId?: string;
  type: "success";
};

export type ErrorMessage = {
  error: string;
  requestId?: string;
  type: "error";
};

export type ConfigurationTargetChangedMessage = {
  requestId?: string;
  type: "configurationTargetChanged";
};

export type ImportResultMessage = {
  data: ImportResult;
  requestId?: string;
  type: "importResult";
};

export type ImportPreviewResultMessage = {
  data: ImportPreviewResult;
  requestId?: string;
  type: "importPreviewResult";
};

export type ExtensionMessage =
  | ConfigDataMessage
  | ConfigurationTargetChangedMessage
  | ErrorMessage
  | ImportPreviewResultMessage
  | ImportResultMessage
  | SuccessMessage;

export type ConfigurationTarget = "global" | "local" | "workspace";

export type ExportFormat = {
  buttons: ButtonConfigWithOptionalId[];
  exportedAt: string;
  version: string;
};

export type ImportStrategy = "merge" | "replace";

export type ImportResult = {
  backupPath?: string;
  conflictsResolved?: number;
  error?: string;
  finalButtons?: ButtonConfigWithOptionalId[];
  importedCount?: number;
  success: boolean;
};

export type ImportConflict = {
  existingButton: ButtonConfig;
  importedButton: ButtonConfig;
};

export type ShortcutConflict = {
  buttons: {
    id?: string;
    name: string;
    source: "existing" | "imported";
  }[];
  shortcut: string;
};

export type ExportResult = {
  error?: string;
  filePath?: string;
  success: boolean;
};

export type ImportAnalysis = {
  added: ButtonConfigWithOptionalId[];
  modified: ImportConflict[];
  shortcutConflicts: ShortcutConflict[];
  unchanged: ButtonConfigWithOptionalId[];
};

export type ImportPreviewData = {
  analysis: ImportAnalysis;
  buttons: ButtonConfigWithOptionalId[];
  fileUri: string;
  targetScope: ConfigurationTarget;
  timestamp: number;
};

export type ImportPreviewResult = {
  error?: string;
  preview?: ImportPreviewData;
  success: boolean;
};

// Button Set Types
export type ButtonSetWithoutId = {
  buttons: ButtonConfigWithOptionalId[];
  name: string;
};

export type ButtonSetWithOptionalId = {
  buttons: ButtonConfigWithOptionalId[];
  id?: string;
  name: string;
};

export type ButtonSet = {
  buttons: ButtonConfig[];
  id: string;
  name: string;
};
