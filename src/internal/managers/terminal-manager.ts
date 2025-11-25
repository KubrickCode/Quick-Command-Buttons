import * as vscode from "vscode";
import { DEFAULT_TERMINAL_BASE_NAME, TERMINAL_NAME_PREFIX } from "../../shared/constants";
import { TerminalExecutor } from "../adapters";

export const shouldCreateNewTerminal = (terminal: vscode.Terminal | undefined): boolean => {
  return !terminal || !!terminal.exitStatus;
};

export const determineTerminalName = (
  customTerminalName: string | undefined,
  baseName: string
): string => {
  return customTerminalName ?? `${TERMINAL_NAME_PREFIX} ${baseName}`;
};

export class TerminalManager {
  private buttonIds = new WeakMap<object, string>();
  private disposables: vscode.Disposable[] = [];
  private idCounter = 0;
  private terminals = new Map<string, vscode.Terminal>();

  constructor() {
    this.disposables.push(vscode.window.onDidCloseTerminal(this.cleanupClosedTerminal.bind(this)));
  }

  static create = (): TerminalManager => new TerminalManager();

  dispose = () => {
    for (const terminal of this.terminals.values()) {
      terminal.dispose();
    }
    this.terminals.clear();
    this.disposables.forEach((d) => d.dispose());
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

    const baseName = buttonName ?? command.split(" ")[0] ?? DEFAULT_TERMINAL_BASE_NAME;
    const terminalName = determineTerminalName(customTerminalName, baseName);
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

  private cleanupClosedTerminal(closedTerminal: vscode.Terminal) {
    for (const [key, terminal] of this.terminals.entries()) {
      if (terminal === closedTerminal) {
        this.terminals.delete(key);
        break;
      }
    }
  }

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
