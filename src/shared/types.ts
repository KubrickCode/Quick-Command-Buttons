export type ButtonConfig = {
  color?: string;
  command?: string;
  executeAll?: boolean;
  group?: ButtonConfig[];
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

export type ExtensionMessageType = "configData" | "configurationTargetChanged";

export type WebviewMessage = {
  type: WebviewMessageType;
  data?: ButtonConfig[] | ButtonConfig | string;
  target?: string;
};

export type ExtensionMessage = {
  type: ExtensionMessageType;
  data?: ButtonConfig[] | string;
};

export type ConfigurationTarget = "global" | "workspace";
