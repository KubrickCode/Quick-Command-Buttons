export type ButtonConfig = {
  color?: string;
  command?: string;
  executeAll?: boolean;
  group?: ButtonConfig[];
  id: string;
  insertOnly?: boolean;
  name: string;
  shortcut?: string;
  terminalName?: string;
  useVsCodeApi?: boolean;
};

export type ButtonConfigWithOptionalId = Omit<ButtonConfig, "id" | "group"> & {
  group?: ButtonConfigWithOptionalId[];
  id?: string;
};

export type RefreshButtonConfig = {
  color: string;
  enabled: boolean;
  icon: string;
};

export type WebviewMessageType =
  | "confirmImport"
  | "exportConfiguration"
  | "getConfig"
  | "importConfiguration"
  | "previewImport"
  | "setConfig"
  | "setConfigurationTarget";

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
    | { strategy?: string; target?: string };
  requestId?: string;
  target?: string;
  type: WebviewMessageType;
};

export type ConfigDataMessage = {
  data: {
    buttons: ButtonConfig[];
    configurationTarget: ConfigurationTarget;
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
  configurationTarget: ConfigurationTarget;
  exportedAt: string;
  version: string;
};

export type ImportStrategy = "merge" | "replace";

export type ImportResult = {
  backupPath?: string;
  conflictsResolved?: number;
  error?: string;
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
  sourceTarget: ConfigurationTarget;
  timestamp: number;
};

export type ImportPreviewResult = {
  error?: string;
  preview?: ImportPreviewData;
  success: boolean;
};
