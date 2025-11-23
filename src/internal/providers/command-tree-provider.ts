import * as vscode from "vscode";
import { ConfigReader, TerminalExecutor } from "../adapters";
import { ConfigManager } from "../managers/config-manager";
import { CommandTreeItem, GroupTreeItem, TreeItem, createTreeItems } from "../utils/ui-items";
export { CommandTreeItem, GroupTreeItem };

export class CommandTreeProvider implements vscode.TreeDataProvider<TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(
    private configReader: ConfigReader,
    private configManager: ConfigManager
  ) {}

  static create = (configReader: ConfigReader, configManager: ConfigManager): CommandTreeProvider =>
    new CommandTreeProvider(configReader, configManager);

  static executeFromTree = (item: CommandTreeItem, terminalExecutor: TerminalExecutor) => {
    terminalExecutor(item.commandString, item.useVsCodeApi, item.terminalName, item.buttonName);
  };

  getChildren = (element?: TreeItem): Thenable<TreeItem[]> => {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }

    if (element instanceof GroupTreeItem) {
      return Promise.resolve(createTreeItems(element.commands, element.label));
    }

    return Promise.resolve([]);
  };

  getTreeItem = (element: TreeItem): vscode.TreeItem => element;

  refresh = (): void => {
    this._onDidChangeTreeData.fire();
  };

  private getRootItems = (): TreeItem[] => {
    const target = this.configManager.getVSCodeConfigurationTarget();
    const buttons = this.configReader.getButtonsFromScope(target);
    return createTreeItems(buttons);
  };
}
