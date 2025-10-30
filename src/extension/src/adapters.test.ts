import * as vscode from "vscode";
import { createVSCodeConfigReader } from "./adapters";

describe("adapters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getButtonsFromConfig", () => {
    it("should return buttons from config", () => {
      const mockButtons = [
        { command: "test command", name: "Test Button" },
        { command: "another command", name: "Another Button" },
      ];

      const mockConfig = {
        get: jest.fn((key: string) => (key === "buttons" ? mockButtons : undefined)),
      };

      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

      const configReader = createVSCodeConfigReader();
      const result = configReader.getButtons();

      expect(result).toEqual(mockButtons);
      expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("quickCommandButtons");
      expect(mockConfig.get).toHaveBeenCalledWith("buttons");
    });

    it("should return empty array when no buttons in config", () => {
      const mockConfig = {
        get: jest.fn(() => undefined),
      };

      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

      const configReader = createVSCodeConfigReader();
      const result = configReader.getButtons();

      expect(result).toEqual([]);
      expect(mockConfig.get).toHaveBeenCalledWith("buttons");
    });
  });
});
