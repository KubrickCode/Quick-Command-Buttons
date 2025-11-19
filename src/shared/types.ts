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

export type ExtensionMessageType = "configData" | "configurationTargetChanged";

export type WebviewMessage = {
  data?: ButtonConfig[] | ButtonConfig | string;
  target?: string;
  type: WebviewMessageType;
};

export type ExtensionMessage = {
  data?: ButtonConfig[] | string;
  type: ExtensionMessageType;
};

export type ConfigurationTarget = "global" | "workspace";
