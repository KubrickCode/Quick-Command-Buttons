export type ButtonConfig = {
  color?: string;
  command?: string;
  executeAll?: boolean;
  group?: ButtonConfig[];
  index?: number;
  name: string;
  shortcut?: string;
  terminalName?: string;
  useVsCodeApi?: boolean;
};

export type VSCodeMessage = {
  data?: ButtonConfig[] | ButtonConfig;
  type: "getConfig" | "setConfig";
};
