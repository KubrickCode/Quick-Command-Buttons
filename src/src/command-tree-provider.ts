import * as vscode from "vscode";
import { ButtonConfig, SubButtonConfig } from "./types";
import { TerminalManager } from "./terminal-manager";

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
    public readonly commands: SubButtonConfig[]
  ) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
    this.tooltip = `${commands.length} commands`;
    this.contextValue = "group";
    this.iconPath = new vscode.ThemeIcon("folder");
  }
}

export class CommandTreeProvider implements vscode.TreeDataProvider<CommandTreeItem | GroupTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    CommandTreeItem | GroupTreeItem | undefined | null | void
  > = new vscode.EventEmitter<CommandTreeItem | GroupTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    CommandTreeItem | GroupTreeItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  refresh = (): void => {
    this._onDidChangeTreeData.fire();
  };

  getTreeItem = (element: CommandTreeItem | GroupTreeItem): vscode.TreeItem => {
    return element;
  };

  getChildren = (
    element?: CommandTreeItem | GroupTreeItem
  ): Thenable<(CommandTreeItem | GroupTreeItem)[]> => {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    } else if (element instanceof GroupTreeItem) {
      return Promise.resolve(
        element.commands.map(
          (cmd) =>
            new CommandTreeItem(
              cmd.name,
              cmd.command,
              cmd.useVsCodeApi || false,
              cmd.terminalName
            )
        )
      );
    }
    return Promise.resolve([]);
  };

  private getRootItems = (): (CommandTreeItem | GroupTreeItem)[] => {
    const config = vscode.workspace.getConfiguration("quickCommandButtons");
    const buttons: ButtonConfig[] = config.get("buttons") || [];

    return buttons.map((button) => {
      if (button.group) {
        return new GroupTreeItem(button.name, button.group);
      } else if (button.command) {
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

  static executeFromTree = (item: CommandTreeItem) => {
    TerminalManager.executeCommand(
      item.commandString,
      item.useVsCodeApi,
      item.terminalName
    );
  };
}