import * as vscode from "vscode";
import { ButtonConfig } from "./types";
import { executeButtonCommand } from "./command-executor";

export class StatusBarManager {
  private statusBarItems: vscode.StatusBarItem[] = [];

  refreshButtons = () => {
    this.dispose();
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

  static executeCommand = (button: ButtonConfig) => {
    executeButtonCommand(button);
  };

  dispose = () => {
    this.statusBarItems.forEach((item) => item.dispose());
    this.statusBarItems = [];
  };
}