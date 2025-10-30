import * as vscode from "vscode";
import { ConfigReader, QuickPickCreator, TerminalExecutor } from "./adapters";
import { createQuickPickWithShortcuts, QuickPickItem } from "./command-executor";
import { ButtonConfig } from "./types";

export const createQuickPickItemsFromButtons = (buttons: ButtonConfig[]): QuickPickItem[] => {
  return buttons.map((button) => ({
    command: button,
    description: button.group ? `${button.group.length} commands` : button.command || "",
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
      vscode.window.showInformationMessage("No commands found");
      return;
    }

    const items = createQuickPickItemsFromButtons(buttons);

    createQuickPickWithShortcuts(
      {
        items: items,
        placeholder: "Select a command/group to execute (or type shortcut key)",
        title: "Quick Commands",
      },
      terminalExecutor,
      quickPickCreator
    );
  };
};
