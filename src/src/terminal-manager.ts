import * as vscode from "vscode";

export class TerminalManager {
  private static terminals = new Map<string, vscode.Terminal>();

  static executeCommand = (
    command: string,
    useVsCodeApi: boolean = false,
    customTerminalName?: string
  ) => {
    if (useVsCodeApi) {
      vscode.commands.executeCommand(command);
      return;
    }

    const terminalName = customTerminalName || TerminalManager.generateTerminalName(command);
    let terminal = TerminalManager.terminals.get(terminalName);

    if (!terminal || terminal.exitStatus) {
      terminal = vscode.window.createTerminal(terminalName);
      TerminalManager.terminals.set(terminalName, terminal);
    }

    terminal.show();
    terminal.sendText(command);
  };

  private static generateTerminalName = (command: string): string => {
    return command.split(" ")[0] || "Terminal";
  };

  static dispose = () => {
    for (const terminal of TerminalManager.terminals.values()) {
      terminal.dispose();
    }
    TerminalManager.terminals.clear();
  };
}