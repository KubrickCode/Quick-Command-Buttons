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

  describe("createRootTreeItems", () => {
    it("should create mixed command and group tree items", () => {
      const buttons: ButtonConfig[] = [
        { name: "Simple Command", command: "echo hello" },
        {
          name: "Command Group",
          group: [
            { name: "Group Command 1", command: "ls" },
            { name: "Group Command 2", command: "pwd" },
          ],
        },
        {
          name: "VS Code Command",
          command: "workbench.action.reload",
          useVsCodeApi: true,
        },
      ];

      const result = createRootTreeItems(buttons);

      expect(result).toHaveLength(3);
      expect(result[0]).toBeInstanceOf(CommandTreeItem);
      expect(result[0].label).toBe("Simple Command");
      expect((result[0] as CommandTreeItem).commandString).toBe("echo hello");

      expect(result[1]).toBeInstanceOf(GroupTreeItem);
      expect(result[1].label).toBe("Command Group");
      expect((result[1] as GroupTreeItem).commands).toHaveLength(2);

      expect(result[2]).toBeInstanceOf(CommandTreeItem);
      expect(result[2].label).toBe("VS Code Command");
      expect((result[2] as CommandTreeItem).useVsCodeApi).toBe(true);
    });

    it("should verify correct item types and labels", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Terminal Command",
          command: "npm run build",
          terminalName: "build-terminal",
        },
        {
          name: "Development Tools",
          group: [{ name: "Start Server", command: "npm start" }],
        },
      ];

      const result = createRootTreeItems(buttons);

      expect(result).toHaveLength(2);

      const commandItem = result[0] as CommandTreeItem;
      expect(commandItem).toBeInstanceOf(CommandTreeItem);
      expect(commandItem.label).toBe("Terminal Command");
      expect(commandItem.commandString).toBe("npm run build");
      expect(commandItem.terminalName).toBe("build-terminal");
      expect(commandItem.useVsCodeApi).toBe(false);

      const groupItem = result[1] as GroupTreeItem;
      expect(groupItem).toBeInstanceOf(GroupTreeItem);
      expect(groupItem.label).toBe("Development Tools");
      expect(groupItem.commands).toHaveLength(1);
      expect(groupItem.commands[0].name).toBe("Start Server");
    });

    it("should handle empty button array scenario", () => {
      const buttons: ButtonConfig[] = [];

      const result = createRootTreeItems(buttons);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should handle buttons with no command property", () => {
      const buttons: ButtonConfig[] = [
        { name: "Invalid Button" } as ButtonConfig,
        { name: "Empty Command", command: "" },
      ];

      const result = createRootTreeItems(buttons);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CommandTreeItem);
      expect((result[0] as CommandTreeItem).commandString).toBe("");
      expect(result[1]).toBeInstanceOf(CommandTreeItem);
      expect((result[1] as CommandTreeItem).commandString).toBe("");
    });

    it("should handle nested group structures", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Main Group",
          group: [
            { name: "Sub Command 1", command: "echo test1" },
            { name: "Sub Command 2", command: "echo test2" },
            { name: "Sub Command 3", command: "echo test3" },
          ],
        },
      ];

      const result = createRootTreeItems(buttons);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(GroupTreeItem);
      const groupItem = result[0] as GroupTreeItem;
      expect(groupItem.label).toBe("Main Group");
      expect(groupItem.commands).toHaveLength(3);
      expect(groupItem.commands[0].name).toBe("Sub Command 1");
      expect(groupItem.commands[1].name).toBe("Sub Command 2");
      expect(groupItem.commands[2].name).toBe("Sub Command 3");
    });
  });
});
