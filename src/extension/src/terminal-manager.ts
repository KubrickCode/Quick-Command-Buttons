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
  private buttonIds = new WeakMap<object, string>();
  private idCounter = 0;
  private terminals = new Map<string, vscode.Terminal>();

  static create = (): TerminalManager => new TerminalManager();

  dispose = () => {
    for (const terminal of this.terminals.values()) {
      terminal.dispose();
    }
    this.terminals.clear();
  };

  executeCommand: TerminalExecutor = (
    command,
    useVsCodeApi = false,
    customTerminalName,
    buttonName,
    buttonRef
  ) => {
    if (useVsCodeApi) {
      vscode.commands.executeCommand(command);
      return;
    }

    const terminalName = determineTerminalName(customTerminalName, command);
    const uniqueId = this.getUniqueButtonId(buttonRef, buttonName);
    const terminalKey = JSON.stringify({
      command,
      name: uniqueId,
      terminalName: customTerminalName,
      useVsCodeApi,
    });

    let terminal = this.terminals.get(terminalKey);

    if (shouldCreateNewTerminal(terminal)) {
      terminal = vscode.window.createTerminal(terminalName);
      this.terminals.set(terminalKey, terminal);
    }

    terminal!.show();
    terminal!.sendText(command);
  };

  private getUniqueButtonId(buttonRef?: object, buttonName?: string): string {
    if (buttonRef) {
      let id = this.buttonIds.get(buttonRef);
      if (!id) {
        id = `btn-${this.idCounter++}`;
        this.buttonIds.set(buttonRef, id);
      }
      return id;
    }

    return buttonName ?? `temp-${this.idCounter++}`;
  }
}
