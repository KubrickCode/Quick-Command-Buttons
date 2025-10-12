import * as vscode from "vscode";
import { createQuickPickWithShortcuts, QuickPickItem } from "./command-executor";
import { ConfigReader, QuickPickCreator, TerminalExecutor } from "./adapters";
import { ButtonConfig } from "./types";

export const createQuickPickItemsFromButtons = (buttons: ButtonConfig[]): QuickPickItem[] => {
  return buttons.map((button) => ({
    label: button.shortcut ? `${button.name} (${button.shortcut})` : button.name,
    description: button.group ? `${button.group.length} commands` : button.command || "",
    command: button,
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
      vscode.window.showInformationMessage("No commands found");
      return;
    }

    const items = createQuickPickItemsFromButtons(buttons);

    createQuickPickWithShortcuts(
      {
        title: "Quick Commands",
        placeholder: "Select a command/group to execute (or type shortcut key)",
        items: items,
      },
      terminalExecutor,
      quickPickCreator
    );
  };
};
