import * as vscode from "vscode";
import { ButtonConfig } from "./types";
import { ConfigReader, StatusBarCreator } from "./adapters";

export class StatusBarManager {
  private statusBarItems: vscode.StatusBarItem[] = [];

  constructor(
    private configReader: ConfigReader,
    private statusBarCreator: StatusBarCreator
  ) {}

  refreshButtons = () => {
    this.dispose();
    this.createRefreshButton();
    this.createCommandButtons();
  };

  private createCommandButtons = () => {
    const buttons = this.configReader.getButtons();

    buttons.forEach((button, index) => {
      const statusBarItem = this.statusBarCreator(
        vscode.StatusBarAlignment.Left,
        1000 - index
      );

      statusBarItem.text = button.name;
      statusBarItem.tooltip = button.group
        ? `${button.name} (Click to see options)`
        : button.command || button.name;

      if (button.color) {
        statusBarItem.color = button.color;
      }

      statusBarItem.command = {
        command: "quickCommandButtons.execute",
        title: "Execute Command",
        arguments: [button],
      };

      statusBarItem.show();
      this.statusBarItems.push(statusBarItem);
    });
  };

  private createRefreshButton = () => {
    const refreshConfig = this.configReader.getRefreshConfig();

    if (!refreshConfig.enabled) return;

    const refreshButton = this.statusBarCreator(
      vscode.StatusBarAlignment.Left,
      1001
    );

    refreshButton.text = refreshConfig.icon;
    refreshButton.tooltip = "Refresh Quick Command Buttons";
    refreshButton.command = "quickCommandButtons.refresh";
    refreshButton.color = refreshConfig.color;

    refreshButton.show();
    this.statusBarItems.push(refreshButton);
  };

  dispose = () => {
    this.statusBarItems.forEach((item) => item.dispose());
    this.statusBarItems = [];
  };

  static create = (configReader: ConfigReader, statusBarCreator: StatusBarCreator): StatusBarManager =>
    new StatusBarManager(configReader, statusBarCreator);
}
