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

  const refreshCommand = vscode.commands.registerCommand(
    "quickCommandButtons.refresh",
    () => buttonManager.refresh()
  );

  buttonManager.initialize();

  const configChangeListener = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (!event.affectsConfiguration("quickCommandButtons")) return;
      buttonManager.refresh();
    }
  );

  context.subscriptions.push(
    refreshCommand,
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
    const config = vscode.workspace.getConfiguration("quickCommandButtons");
    const buttons: ButtonConfig[] = config.get("buttons", []);

    buttons.forEach(this.createButton);
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

  private executeCommand = (command: string, useVsCodeApi?: boolean) => {
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
