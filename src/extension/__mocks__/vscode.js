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
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
  },
};
