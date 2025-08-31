export type ButtonConfig = {
  name: string;
  command?: string;
  useVsCodeApi?: boolean;
  color?: string;
  terminalName?: string;
  shortcut?: string;
  group?: ButtonConfig[];
  executeAll?: boolean;
};

export type RefreshButtonConfig = {
  icon: string;
  color: string;
  enabled: boolean;
};
