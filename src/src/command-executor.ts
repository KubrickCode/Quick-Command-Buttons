import { ButtonConfig, SubButtonConfig } from "./types";
import { TerminalExecutor, QuickPickCreator } from "./adapters";

type QuickPickItem = {
  label: string;
  description: string;
  command: SubButtonConfig;
};

export const executeButtonCommand = (
  button: ButtonConfig,
  terminalExecutor: TerminalExecutor,
  quickPickCreator?: QuickPickCreator
) => {
  if (button.group && quickPickCreator) {
    showGroupQuickPick(button, terminalExecutor, quickPickCreator);
    return;
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
    description: cmd.command,
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
    terminalExecutor(
      cmd.command,
      cmd.useVsCodeApi || false,
      cmd.terminalName
    );
    quickPick.dispose();
  });

  quickPick.onDidChangeValue((value) => {
    if (value.length !== 1) return;
    
    const shortcutItem = items.find(
      (item) => item.command.shortcut?.toLowerCase() === value.toLowerCase()
    );
    
    if (!shortcutItem) return;
    
    terminalExecutor(
      shortcutItem.command.command,
      shortcutItem.command.useVsCodeApi || false,
      shortcutItem.command.terminalName
    );
    quickPick.dispose();
  });

  quickPick.show();
};