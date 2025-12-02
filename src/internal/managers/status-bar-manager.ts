import * as vscode from "vscode";
import { ButtonConfig } from "../../pkg/types";
import { COMMANDS } from "../../shared/constants";
import { ConfigReader, StatusBarCreator } from "../adapters";
import { EventBus } from "../event-bus";
import { ButtonSetManager } from "./button-set-manager";
import { ConfigManager } from "./config-manager";

const SET_INDICATOR_PRIORITY = 1002;

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

export const configureSetIndicator = (
  button: vscode.StatusBarItem,
  activeSetName: string | null
) => {
  const displayName = activeSetName ?? vscode.l10n.t("Default");
  button.text = `$(layers) [${displayName}]`;
  button.tooltip = vscode.l10n.t("Current Set: {0} (Click to switch)", displayName);
  button.command = COMMANDS.SWITCH_BUTTON_SET;
};

export class StatusBarManager {
  private buttonSetManager: ButtonSetManager | null = null;
  private statusBarItems: vscode.StatusBarItem[] = [];
  private readonly unsubscribers: Array<() => void> = [];

  constructor(
    private configReader: ConfigReader,
    private statusBarCreator: StatusBarCreator,
    private configManager: ConfigManager,
    private eventBus?: EventBus
  ) {
    this.setupEventListeners();
  }

  static create = ({
    configManager,
    configReader,
    eventBus,
    statusBarCreator,
  }: {
    configManager: ConfigManager;
    configReader: ConfigReader;
    eventBus?: EventBus;
    statusBarCreator: StatusBarCreator;
  }): StatusBarManager =>
    new StatusBarManager(configReader, statusBarCreator, configManager, eventBus);

  dispose = () => {
    this.disposeStatusBarItems();
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    this.unsubscribers.length = 0;
  };

  refreshButtons = () => {
    this.disposeStatusBarItems();
    this.createSetIndicator();
    this.createRefreshButton();
    this.createCommandButtons();
  };

  setButtonSetManager = (manager: ButtonSetManager) => {
    this.buttonSetManager = manager;
  };

  private createCommandButtons = () => {
    const activeSetButtons = this.buttonSetManager?.getButtonsForActiveSet();
    const buttons =
      activeSetButtons ?? this.configManager.getButtonsWithFallback(this.configReader).buttons;

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

  private createSetIndicator = () => {
    if (!this.buttonSetManager) return;

    const setIndicator = this.statusBarCreator(
      vscode.StatusBarAlignment.Left,
      SET_INDICATOR_PRIORITY
    );

    const activeSet = this.buttonSetManager.getActiveSet();
    configureSetIndicator(setIndicator, activeSet);

    setIndicator.show();
    this.statusBarItems.push(setIndicator);
  };

  private disposeStatusBarItems = () => {
    this.statusBarItems.forEach((item) => item.dispose());
    this.statusBarItems = [];
  };

  private setupEventListeners = () => {
    if (!this.eventBus) {
      return;
    }

    const refresh = () => this.refreshButtons();

    this.unsubscribers.push(
      this.eventBus.on("buttonSet:created", refresh),
      this.eventBus.on("buttonSet:deleted", refresh),
      this.eventBus.on("buttonSet:renamed", refresh),
      this.eventBus.on("buttonSet:switched", refresh),
      this.eventBus.on("config:changed", refresh)
    );
  };
}
