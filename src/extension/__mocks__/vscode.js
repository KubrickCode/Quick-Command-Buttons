// Minimal VS Code mock for Jest testing
module.exports = {
  window: {
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
  },
};
