import * as vscode from "vscode";
import { MESSAGES } from "../shared/constants";
import { ConfigReader, QuickPickCreator, TerminalExecutor } from "./adapters";
import { createQuickPickWithShortcuts } from "./command-executor";
import { createQuickPickItems } from "./utils/ui-items";

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

    const items = createQuickPickItems(buttons, true);

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
