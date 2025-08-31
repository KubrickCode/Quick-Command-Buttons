import { ButtonConfig } from "./types";
import { TerminalExecutor, QuickPickCreator } from "./adapters";

type QuickPickItem = {
  label: string;
  description: string;
  command: ButtonConfig;
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

  const quickPick = quickPickCreator<QuickPickItem>();
  quickPick.items = items;
  quickPick.title = `${button.name} Commands`;
  quickPick.placeholder = "Select a command to execute";

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0];
    if (!selected) return;

    const cmd = selected.command;
    quickPick.dispose();

    executeButtonCommand(cmd, terminalExecutor, quickPickCreator);
  });

  quickPick.onDidChangeValue((value) => {
    if (value.length !== 1) return;

    const shortcutItem = items.find(
      (item) => item.command.shortcut?.toLowerCase() === value.toLowerCase()
    );

    if (!shortcutItem) return;

    quickPick.dispose();

    executeButtonCommand(
      shortcutItem.command,
      terminalExecutor,
      quickPickCreator
    );
  });

  quickPick.show();
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
