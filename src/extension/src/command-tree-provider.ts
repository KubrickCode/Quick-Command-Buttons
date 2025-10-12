import * as vscode from "vscode";
import { ButtonConfig } from "./types";
import { ConfigReader, TerminalExecutor } from "./adapters";

export class CommandTreeItem extends vscode.TreeItem {
  public readonly commandString: string;
  public readonly useVsCodeApi: boolean;
  public readonly terminalName?: string;

  constructor(
    label: string,
    commandString: string,
    useVsCodeApi: boolean = false,
    terminalName?: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.commandString = commandString;
    this.useVsCodeApi = useVsCodeApi;
    this.terminalName = terminalName;
    this.tooltip = commandString;
    this.contextValue = "command";
    this.command = {
      command: "quickCommandButtons.executeFromTree",
      title: "Execute",
      arguments: [this],
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

type TreeItem = CommandTreeItem | GroupTreeItem;

export const createTreeItemsFromGroup = (commands: ButtonConfig[]): TreeItem[] => {
  return commands.map((cmd) => {
    if (cmd.group) {
      return new GroupTreeItem(cmd.name, cmd.group);
    }

    return new CommandTreeItem(
      cmd.name,
      cmd.command || "",
      cmd.useVsCodeApi || false,
      cmd.terminalName
    );
  });
};

export const createRootTreeItems = (buttons: ButtonConfig[]): TreeItem[] => {
  return buttons.map((button) => {
    if (button.group) {
      return new GroupTreeItem(button.name, button.group);
    }

    if (button.command) {
      return new CommandTreeItem(
        button.name,
        button.command,
        button.useVsCodeApi || false,
        button.terminalName
      );
    }

    return new CommandTreeItem(button.name, "", false);
  });
};

export class CommandTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private configReader: ConfigReader) {}

  refresh = (): void => {
    this._onDidChangeTreeData.fire();
  };

  getTreeItem = (element: TreeItem): vscode.TreeItem => element;

  getChildren = (element?: TreeItem): Thenable<TreeItem[]> => {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }

    if (element instanceof GroupTreeItem) {
      return Promise.resolve(createTreeItemsFromGroup(element.commands));
    }

    return Promise.resolve([]);
  };

  private getRootItems = (): TreeItem[] => {
    const buttons = this.configReader.getButtons();
    return createRootTreeItems(buttons);
  };

  static create = (configReader: ConfigReader): CommandTreeProvider =>
    new CommandTreeProvider(configReader);

  static executeFromTree = (item: CommandTreeItem, terminalExecutor: TerminalExecutor) => {
    terminalExecutor(item.commandString, item.useVsCodeApi, item.terminalName);
  };
}
