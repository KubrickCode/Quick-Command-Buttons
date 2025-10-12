import * as vscode from "vscode";
import { TerminalExecutor } from "./adapters";

export const shouldCreateNewTerminal = (terminal: vscode.Terminal | undefined): boolean => {
  return !terminal || !!terminal.exitStatus;
};

export const determineTerminalName = (
  customTerminalName: string | undefined,
  command: string
): string => {
  return customTerminalName || command.split(" ")[0] || "Terminal";
};

export class TerminalManager {
  private terminals = new Map<string, vscode.Terminal>();

  executeCommand: TerminalExecutor = (command, useVsCodeApi = false, customTerminalName) => {
    if (useVsCodeApi) {
      vscode.commands.executeCommand(command);
      return;
    }

    const terminalName = determineTerminalName(customTerminalName, command);
    let terminal = this.terminals.get(terminalName);

    if (shouldCreateNewTerminal(terminal)) {
      terminal = vscode.window.createTerminal(terminalName);
      this.terminals.set(terminalName, terminal);
    }

    terminal!.show();
    terminal!.sendText(command);
  };

  dispose = () => {
    for (const terminal of this.terminals.values()) {
      terminal.dispose();
    }
    this.terminals.clear();
  };

  static create = (): TerminalManager => new TerminalManager();
}
