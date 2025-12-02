import * as vscode from "vscode";
import { TerminalExecutor } from "../adapters";
import { AppStoreInstance, getAppStore } from "../stores";
import { CommandTreeItem, GroupTreeItem, TreeItem, createTreeItems } from "../utils/ui-items";
export { CommandTreeItem, GroupTreeItem };

export class CommandTreeProvider implements vscode.TreeDataProvider<TreeItem>, vscode.Disposable {
  private readonly _onDidChangeTreeData = new vscode.EventEmitter<
    TreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;
  private readonly store: AppStoreInstance;
  private storeUnsubscribe?: () => void;

  private constructor(store?: AppStoreInstance) {
    this.store = store ?? getAppStore();
    this.setupStoreSubscription();
  }

  static create = (deps?: { store?: AppStoreInstance }): CommandTreeProvider =>
    new CommandTreeProvider(deps?.store);

  static executeFromTree = (item: CommandTreeItem, terminalExecutor: TerminalExecutor) => {
    terminalExecutor(item.commandString, item.useVsCodeApi, item.terminalName, item.buttonName);
  };

  dispose = (): void => {
    this._onDidChangeTreeData.dispose();
    this.storeUnsubscribe?.();
    this.storeUnsubscribe = undefined;
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

  private getRootItems = (): TreeItem[] => {
    const buttons = this.store.getState().buttons;
    return createTreeItems(buttons);
  };

  private setupStoreSubscription = (): void => {
    this.storeUnsubscribe = this.store.subscribe(
      (state) => state.buttons,
      () => {
        try {
          this.refresh();
        } catch (error) {
          console.error("[CommandTreeProvider] Failed to refresh tree view:", error);
        }
      }
    );
  };
}
