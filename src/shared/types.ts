export type ButtonConfig = {
  color?: string;
  command?: string;
  executeAll?: boolean;
  group?: ButtonConfig[];
  id: string;
  name: string;
  shortcut?: string;
  terminalName?: string;
  useVsCodeApi?: boolean;
};

export type RefreshButtonConfig = {
  color: string;
  enabled: boolean;
  icon: string;
};

export type WebviewMessageType =
  | "exportConfig"
  | "getConfig"
  | "importConfig"
  | "setConfig"
  | "setConfigurationTarget";

export type ExtensionMessageType =
  | "configData"
  | "configurationTargetChanged"
  | "error"
  | "importResult"
  | "success";

export type WebviewMessage = {
  data?: ButtonConfig[] | ButtonConfig | ExportFormat | ImportStrategy | string;
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

export type ExtensionMessage =
  | ConfigDataMessage
  | ConfigurationTargetChangedMessage
  | ErrorMessage
  | ImportResultMessage
  | SuccessMessage;

export type ConfigurationTarget = "global" | "local" | "workspace";

export type ExportFormat = {
  buttons: ButtonConfig[];
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
