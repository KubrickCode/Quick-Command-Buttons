export type ButtonConfig = {
  name: string;
  command?: string;
  useVsCodeApi?: boolean;
  color?: string;
  terminalName?: string;
  group?: SubButtonConfig[];
};

export type SubButtonConfig = {
  name: string;
  command: string;
  useVsCodeApi?: boolean;
  shortcut?: string;
  terminalName?: string;
};

export type RefreshButtonConfig = {
  icon: string;
  color: string;
  enabled: boolean;
};