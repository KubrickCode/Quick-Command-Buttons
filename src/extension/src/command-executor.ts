import * as vscode from "vscode";
import { ButtonConfig } from "./types";
import { TerminalExecutor, QuickPickCreator } from "./adapters";

export type QuickPickItem = {
  label: string;
  description: string;
  command: ButtonConfig;
};

export type QuickPickConfig = {
  title: string;
  placeholder: string;
  items: QuickPickItem[];
};

export const createQuickPickWithShortcuts = (
  config: QuickPickConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator: QuickPickCreator
) => {
  const shortcuts = config.items
    .filter((item) => item.command.shortcut)
    .map((item) => item.command.shortcut!.toLowerCase());

  const duplicates = shortcuts.filter(
    (shortcut, index) => shortcuts.indexOf(shortcut) !== index
  );

  if (duplicates.length > 0) {
    const uniqueDuplicates = [...new Set(duplicates)];
    vscode.window.showErrorMessage(
      `Duplicate shortcuts detected: ${uniqueDuplicates.join(
        ", "
      )}. Please ensure each shortcut is unique.`
    );
    return;
  }

  const quickPick = quickPickCreator<QuickPickItem>();
  quickPick.items = config.items;
  quickPick.title = config.title;
  quickPick.placeholder = config.placeholder;

  let commandExecuted = false;

  const executeCommand = (item: QuickPickItem) => {
    if (commandExecuted) return;
    commandExecuted = true;

    quickPick.dispose();
    executeButtonCommand(item.command, terminalExecutor, quickPickCreator);
  };

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0];
    if (!selected) return;
    executeCommand(selected);
  });

  quickPick.onDidChangeValue((value) => {
    if (value.length !== 1) return;

    const shortcutItem = config.items.find(
      (item) => item.command.shortcut?.toLowerCase() === value.toLowerCase()
    );

    if (!shortcutItem) return;
    executeCommand(shortcutItem);
  });

  quickPick.show();
};

export const executeButtonCommand = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator?: QuickPickCreator
) => {
  if (button.group) {
    if (button.executeAll) {
      executeAllCommands(button, terminalExecutor);
      return;
    }

    if (quickPickCreator) {
      showGroupQuickPick(button, terminalExecutor, quickPickCreator);
      return;
    }
  }

  if (!button.command) return;

  terminalExecutor(
    button.command,
    button.useVsCodeApi || false,
    button.terminalName
  );
};

const showGroupQuickPick = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator: QuickPickCreator
) => {
  if (!button.group) return;

  const items: QuickPickItem[] = button.group.map((cmd) => ({
    label: cmd.shortcut ? `${cmd.name} (${cmd.shortcut})` : cmd.name,
    description: cmd.command || "",
    command: cmd,
  }));

  createQuickPickWithShortcuts(
    {
      title: `${button.name} Commands`,
      placeholder: "Select a command to execute",
      items: items,
    },
    terminalExecutor,
    quickPickCreator
  );
};

const executeAllCommands = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor
) => {
  if (!button.group) return;

  button.group.forEach((cmd) => {
    if (cmd.group && cmd.executeAll) {
      executeAllCommands(cmd, terminalExecutor);
    } else if (cmd.command) {
      terminalExecutor(
        cmd.command,
        cmd.useVsCodeApi || false,
        cmd.terminalName
      );
    }
  });
};
