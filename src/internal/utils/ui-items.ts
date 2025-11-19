import * as vscode from "vscode";
import { ButtonConfig } from "../../pkg/types";
import { MESSAGES } from "../../shared/constants";

export type QuickPickItem = {
  command: ButtonConfig;
  description: string;
  label: string;
};

export type TreeItem = CommandTreeItem | GroupTreeItem;

export class CommandTreeItem extends vscode.TreeItem {
  public readonly buttonName: string;
  public readonly commandString: string;
  public readonly terminalName?: string;
  public readonly useVsCodeApi: boolean;

  constructor(
    label: string,
    commandString: string,
    useVsCodeApi: boolean = false,
    terminalName?: string,
    buttonName?: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.commandString = commandString;
    this.useVsCodeApi = useVsCodeApi;
    this.terminalName = terminalName;
    this.buttonName = buttonName || label;
    this.tooltip = commandString;
    this.contextValue = "command";
    this.command = {
      arguments: [this],
      command: "quickCommandButtons.executeFromTree",
      title: "Execute",
    };
  }
}

export class GroupTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly commands: ButtonConfig[]
  ) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = `${commands.length} commands`;
    this.contextValue = "group";
    this.iconPath = new vscode.ThemeIcon("folder");
  }
}

export const createButtonId = (
  buttonName: string,
  index: number,
  parentPath: string = ""
): string => {
  return parentPath ? `${parentPath}>${buttonName}[${index}]` : `${buttonName}[${index}]`;
};

export const createQuickPickItem = (
  button: ButtonConfig,
  includeCommandCount: boolean = false
): QuickPickItem => {
  const description =
    button.group && includeCommandCount
      ? MESSAGES.INFO.commandsCount(button.group.length)
      : button.command || "";

  const label = button.shortcut ? `${button.name} (${button.shortcut})` : button.name;

  return {
    command: button,
    description,
    label,
  };
};

export const createQuickPickItems = (
  buttons: ButtonConfig[],
  includeCommandCount: boolean = false
): QuickPickItem[] => {
  return buttons.map((button) => createQuickPickItem(button, includeCommandCount));
};

export const createTreeItem = (
  button: ButtonConfig,
  index: number,
  parentPath: string = ""
): TreeItem => {
  const buttonId = createButtonId(button.name, index, parentPath);

  if (button.group) {
    return new GroupTreeItem(button.name, button.group);
  }

  return new CommandTreeItem(
    button.name,
    button.command || "",
    button.useVsCodeApi || false,
    button.terminalName,
    buttonId
  );
};

export const createTreeItems = (buttons: ButtonConfig[], parentPath: string = ""): TreeItem[] => {
  return buttons.map((button, index) => createTreeItem(button, index, parentPath));
};
