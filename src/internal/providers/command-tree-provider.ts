import * as vscode from "vscode";
import { ConfigReader, TerminalExecutor } from "../adapters";
import { EventBus } from "../event-bus";
import { ButtonSetManager } from "../managers/button-set-manager";
import { ConfigManager } from "../managers/config-manager";
import { CommandTreeItem, GroupTreeItem, TreeItem, createTreeItems } from "../utils/ui-items";
export { CommandTreeItem, GroupTreeItem };

export class CommandTreeProvider implements vscode.TreeDataProvider<TreeItem>, vscode.Disposable {
  private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private buttonSetManager?: ButtonSetManager;
  private readonly unsubscribers: (() => void)[] = [];

  constructor(
    private configReader: ConfigReader,
    private configManager: ConfigManager,
    private eventBus?: EventBus
  ) {
    if (eventBus) {
      this.subscribeToEvents();
    }
  }

  static create = ({
    configManager,
    configReader,
    eventBus,
  }: {
    configManager: ConfigManager;
    configReader: ConfigReader;
    eventBus?: EventBus;
  }): CommandTreeProvider => new CommandTreeProvider(configReader, configManager, eventBus);

  static executeFromTree = (item: CommandTreeItem, terminalExecutor: TerminalExecutor) => {
    terminalExecutor(item.commandString, item.useVsCodeApi, item.terminalName, item.buttonName);
  };

  dispose = (): void => {
    this._onDidChangeTreeData.dispose();
    for (const unsubscribe of this.unsubscribers) {
      unsubscribe();
    }
    this.unsubscribers.length = 0;
  };

  getChildren = (element?: TreeItem): Thenable<TreeItem[]> => {
    if (!element) {
      return Promise.resolve(this.getRootItems());
    }

    if (element instanceof GroupTreeItem) {
      return Promise.resolve(createTreeItems(element.commands, element.originalLabel));
    }

    return Promise.resolve([]);
  };

  getTreeItem = (element: TreeItem): vscode.TreeItem => element;

  refresh = (): void => {
    this._onDidChangeTreeData.fire();
  };

  setButtonSetManager = (manager: ButtonSetManager): void => {
    this.buttonSetManager = manager;
  };

  private getRootItems = (): TreeItem[] => {
    const activeSetButtons = this.buttonSetManager?.getButtonsForActiveSet();
    if (activeSetButtons) {
      return createTreeItems(activeSetButtons);
    }

    const { buttons } = this.configManager.getButtonsWithFallback(this.configReader);
    return createTreeItems(buttons);
  };

  private subscribeToEvents = (): void => {
    if (!this.eventBus) {
      return;
    }

    const refresh = () => this.refresh();

    this.unsubscribers.push(
      this.eventBus.on("buttonSet:created", refresh),
      this.eventBus.on("buttonSet:deleted", refresh),
      this.eventBus.on("buttonSet:renamed", refresh),
      this.eventBus.on("buttonSet:switched", refresh),
      this.eventBus.on("config:changed", refresh)
    );
  };
}
