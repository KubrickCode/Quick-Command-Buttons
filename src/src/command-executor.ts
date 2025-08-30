import * as vscode from "vscode";
import { ButtonConfig, SubButtonConfig } from "./types";
import { TerminalManager } from "./terminal-manager";

export const executeButtonCommand = (button: ButtonConfig) => {
  if (button.group) {
    showGroupQuickPick(button);
  } else if (button.command) {
    TerminalManager.executeCommand(
      button.command,
      button.useVsCodeApi || false,
      button.terminalName
    );
  }
};

const showGroupQuickPick = (button: ButtonConfig) => {
  if (!button.group) return;

  const items = button.group.map((cmd) => ({
    label: cmd.shortcut ? `${cmd.name} (${cmd.shortcut})` : cmd.name,
    description: cmd.command,
    command: cmd,
  }));

  const quickPick = vscode.window.createQuickPick();
  quickPick.items = items;
  quickPick.title = `${button.name} Commands`;
  quickPick.placeholder = "Select a command to execute";

  quickPick.onDidAccept(() => {
    const selected = quickPick.selectedItems[0];
    if (selected && "command" in selected) {
      const cmd = selected.command as SubButtonConfig;
      TerminalManager.executeCommand(
        cmd.command,
        cmd.useVsCodeApi || false,
        cmd.terminalName
      );
    }
    quickPick.dispose();
  });

  quickPick.onDidChangeValue((value) => {
    if (value.length === 1) {
      const shortcutItem = items.find(
        (item) => item.command.shortcut?.toLowerCase() === value.toLowerCase()
      );
      if (shortcutItem) {
        TerminalManager.executeCommand(
          shortcutItem.command.command,
          shortcutItem.command.useVsCodeApi || false,
          shortcutItem.command.terminalName
        );
        quickPick.dispose();
        return;
      }
    }
  });

  quickPick.show();
};