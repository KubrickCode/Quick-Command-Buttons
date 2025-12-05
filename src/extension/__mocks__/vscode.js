// Minimal VS Code mock for Vitest testing
import { vi } from "vitest";

export class EventEmitter {
  constructor() {
    this.event = vi.fn();
    this._disposed = false;
  }
  fire(data) {
    if (!this._disposed) {
      this.event(data);
    }
  }
  dispose() {
    this._disposed = true;
  }
}

export class TreeItem {
  constructor(label, collapsibleState) {
    this.label = label;
    this.collapsibleState = collapsibleState;
  }
}

export const TreeItemCollapsibleState = {
  None: 0,
  Collapsed: 1,
  Expanded: 2,
};

export class ThemeIcon {
  constructor(id) {
    this.id = id;
  }
}

export const Uri = {
  file: vi.fn(),
};

export const env = {
  language: "en",
};

export const l10n = {
  t: vi.fn((key, ...args) => {
    if (args.length > 0) {
      let result = key;
      args.forEach((arg, index) => {
        result = result.replace(`{${index}}`, arg);
      });
      return result;
    }
    return key;
  }),
};

export const window = {
  showErrorMessage: vi.fn(),
  showInformationMessage: vi.fn(),
  createTreeView: vi.fn(),
  createTerminal: vi.fn(),
  onDidCloseTerminal: vi.fn(),
};

export const commands = {
  executeCommand: vi.fn().mockResolvedValue(undefined),
  registerCommand: vi.fn(),
};

export const workspace = {
  getConfiguration: vi.fn(),
  onDidChangeConfiguration: vi.fn(),
};

export const ConfigurationTarget = {
  Global: 1,
  Workspace: 2,
  WorkspaceFolder: 3,
};

export const StatusBarAlignment = {
  Left: 1,
  Right: 2,
};
