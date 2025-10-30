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
