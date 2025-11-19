import { CommandTreeItem, GroupTreeItem } from "../internal/providers/command-tree-provider";
import { createTreeItems } from "../internal/utils/ui-items";
import { ButtonConfig } from "../pkg/types";

describe("command-tree-provider", () => {
  describe("createTreeItems", () => {
    it("should create command tree items from simple commands", () => {
      const commands: ButtonConfig[] = [
        { id: "test-cmd-1", command: "echo hello", name: "Test Command 1" },
        { id: "test-cmd-2", command: "ls -la", name: "Test Command 2" },
      ];

      const result = createTreeItems(commands);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CommandTreeItem);
      expect(result[0].label).toBe("Test Command 1");
      expect((result[0] as CommandTreeItem).commandString).toBe("echo hello");
      expect((result[0] as CommandTreeItem).useVsCodeApi).toBe(false);
      expect((result[0] as CommandTreeItem).terminalName).toBeUndefined();

      expect(result[1]).toBeInstanceOf(CommandTreeItem);
      expect(result[1].label).toBe("Test Command 2");
      expect((result[1] as CommandTreeItem).commandString).toBe("ls -la");
      expect((result[1] as CommandTreeItem).useVsCodeApi).toBe(false);
      expect((result[1] as CommandTreeItem).terminalName).toBeUndefined();
    });

    it("should create command tree items with VS Code API and terminal name", () => {
      const commands: ButtonConfig[] = [
        {
          id: "vscode-cmd",
          command: "workbench.action.openSettings",
          name: "VS Code Command",
          terminalName: "settings-terminal",
          useVsCodeApi: true,
        },
      ];

      const result = createTreeItems(commands);

      expect(result).toHaveLength(1);
      expect(result[0].label).toBe("VS Code Command");
      expect((result[0] as CommandTreeItem).commandString).toBe("workbench.action.openSettings");
      expect((result[0] as CommandTreeItem).useVsCodeApi).toBe(true);
      expect((result[0] as CommandTreeItem).terminalName).toBe("settings-terminal");
    });

    it("should handle commands with empty command string", () => {
      const commands: ButtonConfig[] = [
        { id: "empty-cmd", command: "", name: "Empty Command" },
        { id: "no-cmd-prop", name: "No Command Property" } as ButtonConfig,
      ];

      const result = createTreeItems(commands);

      expect(result).toHaveLength(2);
      expect((result[0] as CommandTreeItem).commandString).toBe("");
      expect((result[1] as CommandTreeItem).commandString).toBe("");
    });

    it("should handle empty commands array", () => {
      const commands: ButtonConfig[] = [];

      const result = createTreeItems(commands);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should preserve original command objects without modification", () => {
      const commands: ButtonConfig[] = [
        {
          id: "original-cmd",
          color: "red",
          command: "test command",
          name: "Original Command",
          terminalName: "test-terminal",
          useVsCodeApi: true,
        },
      ];
      const originalCommands = JSON.parse(JSON.stringify(commands));

      createTreeItems(commands);

      expect(commands).toEqual(originalCommands);
    });

    it("should handle mixed command configurations", () => {
      const commands: ButtonConfig[] = [
        { id: "simple-cmd", command: "echo simple", name: "Simple" },
        {
          id: "complex-cmd",
          command: "npm test",
          name: "Complex",
          terminalName: "test-terminal",
          useVsCodeApi: false,
        },
        {
          id: "vscode-reload",
          command: "workbench.action.reload",
          name: "VS Code",
          useVsCodeApi: true,
        },
      ];

      const result = createTreeItems(commands);

      expect(result).toHaveLength(3);
      expect((result[0] as CommandTreeItem).useVsCodeApi).toBe(false);
      expect((result[0] as CommandTreeItem).terminalName).toBeUndefined();
      expect((result[1] as CommandTreeItem).useVsCodeApi).toBe(false);
      expect((result[1] as CommandTreeItem).terminalName).toBe("test-terminal");
      expect((result[2] as CommandTreeItem).useVsCodeApi).toBe(true);
      expect((result[2] as CommandTreeItem).terminalName).toBeUndefined();
    });

    it("should handle nested groups", () => {
      const commands: ButtonConfig[] = [
        { id: "simple-cmd", command: "echo simple", name: "Simple Command" },
        {
          id: "nested-group",
          group: [
            { id: "sub-cmd-1", command: "echo sub1", name: "Sub Command 1" },
            { id: "sub-cmd-2", command: "echo sub2", name: "Sub Command 2" },
          ],
          name: "Nested Group",
        },
      ];

      const result = createTreeItems(commands);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CommandTreeItem);
      expect((result[0] as CommandTreeItem).commandString).toBe("echo simple");

      expect(result[1]).toBeInstanceOf(GroupTreeItem);
      expect(result[1].label).toBe("Nested Group");
      expect((result[1] as GroupTreeItem).commands).toHaveLength(2);
    });
  });

  describe("createTreeItems (root)", () => {
    it("should create mixed command and group tree items", () => {
      const buttons: ButtonConfig[] = [
        { id: "simple-cmd", command: "echo hello", name: "Simple Command" },
        {
          id: "cmd-group",
          group: [
            { id: "group-cmd-1", command: "ls", name: "Group Command 1" },
            { id: "group-cmd-2", command: "pwd", name: "Group Command 2" },
          ],
          name: "Command Group",
        },
        {
          id: "vscode-cmd",
          command: "workbench.action.reload",
          name: "VS Code Command",
          useVsCodeApi: true,
        },
      ];

      const result = createTreeItems(buttons);

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
          id: "terminal-cmd",
          command: "npm run build",
          name: "Terminal Command",
          terminalName: "build-terminal",
        },
        {
          id: "dev-tools",
          group: [{ id: "start-server", command: "npm start", name: "Start Server" }],
          name: "Development Tools",
        },
      ];

      const result = createTreeItems(buttons);

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

      const result = createTreeItems(buttons);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should handle buttons with no command property", () => {
      const buttons: ButtonConfig[] = [
        { id: "invalid-btn", name: "Invalid Button" } as ButtonConfig,
        { id: "empty-cmd", command: "", name: "Empty Command" },
      ];

      const result = createTreeItems(buttons);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(CommandTreeItem);
      expect((result[0] as CommandTreeItem).commandString).toBe("");
      expect(result[1]).toBeInstanceOf(CommandTreeItem);
      expect((result[1] as CommandTreeItem).commandString).toBe("");
    });

    it("should handle nested group structures", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "main-group",
          group: [
            { id: "sub-cmd-1", command: "echo test1", name: "Sub Command 1" },
            { id: "sub-cmd-2", command: "echo test2", name: "Sub Command 2" },
            { id: "sub-cmd-3", command: "echo test3", name: "Sub Command 3" },
          ],
          name: "Main Group",
        },
      ];

      const result = createTreeItems(buttons);

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
