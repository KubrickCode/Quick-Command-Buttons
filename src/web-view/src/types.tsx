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
  type:
    | "addButton"
    | "deleteButton"
    | "getConfig"
    | "setConfig"
    | "updateButton";
};

declare global {
  const vscode: {
    postMessage(message: VSCodeMessage): void;
  };
}