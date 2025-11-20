import { CommandTreeItem, GroupTreeItem } from "../internal/providers/command-tree-provider";
import { createTreeItems } from "../internal/utils/ui-items";
import { ButtonConfig } from "../pkg/types";

describe("command-tree-provider", () => {
  describe("createTreeItems", () => {
    it("should create command tree items from simple commands", () => {
      const commands: ButtonConfig[] = [
        { command: "echo hello", id: "test-cmd-1", name: "Test Command 1" },
        { command: "ls -la", id: "test-cmd-2", name: "Test Command 2" },
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
          command: "workbench.action.openSettings",
          id: "vscode-cmd",
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
        { command: "", id: "empty-cmd", name: "Empty Command" },
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
          color: "red",
          command: "test command",
          id: "original-cmd",
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
        { command: "echo simple", id: "simple-cmd", name: "Simple" },
        {
          command: "npm test",
          id: "complex-cmd",
          name: "Complex",
          terminalName: "test-terminal",
          useVsCodeApi: false,
        },
        {
          command: "workbench.action.reload",
          id: "vscode-reload",
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
        { command: "echo simple", id: "simple-cmd", name: "Simple Command" },
        {
          group: [
            { command: "echo sub1", id: "sub-cmd-1", name: "Sub Command 1" },
            { command: "echo sub2", id: "sub-cmd-2", name: "Sub Command 2" },
          ],
          id: "nested-group",
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
        { command: "echo hello", id: "simple-cmd", name: "Simple Command" },
        {
          group: [
            { command: "ls", id: "group-cmd-1", name: "Group Command 1" },
            { command: "pwd", id: "group-cmd-2", name: "Group Command 2" },
          ],
          id: "cmd-group",
          name: "Command Group",
        },
        {
          command: "workbench.action.reload",
          id: "vscode-cmd",
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
          command: "npm run build",
          id: "terminal-cmd",
          name: "Terminal Command",
          terminalName: "build-terminal",
        },
        {
          group: [{ command: "npm start", id: "start-server", name: "Start Server" }],
          id: "dev-tools",
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
        { command: "", id: "empty-cmd", name: "Empty Command" },
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
          group: [
            { command: "echo test1", id: "sub-cmd-1", name: "Sub Command 1" },
            { command: "echo test2", id: "sub-cmd-2", name: "Sub Command 2" },
            { command: "echo test3", id: "sub-cmd-3", name: "Sub Command 3" },
          ],
          id: "main-group",
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
