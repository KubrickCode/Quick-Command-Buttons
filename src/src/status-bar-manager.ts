import * as vscode from "vscode";
import { ButtonConfig, RefreshButtonConfig } from "./types";
import { executeButtonCommand } from "./command-executor";

export class StatusBarManager {
  private statusBarItems: vscode.StatusBarItem[] = [];

  refreshButtons = () => {
    this.dispose();
    this.createRefreshButton();

    const config = vscode.workspace.getConfiguration("quickCommandButtons");
    const buttons: ButtonConfig[] = config.get("buttons") || [];

    buttons.forEach((button, index) => {
      const statusBarItem = vscode.window.createStatusBarItem(
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
    const config = vscode.workspace.getConfiguration("quickCommandButtons");
    const refreshConfig: RefreshButtonConfig = config.get("refreshButton") || {
      icon: "$(refresh)",
      color: "#00BCD4",
      enabled: true,
    };

    if (!refreshConfig.enabled) return;

    const refreshButton = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1001 // Higher priority than other buttons
    );

    refreshButton.text = refreshConfig.icon;
    refreshButton.tooltip = "Refresh Quick Command Buttons";
    refreshButton.command = "quickCommandButtons.refresh";
    refreshButton.color = refreshConfig.color;

    refreshButton.show();
    this.statusBarItems.push(refreshButton);
  };

  static executeCommand = (button: ButtonConfig) => {
    executeButtonCommand(button);
  };

  dispose = () => {
    this.statusBarItems.forEach((item) => item.dispose());
    this.statusBarItems = [];
  };
}
