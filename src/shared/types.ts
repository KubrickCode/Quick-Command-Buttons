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

export type WebviewMessageType = "getConfig" | "setConfig" | "setConfigurationTarget";

export type ExtensionMessageType =
  | "configData"
  | "configurationTargetChanged"
  | "error"
  | "success";

export type WebviewMessage = {
  data?: ButtonConfig[] | ButtonConfig | string;
  requestId?: string;
  target?: string;
  type: WebviewMessageType;
};

export type ConfigDataMessage = {
  data: {
    buttons: ButtonConfig[];
    configurationTarget: string;
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

export type ExtensionMessage =
  | ConfigDataMessage
  | ConfigurationTargetChangedMessage
  | ErrorMessage
  | SuccessMessage;

export type ConfigurationTarget = "global" | "local" | "workspace";
