import * as vscode from "vscode";
import { createVSCodeConfigReader } from "../internal/adapters";

describe("adapters", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getButtonsFromConfig", () => {
    it("should return buttons from config with IDs added", () => {
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

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("Test Button");
      expect(result[1].name).toBe("Another Button");
      expect(result[0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[0].id).not.toBe(result[1].id);
      expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("quickCommandButtons");
      expect(mockConfig.get).toHaveBeenCalledWith("buttons");
    });

    it("should preserve existing IDs in buttons", () => {
      const existingId1 = "existing-id-1";
      const existingId2 = "existing-id-2";
      const mockButtons = [
        { command: "test command", id: existingId1, name: "Test Button" },
        { command: "another command", id: existingId2, name: "Another Button" },
      ];

      const mockConfig = {
        get: jest.fn((key: string) => (key === "buttons" ? mockButtons : undefined)),
      };

      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

      const configReader = createVSCodeConfigReader();
      const result = configReader.getButtons();

      expect(result[0].id).toBe(existingId1);
      expect(result[1].id).toBe(existingId2);
    });

    it("should add IDs to nested group items", () => {
      const mockButtons = [
        {
          group: [
            { command: "child 1", name: "Child 1" },
            { command: "child 2", name: "Child 2" },
          ],
          name: "Parent Group",
        },
      ];

      const mockConfig = {
        get: jest.fn((key: string) => (key === "buttons" ? mockButtons : undefined)),
      };

      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

      const configReader = createVSCodeConfigReader();
      const result = configReader.getButtons();

      expect(result[0].id).toBeDefined();
      expect(result[0].group![0].id).toBeDefined();
      expect(result[0].group![1].id).toBeDefined();
      expect(result[0].group![0].id).not.toBe(result[0].group![1].id);
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
