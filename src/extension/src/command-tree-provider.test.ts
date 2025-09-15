import { ButtonConfig } from "./types";
import {
  createTreeItemsFromGroup,
  createRootTreeItems,
  CommandTreeItem,
  GroupTreeItem,
} from "./command-tree-provider";

describe("command-tree-provider", () => {
  describe("createTreeItemsFromGroup", () => {
    it("should create command tree items from simple commands", () => {
      const commands: ButtonConfig[] = [
        { name: "Test Command 1", command: "echo hello" },
        { name: "Test Command 2", command: "ls -la" },
      ];

      const result = createTreeItemsFromGroup(commands);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CommandTreeItem);
      expect(result[0].label).toBe("Test Command 1");
      expect(result[0].commandString).toBe("echo hello");
      expect(result[0].useVsCodeApi).toBe(false);
      expect(result[0].terminalName).toBeUndefined();

      expect(result[1]).toBeInstanceOf(CommandTreeItem);
      expect(result[1].label).toBe("Test Command 2");
      expect(result[1].commandString).toBe("ls -la");
      expect(result[1].useVsCodeApi).toBe(false);
      expect(result[1].terminalName).toBeUndefined();
    });

    it("should create command tree items with VS Code API and terminal name", () => {
      const commands: ButtonConfig[] = [
        {
          name: "VS Code Command",
          command: "workbench.action.openSettings",
          useVsCodeApi: true,
          terminalName: "settings-terminal",
        },
      ];

      const result = createTreeItemsFromGroup(commands);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("VS Code Command");
      expect(result[0].commandString).toBe("workbench.action.openSettings");
      expect(result[0].useVsCodeApi).toBe(true);
      expect(result[0].terminalName).toBe("settings-terminal");
    });

    it("should handle commands with empty command string", () => {
      const commands: ButtonConfig[] = [
        { name: "Empty Command", command: "" },
        { name: "No Command Property" } as ButtonConfig,
      ];

      const result = createTreeItemsFromGroup(commands);

      expect(result).toHaveLength(2);
      expect(result[0].commandString).toBe("");
      expect(result[1].commandString).toBe("");
    });

    it("should handle empty commands array", () => {
      const commands: ButtonConfig[] = [];

      const result = createTreeItemsFromGroup(commands);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should preserve original command objects without modification", () => {
      const commands: ButtonConfig[] = [
        {
          name: "Original Command",
          command: "test command",
          useVsCodeApi: true,
          terminalName: "test-terminal",
          color: "red",
        },
      ];
      const originalCommands = JSON.parse(JSON.stringify(commands));

      createTreeItemsFromGroup(commands);

      expect(commands).toEqual(originalCommands);
    });

    it("should handle mixed command configurations", () => {
      const commands: ButtonConfig[] = [
        { name: "Simple", command: "echo simple" },
        {
          name: "Complex",
          command: "npm test",
          useVsCodeApi: false,
          terminalName: "test-terminal",
        },
        {
          name: "VS Code",
          command: "workbench.action.reload",
          useVsCodeApi: true,
        },
      ];

      const result = createTreeItemsFromGroup(commands);

      expect(result).toHaveLength(3);
      expect(result[0].useVsCodeApi).toBe(false);
      expect(result[0].terminalName).toBeUndefined();
      expect(result[1].useVsCodeApi).toBe(false);
      expect(result[1].terminalName).toBe("test-terminal");
      expect(result[2].useVsCodeApi).toBe(true);
      expect(result[2].terminalName).toBeUndefined();
    });
  });
});