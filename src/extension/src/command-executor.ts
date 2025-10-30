import * as vscode from "vscode";
import { TerminalExecutor, QuickPickCreator } from "./adapters";
import { findMatchingShortcut } from "./keyboard-layout-converter";
import { ButtonConfig } from "./types";

export type QuickPickItem = {
  command: ButtonConfig;
  description: string;
  label: string;
};

export type QuickPickConfig = {
  items: QuickPickItem[];
  placeholder: string;
  title: string;
};

export const validateShortcuts = (items: QuickPickItem[]): string[] => {
  const shortcuts = items
    .filter((item) => item.command.shortcut)
    .map((item) => item.command.shortcut!.toLowerCase());

  const duplicates = shortcuts.filter((shortcut, index) => shortcuts.indexOf(shortcut) !== index);

  return [...new Set(duplicates)];
};

export const findShortcutItem = (
  items: QuickPickItem[],
  inputValue: string
): QuickPickItem | undefined => {
  if (inputValue.length !== 1) return undefined;

  const shortcuts = items
    .map((item) => item.command.shortcut)
    .filter((shortcut): shortcut is string => Boolean(shortcut));

  const matchingShortcut = findMatchingShortcut(inputValue, shortcuts);

  if (!matchingShortcut) return undefined;

  return items.find(
    (item) => item.command.shortcut?.toLowerCase() === matchingShortcut.toLowerCase()
  );
};

export const createQuickPickCommandExecutor = (
  terminalExecutor: TerminalExecutor,
  quickPickCreator: QuickPickCreator,
  quickPick: vscode.QuickPick<QuickPickItem>
) => {
  let commandExecuted = false;

  return (item: QuickPickItem) => {
    if (commandExecuted) return;
    commandExecuted = true;

    quickPick.dispose();
    executeButtonCommand(item.command, terminalExecutor, quickPickCreator);
  };
};

export const determineButtonExecutionType = (
  button: ButtonConfig
): "executeAll" | "showQuickPick" | "executeCommand" | "invalid" => {
  if (button.group) {
    if (button.executeAll) {
      return "executeAll";
    }
    return "showQuickPick";
  }

  if (!button.command || button.command.trim() === "") {
    return "invalid";
  }

  return "executeCommand";
};

export const createQuickPickWithShortcuts = (
  config: QuickPickConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator: QuickPickCreator
) => {
  const duplicates = validateShortcuts(config.items);

  if (duplicates.length > 0) {
    vscode.window.showErrorMessage(
      `Duplicate shortcuts detected: ${duplicates.join(
        ", "
      )}. Please ensure each shortcut is unique.`
    );
    return;
  }

  const quickPick = quickPickCreator<QuickPickItem>();
  quickPick.items = config.items;
  quickPick.title = config.title;
  quickPick.placeholder = config.placeholder;

  const executeCommand = createQuickPickCommandExecutor(
    terminalExecutor,
    quickPickCreator,
    quickPick
  );

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0];
    if (!selected) return;
    executeCommand(selected);
  });

  quickPick.onDidChangeValue((value) => {
    const trimmedValue = value.trim();
    const shortcutItem = findShortcutItem(config.items, trimmedValue);

    if (!shortcutItem) return;
    executeCommand(shortcutItem);
  });

  quickPick.show();
};

export const createQuickPickItems = (commands: ButtonConfig[]): QuickPickItem[] => {
  return commands.map((cmd) => ({
    command: cmd,
    description: cmd.command || "",
    label: cmd.shortcut ? `${cmd.name} (${cmd.shortcut})` : cmd.name,
  }));
};

export const executeTerminalCommand = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor
) => {
  if (!button.command) return;

  terminalExecutor(button.command, button.useVsCodeApi || false, button.terminalName);
};

export const executeButtonCommand = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator?: QuickPickCreator
) => {
  const executionType = determineButtonExecutionType(button);

  switch (executionType) {
    case "executeAll":
      executeAllCommands(button, terminalExecutor);
      break;

    case "showQuickPick":
      if (quickPickCreator) {
        showGroupQuickPick(button, terminalExecutor, quickPickCreator);
      }
      break;

    case "executeCommand":
      executeTerminalCommand(button, terminalExecutor);
      break;

    case "invalid":
      return;
  }
};

const showGroupQuickPick = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator: QuickPickCreator
) => {
  if (!button.group) return;

  const items = createQuickPickItems(button.group);

  createQuickPickWithShortcuts(
    {
      items: items,
      placeholder: "Select a command to execute",
      title: `${button.name} Commands`,
    },
    terminalExecutor,
    quickPickCreator
  );
};

export const executeCommandsRecursively = (
  commands: ButtonConfig[],
  terminalExecutor: TerminalExecutor
): void => {
  commands.forEach((cmd) => {
    if (cmd.group && cmd.executeAll) {
      executeCommandsRecursively(cmd.group, terminalExecutor);
    } else if (cmd.command) {
      terminalExecutor(cmd.command, cmd.useVsCodeApi || false, cmd.terminalName);
    }
  });
};

const executeAllCommands = (button: ButtonConfig, terminalExecutor: TerminalExecutor) => {
  if (!button.group) return;

  executeCommandsRecursively(button.group, terminalExecutor);
};
