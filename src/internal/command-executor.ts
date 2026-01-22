import { debounce } from "es-toolkit";
import * as vscode from "vscode";
import { ButtonConfig } from "../pkg/types";
import { MESSAGES } from "../shared/constants";
import { TerminalExecutor, QuickPickCreator } from "./adapters";
import { EventBus } from "./event-bus";
import { findMatchingShortcut } from "./keyboard-layout-converter";
import { QuickPickItem, createQuickPickItems, createButtonId } from "./utils/ui-items";

export const SHORTCUT_DEBOUNCE_MS = 200;

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
  quickPick: vscode.QuickPick<QuickPickItem>,
  eventBus?: EventBus
) => {
  let commandExecuted = false;

  return (item: QuickPickItem) => {
    if (commandExecuted) return;
    commandExecuted = true;

    quickPick.dispose();
    executeButtonCommand(item.command, terminalExecutor, quickPickCreator, eventBus);
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
  quickPickCreator: QuickPickCreator,
  eventBus?: EventBus
) => {
  const duplicates = validateShortcuts(config.items);

  if (duplicates.length > 0) {
    vscode.window.showErrorMessage(MESSAGES.ERROR.duplicateShortcuts(duplicates));
    return;
  }

  const quickPick = quickPickCreator<QuickPickItem>();
  quickPick.items = config.items;
  quickPick.title = config.title;
  quickPick.placeholder = config.placeholder;

  const executeCommand = createQuickPickCommandExecutor(
    terminalExecutor,
    quickPickCreator,
    quickPick,
    eventBus
  );

  const debouncedShortcutExecutor = debounce((value: string) => {
    const shortcutItem = findShortcutItem(config.items, value);
    if (shortcutItem) {
      executeCommand(shortcutItem);
    }
  }, SHORTCUT_DEBOUNCE_MS);

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0];
    if (!selected) return;
    debouncedShortcutExecutor.cancel();
    executeCommand(selected);
  });

  quickPick.onDidChangeValue((value) => {
    debouncedShortcutExecutor(value.trim());
  });

  quickPick.onDidHide(() => {
    debouncedShortcutExecutor.cancel();
  });

  quickPick.show();
};

export const executeTerminalCommand = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  eventBus?: EventBus
) => {
  if (!button.command) return;

  terminalExecutor(
    button.command,
    button.useVsCodeApi || false,
    button.terminalName,
    button.name,
    button,
    button.newTerminal || false
  );

  eventBus?.emit("button:executed", { button, success: true });
};

export const executeButtonCommand = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator?: QuickPickCreator,
  eventBus?: EventBus
) => {
  const executionType = determineButtonExecutionType(button);

  switch (executionType) {
    case "executeAll":
      executeAllCommands(button, terminalExecutor, eventBus);
      break;

    case "showQuickPick":
      if (quickPickCreator) {
        showGroupQuickPick(button, terminalExecutor, quickPickCreator, eventBus);
      }
      break;

    case "executeCommand":
      executeTerminalCommand(button, terminalExecutor, eventBus);
      break;

    case "invalid":
      return;
  }
};

const showGroupQuickPick = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator: QuickPickCreator,
  eventBus?: EventBus
) => {
  if (!button.group) return;

  const items = createQuickPickItems(button.group);

  createQuickPickWithShortcuts(
    {
      items: items,
      placeholder: MESSAGES.INFO.selectCommand,
      title: MESSAGES.INFO.groupCommands(button.name),
    },
    terminalExecutor,
    quickPickCreator,
    eventBus
  );
};

export const executeCommandsRecursively = (
  commands: ButtonConfig[],
  terminalExecutor: TerminalExecutor,
  parentPath = "",
  eventBus?: EventBus
): void => {
  commands.forEach((cmd, index) => {
    const buttonId = createButtonId(cmd.name, index, parentPath);

    if (cmd.group && cmd.executeAll) {
      executeCommandsRecursively(cmd.group, terminalExecutor, buttonId, eventBus);
    } else if (cmd.command) {
      terminalExecutor(
        cmd.command,
        cmd.useVsCodeApi || false,
        cmd.terminalName,
        buttonId,
        cmd,
        cmd.newTerminal || false
      );
      eventBus?.emit("button:executed", { button: cmd, success: true });
    }
  });
};

const executeAllCommands = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  eventBus?: EventBus
) => {
  if (!button.group) return;

  executeCommandsRecursively(button.group, terminalExecutor, button.name, eventBus);
};
