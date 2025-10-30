import * as vscode from "vscode";
import { ConfigReader, TerminalExecutor } from "./adapters";
import { ButtonConfig } from "./types";

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
  constructor(public readonly label: string, public readonly commands: ButtonConfig[]) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = `${commands.length} commands`;
    this.contextValue = "group";
    this.iconPath = new vscode.ThemeIcon("folder");
  }
}

type TreeItem = CommandTreeItem | GroupTreeItem;

export const createTreeItemsFromGroup = (commands: ButtonConfig[], parentPath = ""): TreeItem[] => {
  return commands.map((cmd, index) => {
    const buttonId = parentPath ? `${parentPath}>${cmd.name}[${index}]` : `${cmd.name}[${index}]`;

    if (cmd.group) {
      return new GroupTreeItem(cmd.name, cmd.group);
    }

    return new CommandTreeItem(
      cmd.name,
      cmd.command || "",
      cmd.useVsCodeApi || false,
      cmd.terminalName,
      buttonId
    );
  });
};

export const createRootTreeItems = (buttons: ButtonConfig[]): TreeItem[] => {
  return buttons.map((button, index) => {
    const buttonId = `${button.name}[${index}]`;

    if (button.group) {
      return new GroupTreeItem(button.name, button.group);
    }

    if (button.command) {
      return new CommandTreeItem(
        button.name,
        button.command,
        button.useVsCodeApi || false,
        button.terminalName,
        buttonId
      );
    }

    return new CommandTreeItem(button.name, "", false, undefined, buttonId);
  });
};

export class CommandTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private configReader: ConfigReader) {}

  static create = (configReader: ConfigReader): CommandTreeProvider =>
    new CommandTreeProvider(configReader);

  static executeFromTree = (item: CommandTreeItem, terminalExecutor: TerminalExecutor) => {
    terminalExecutor(item.commandString, item.useVsCodeApi, item.terminalName, item.buttonName);
  };

  getChildren = (element?: TreeItem): Thenable<TreeItem[]> => {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }

    if (element instanceof GroupTreeItem) {
      return Promise.resolve(createTreeItemsFromGroup(element.commands, element.label));
    }

    return Promise.resolve([]);
  };

  getTreeItem = (element: TreeItem): vscode.TreeItem => element;

  refresh = (): void => {
    this._onDidChangeTreeData.fire();
  };

  private getRootItems = (): TreeItem[] => {
    const buttons = this.configReader.getButtons();
    return createRootTreeItems(buttons);
  };
}
