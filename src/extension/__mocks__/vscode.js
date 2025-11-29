// Minimal VS Code mock for Jest testing
module.exports = {
  TreeItem: class {
    constructor(label, collapsibleState) {
      this.label = label;
      this.collapsibleState = collapsibleState;
    }
  },
  TreeItemCollapsibleState: {
    None: 0,
    Collapsed: 1,
    Expanded: 2,
  },
  ThemeIcon: class {
    constructor(id) {
      this.id = id;
    }
  },
  Uri: {
    file: jest.fn(),
  },
  env: {
    language: "en",
  },
  l10n: {
    t: jest.fn((key, ...args) => {
      if (args.length > 0) {
        let result = key;
        args.forEach((arg, index) => {
          result = result.replace(`{${index}}`, arg);
        });
        return result;
      }
      return key;
    }),
  },
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    createTreeView: jest.fn(),
    createTerminal: jest.fn(),
    onDidCloseTerminal: jest.fn(),
  },
  commands: {
    executeCommand: jest.fn().mockResolvedValue(undefined),
    registerCommand: jest.fn(),
  },
  workspace: {
    getConfiguration: jest.fn(),
    onDidChangeConfiguration: jest.fn(),
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3,
  },
};
