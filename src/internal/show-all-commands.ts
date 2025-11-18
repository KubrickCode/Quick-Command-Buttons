import * as vscode from "vscode";
import { ButtonConfig } from "../pkg/types";
import { MESSAGES } from "../shared/constants";
import { ConfigReader, QuickPickCreator, TerminalExecutor } from "./adapters";
import { createQuickPickWithShortcuts, QuickPickItem } from "./command-executor";

export const createQuickPickItemsFromButtons = (buttons: ButtonConfig[]): QuickPickItem[] => {
  return buttons.map((button) => ({
    command: button,
    description: button.group
      ? MESSAGES.INFO.commandsCount(button.group.length)
      : button.command || "",
    label: button.shortcut ? `${button.name} (${button.shortcut})` : button.name,
  }));
};

export const createShowAllCommandsCommand = (
  configReader: ConfigReader,
  terminalExecutor: TerminalExecutor,
  quickPickCreator: QuickPickCreator
) => {
  return () => {
    const buttons = configReader.getButtons();

    if (buttons.length === 0) {
      vscode.window.showInformationMessage(MESSAGES.ERROR.noCommands);
      return;
    }

    const items = createQuickPickItemsFromButtons(buttons);

    createQuickPickWithShortcuts(
      {
        items: items,
        placeholder: MESSAGES.INFO.selectCommandOrGroup,
        title: MESSAGES.INFO.quickCommands,
      },
      terminalExecutor,
      quickPickCreator
    );
  };
};
