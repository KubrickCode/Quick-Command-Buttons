import * as vscode from "vscode";
import { ButtonConfig } from "../../pkg/types";
import {
  CommandTreeItem,
  GroupTreeItem,
  createButtonId,
  createQuickPickItem,
  createQuickPickItems,
  createTreeItem,
  createTreeItems,
} from "./ui-items";

describe("ui-items", () => {
  describe("createButtonId", () => {
    it("should create button ID without parent path", () => {
      const id = createButtonId("MyButton", 0);

      expect(id).toBe("MyButton[0]");
    });

    it("should create button ID with parent path", () => {
      const id = createButtonId("ChildButton", 2, "ParentGroup");

      expect(id).toBe("ParentGroup>ChildButton[2]");
    });

    it("should handle nested parent paths", () => {
      const id = createButtonId("DeepChild", 1, "Parent>Child");

      expect(id).toBe("Parent>Child>DeepChild[1]");
    });

    it("should handle empty parent path as root level", () => {
      const id = createButtonId("RootButton", 5, "");

      expect(id).toBe("RootButton[5]");
    });
  });

  describe("createQuickPickItem", () => {
    it("should create QuickPickItem without shortcut", () => {
      const button: ButtonConfig = {
        command: "echo 'test'",
        id: "test-cmd",
        name: "Test Command",
      };

      const item = createQuickPickItem(button);

      expect(item.label).toBe("Test Command");
      expect(item.description).toBe("echo 'test'");
      expect(item.command).toBe(button);
    });

    it("should create QuickPickItem with shortcut", () => {
      const button: ButtonConfig = {
        command: "echo 'test'",
        id: "test-cmd",
        name: "Test Command",
        shortcut: "t",
      };

      const item = createQuickPickItem(button);

      expect(item.label).toBe("Test Command (t)");
      expect(item.description).toBe("echo 'test'");
    });

    it("should create QuickPickItem for group button without command count", () => {
      const button: ButtonConfig = {
        group: [
          { command: "cmd1", id: "cmd-1", name: "Command 1" },
          { command: "cmd2", id: "cmd-2", name: "Command 2" },
        ],
        id: "group-btn",
        name: "Group",
      };

      const item = createQuickPickItem(button, false);

      expect(item.label).toBe("Group");
      expect(item.description).toBe("");
    });

    it("should create QuickPickItem for group button with command count", () => {
      const button: ButtonConfig = {
        group: [
          { command: "cmd1", id: "cmd-1", name: "Command 1" },
          { command: "cmd2", id: "cmd-2", name: "Command 2" },
          { command: "cmd3", id: "cmd-3", name: "Command 3" },
        ],
        id: "group-btn",
        name: "Group",
      };

      const item = createQuickPickItem(button, true);

      expect(item.label).toBe("Group");
      expect(item.description).toBe("3 commands");
    });
  });

  describe("createQuickPickItems", () => {
    it("should create multiple QuickPickItems", () => {
      const buttons: ButtonConfig[] = [
        { command: "cmd1", id: "cmd-1", name: "Command 1", shortcut: "1" },
        { command: "cmd2", id: "cmd-2", name: "Command 2" },
      ];

      const items = createQuickPickItems(buttons);

      expect(items).toHaveLength(2);
      expect(items[0].label).toBe("Command 1 (1)");
      expect(items[1].label).toBe("Command 2");
    });

    it("should include command count when requested", () => {
      const buttons: ButtonConfig[] = [
        {
          group: [
            { command: "cmd1", id: "sub-1", name: "Sub 1" },
            { command: "cmd2", id: "sub-2", name: "Sub 2" },
          ],
          id: "group-btn",
          name: "Group",
        },
      ];

      const items = createQuickPickItems(buttons, true);

      expect(items[0].description).toBe("2 commands");
    });
  });

  describe("CommandTreeItem", () => {
    it("should create CommandTreeItem with all properties", () => {
      const item = new CommandTreeItem("Test", "echo test", true, "terminal1", "button1");

      expect(item.label).toBe("Test");
      expect(item.commandString).toBe("echo test");
      expect(item.useVsCodeApi).toBe(true);
      expect(item.terminalName).toBe("terminal1");
      expect(item.buttonName).toBe("button1");
      expect(item.tooltip).toBe("echo test");
      expect(item.contextValue).toBe("command");
      expect(item.command).toEqual({
        arguments: [item],
        command: "quickCommandButtons.executeFromTree",
        title: "Execute",
      });
    });

    it("should use label as buttonName when buttonName is not provided", () => {
      const item = new CommandTreeItem("Test", "echo test");

      expect(item.buttonName).toBe("Test");
    });
  });

  describe("GroupTreeItem", () => {
    it("should create GroupTreeItem", () => {
      const commands: ButtonConfig[] = [
        { command: "cmd1", id: "cmd-1", name: "Command 1" },
        { command: "cmd2", id: "cmd-2", name: "Command 2" },
      ];

      const item = new GroupTreeItem("Group", commands);

      expect(item.label).toBe("Group");
      expect(item.commands).toBe(commands);
      expect(item.tooltip).toBe("2 commands");
      expect(item.contextValue).toBe("group");
      expect(item.collapsibleState).toBe(vscode.TreeItemCollapsibleState.Collapsed);
    });
  });

  describe("createTreeItem", () => {
    it("should create CommandTreeItem for regular button", () => {
      const button: ButtonConfig = {
        command: "echo test",
        id: "test-btn",
        name: "Test",
        terminalName: "term1",
        useVsCodeApi: true,
      };

      const item = createTreeItem(button, 0);

      expect(item).toBeInstanceOf(CommandTreeItem);
      if (item instanceof CommandTreeItem) {
        expect(item.commandString).toBe("echo test");
        expect(item.buttonName).toBe("Test[0]");
        expect(item.terminalName).toBe("term1");
        expect(item.useVsCodeApi).toBe(true);
      }
    });

    it("should create GroupTreeItem for group button", () => {
      const button: ButtonConfig = {
        group: [{ command: "cmd1", id: "cmd-1", name: "Command 1" }],
        id: "group-btn",
        name: "Group",
      };

      const item = createTreeItem(button, 0);

      expect(item).toBeInstanceOf(GroupTreeItem);
      if (item instanceof GroupTreeItem) {
        expect(item.label).toBe("Group");
        expect(item.commands).toBe(button.group);
      }
    });

    it("should include parent path in buttonId", () => {
      const button: ButtonConfig = {
        command: "echo test",
        id: "test-btn",
        name: "Test",
      };

      const item = createTreeItem(button, 1, "Parent");

      expect(item).toBeInstanceOf(CommandTreeItem);
      if (item instanceof CommandTreeItem) {
        expect(item.buttonName).toBe("Parent>Test[1]");
      }
    });

    it("should handle button without command (invalid config scenario)", () => {
      // Testing invalid configuration scenario
      const button = {
        id: "empty-btn",
        name: "Empty",
      } as unknown as ButtonConfig;

      const item = createTreeItem(button, 0);

      expect(item).toBeInstanceOf(CommandTreeItem);
      if (item instanceof CommandTreeItem) {
        expect(item.commandString).toBe("");
      }
    });
  });

  describe("createTreeItems", () => {
    it("should create multiple tree items", () => {
      const buttons: ButtonConfig[] = [
        { command: "cmd1", id: "cmd-1", name: "Command 1" },
        { group: [{ command: "sub", id: "sub-1", name: "Sub" }], id: "group-1", name: "Group" },
        { command: "cmd2", id: "cmd-2", name: "Command 2" },
      ];

      const items = createTreeItems(buttons);

      expect(items).toHaveLength(3);
      expect(items[0]).toBeInstanceOf(CommandTreeItem);
      expect(items[1]).toBeInstanceOf(GroupTreeItem);
      expect(items[2]).toBeInstanceOf(CommandTreeItem);
    });

    it("should pass parent path to each item", () => {
      const buttons: ButtonConfig[] = [{ command: "cmd", id: "test-cmd", name: "Test" }];

      const items = createTreeItems(buttons, "Parent");

      expect(items).toHaveLength(1);
      if (items[0] instanceof CommandTreeItem) {
        expect(items[0].buttonName).toBe("Parent>Test[0]");
      }
    });

    it("should handle empty array", () => {
      const items = createTreeItems([]);

      expect(items).toHaveLength(0);
    });
  });
});
