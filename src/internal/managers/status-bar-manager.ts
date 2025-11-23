import * as vscode from "vscode";
import { ButtonConfig } from "../../pkg/types";
import { ConfigReader, StatusBarCreator } from "../adapters";
import { ConfigManager } from "./config-manager";

export const calculateButtonPriority = (index: number): number => {
  return 1000 - index;
};

export const createTooltipText = (button: ButtonConfig): string => {
  return button.group ? `${button.name} (Click to see options)` : button.command || button.name;
};

export const createButtonCommand = (button: ButtonConfig) => ({
  arguments: [button],
  command: "quickCommandButtons.execute",
  title: "Execute Command",
});

type RefreshConfig = {
  color: string;
  enabled: boolean;
  icon: string;
};

export const configureRefreshButton = (
  button: vscode.StatusBarItem,
  refreshConfig: RefreshConfig
) => {
  button.text = refreshConfig.icon;
  button.tooltip = "Refresh Quick Command Buttons";
  button.command = "quickCommandButtons.refresh";
  button.color = refreshConfig.color;
};

export class StatusBarManager {
  private statusBarItems: vscode.StatusBarItem[] = [];

  constructor(
    private configReader: ConfigReader,
    private statusBarCreator: StatusBarCreator,
    private configManager: ConfigManager
  ) {}

  static create = (
    configReader: ConfigReader,
    statusBarCreator: StatusBarCreator,
    configManager: ConfigManager
  ): StatusBarManager => new StatusBarManager(configReader, statusBarCreator, configManager);

  dispose = () => {
    this.statusBarItems.forEach((item) => item.dispose());
    this.statusBarItems = [];
  };

  refreshButtons = () => {
    this.dispose();
    this.createRefreshButton();
    this.createCommandButtons();
  };

  private createCommandButtons = () => {
    const target = this.configManager.getVSCodeConfigurationTarget();
    const buttons = this.configReader.getButtonsFromScope(target);

    buttons.forEach((button, index) => {
      const statusBarItem = this.statusBarCreator(
        vscode.StatusBarAlignment.Left,
        calculateButtonPriority(index)
      );

      statusBarItem.text = button.name;
      statusBarItem.tooltip = createTooltipText(button);

      if (button.color) {
        statusBarItem.color = button.color;
      }

      statusBarItem.command = createButtonCommand(button);

      statusBarItem.show();
      this.statusBarItems.push(statusBarItem);
    });
  };

  private createRefreshButton = () => {
    const refreshConfig = this.configReader.getRefreshConfig();

    if (!refreshConfig.enabled) return;

    const refreshButton = this.statusBarCreator(vscode.StatusBarAlignment.Left, 1001);

    configureRefreshButton(refreshButton, refreshConfig);

    refreshButton.show();
    this.statusBarItems.push(refreshButton);
  };
}
