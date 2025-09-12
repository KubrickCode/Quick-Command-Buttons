import * as vscode from "vscode";
import { TerminalExecutor } from "./adapters";

export class TerminalManager {
  private terminals = new Map<string, vscode.Terminal>();

  executeCommand: TerminalExecutor = (
    command,
    useVsCodeApi = false,
    customTerminalName
  ) => {
    if (useVsCodeApi) {
      vscode.commands.executeCommand(command);
      return;
    }

    const terminalName =
      customTerminalName || this.generateTerminalName(command);
    let terminal = this.terminals.get(terminalName);

    if (!terminal || terminal.exitStatus) {
      terminal = vscode.window.createTerminal(terminalName);
      this.terminals.set(terminalName, terminal);
    }

    terminal.show();
    terminal.sendText(command);
  };

  private generateTerminalName = (command: string): string => {
    return command.split(" ")[0] || "Terminal";
  };

  dispose = () => {
    for (const terminal of this.terminals.values()) {
      terminal.dispose();
    }
    this.terminals.clear();
  };

  static create = (): TerminalManager => new TerminalManager();
}
