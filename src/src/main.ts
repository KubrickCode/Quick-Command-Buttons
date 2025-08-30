import * as vscode from "vscode";

type ButtonConfig = {
  name: string;
  command?: string;
  useVsCodeApi?: boolean;
  color?: string;
  group?: SubButtonConfig[];
};

type SubButtonConfig = {
  name: string;
  command: string;
  useVsCodeApi?: boolean;
};

export const activate = (context: vscode.ExtensionContext) => {
  const buttonManager = new QuickCommandButtonManager();
  const treeProvider = new QuickCommandTreeProvider();

  const refreshCommand = vscode.commands.registerCommand(
    "quickCommandButtons.refresh",
    () => {
      buttonManager.refresh();
      treeProvider.refresh();
    }
  );

  const openAllCommandsCommand = vscode.commands.registerCommand(
    "quickCommandButtons.openAllCommands",
    () => {
      vscode.commands.executeCommand(
        "setContext",
        "quickCommandButtons.showTreeView",
        true
      );
      treeProvider.refresh();
    }
  );

  const executeFromTreeCommand = vscode.commands.registerCommand(
    "quickCommandButtons.executeFromTree",
    (item: CommandTreeItem) => {
      buttonManager.executeCommand(item.commandString, item.useVsCodeApi);
    }
  );

  const treeView = vscode.window.createTreeView("quickCommandsTreeView", {
    treeDataProvider: treeProvider,
    showCollapseAll: true,
  });

  buttonManager.initialize();

  const configChangeListener = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (!event.affectsConfiguration("quickCommandButtons")) return;
      buttonManager.refresh();
      treeProvider.refresh();
    }
  );

  context.subscriptions.push(
    refreshCommand,
    openAllCommandsCommand,
    executeFromTreeCommand,
    treeView,
    configChangeListener,
    buttonManager
  );
};

export const deactivate = () => {};

class QuickCommandButtonManager implements vscode.Disposable {
  private statusBarItems: vscode.StatusBarItem[] = [];
  private commands: vscode.Disposable[] = [];

  initialize = () => this.createButtons();

  refresh = () => {
    this.dispose();
    this.createButtons();
  };

  private createButtons = () => {
    this.createAllCommandsButton();

    const config = vscode.workspace.getConfiguration("quickCommandButtons");
    const buttons: ButtonConfig[] = config.get("buttons", []);

    buttons.forEach(this.createButton);
  };

  private createAllCommandsButton = () => {
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1001 // Higher priority than other buttons
    );

    statusBarItem.text = "$(list-unordered) All Commands";
    statusBarItem.command = "quickCommandButtons.openAllCommands";
    statusBarItem.tooltip = "Open All Commands Panel";

    statusBarItem.show();
    this.statusBarItems.push(statusBarItem);
  };

  private createButton = (button: ButtonConfig, index: number) => {
    const statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1000 - index
    );

    statusBarItem.text = button.name;
    if (button.color) statusBarItem.color = button.color;

    if (button.group) {
      this.createGroupButton(statusBarItem, button.group, index);
    } else if (button.command) {
      this.createSingleButton(statusBarItem, button, index);
    }

    statusBarItem.show();
    this.statusBarItems.push(statusBarItem);
  };

  private createGroupButton = (
    statusBarItem: vscode.StatusBarItem,
    group: SubButtonConfig[],
    index: number
  ) => {
    const commandId = `quickCommandButtons.group.${index}`;
    statusBarItem.command = commandId;

    const groupCommand = vscode.commands.registerCommand(commandId, () =>
      this.showQuickPick(group)
    );

    this.commands.push(groupCommand);
  };

  private createSingleButton = (
    statusBarItem: vscode.StatusBarItem,
    button: ButtonConfig,
    index: number
  ) => {
    const commandId = `quickCommandButtons.single.${index}`;
    statusBarItem.command = commandId;

    const singleCommand = vscode.commands.registerCommand(commandId, () =>
      this.executeCommand(button.command!, button.useVsCodeApi)
    );

    this.commands.push(singleCommand);
  };

  private showQuickPick = async (group: SubButtonConfig[]) => {
    const items = group.map((item) => ({
      label: item.name,
      command: item.command,
      useVsCodeApi: item.useVsCodeApi,
    }));

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: "Select a command to execute",
    });

    if (!selected) return;
    this.executeCommand(selected.command, selected.useVsCodeApi);
  };

  executeCommand = (command: string, useVsCodeApi?: boolean) => {
    if (useVsCodeApi) {
      vscode.commands.executeCommand(command);
      return;
    }

    const terminal =
      vscode.window.activeTerminal || vscode.window.createTerminal();
    terminal.show();
    terminal.sendText(command);
  };

  dispose = () => {
    this.statusBarItems.forEach((item) => item.dispose());
    this.commands.forEach((command) => command.dispose());
    this.statusBarItems = [];
    this.commands = [];
  };
}

class CommandTreeItem extends vscode.TreeItem {
  public readonly commandString: string;
  public readonly useVsCodeApi: boolean;

  constructor(
    label: string,
    commandString: string,
    useVsCodeApi: boolean = false
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.commandString = commandString;
    this.useVsCodeApi = useVsCodeApi;
    this.tooltip = commandString;
    this.contextValue = "command";
    this.command = {
      command: "quickCommandButtons.executeFromTree",
      title: "Execute",
      arguments: [this],
    };
  }
}

class GroupTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly commands: SubButtonConfig[]
  ) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue = "group";
  }
}

class QuickCommandTreeProvider
  implements vscode.TreeDataProvider<CommandTreeItem | GroupTreeItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    CommandTreeItem | GroupTreeItem | undefined | null | void
  > = new vscode.EventEmitter<
    CommandTreeItem | GroupTreeItem | undefined | null | void
  >();
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
              cmd.useVsCodeApi || false
            )
        )
      );
    }
    return Promise.resolve([]);
  };

  private getRootItems = (): (CommandTreeItem | GroupTreeItem)[] => {
    const config = vscode.workspace.getConfiguration("quickCommandButtons");
    const buttons: ButtonConfig[] = config.get("buttons", []);

    return buttons.map((button) => {
      if (button.group) {
        return new GroupTreeItem(button.name, button.group);
      } else if (button.command) {
        return new CommandTreeItem(
          button.name,
          button.command,
          button.useVsCodeApi || false
        );
      }
      return new CommandTreeItem(button.name, "", false);
    });
  };
}
