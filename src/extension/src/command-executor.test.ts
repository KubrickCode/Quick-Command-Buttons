import { validateShortcuts, findShortcutItem, determineButtonExecutionType, createQuickPickItems, executeTerminalCommand, executeCommandsRecursively } from "./command-executor";
import { ButtonConfig } from "./types";

describe("command-executor", () => {
  describe("validateShortcuts", () => {
    it("should return empty array for unique shortcuts", () => {
      const items = [
        {
          command: { name: "test1", shortcut: "a" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { name: "test2", shortcut: "b" } as ButtonConfig,
          description: "",
          label: "Test 2",
        },
      ];

      const result = validateShortcuts(items);

      expect(result).toEqual([]);
    });

    it("should return duplicated shortcuts (case insensitive)", () => {
      const items = [
        {
          command: { name: "test1", shortcut: "a" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { name: "test2", shortcut: "A" } as ButtonConfig,
          description: "",
          label: "Test 2",
        },
        {
          command: { name: "test3", shortcut: "b" } as ButtonConfig,
          description: "",
          label: "Test 3",
        },
      ];

      const result = validateShortcuts(items);

      expect(result).toEqual(["a"]);
    });

    it("should return multiple duplicated shortcuts", () => {
      const items = [
        {
          command: { name: "test1", shortcut: "a" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { name: "test2", shortcut: "A" } as ButtonConfig,
          description: "",
          label: "Test 2",
        },
        {
          command: { name: "test3", shortcut: "b" } as ButtonConfig,
          description: "",
          label: "Test 3",
        },
        {
          command: { name: "test4", shortcut: "B" } as ButtonConfig,
          description: "",
          label: "Test 4",
        },
      ];

      const result = validateShortcuts(items);

      expect(result).toEqual(["a", "b"]);
    });

    it("should handle items without shortcuts", () => {
      const items = [
        {
          command: { name: "test1" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { name: "test2", shortcut: "a" } as ButtonConfig,
          description: "",
          label: "Test 2",
        },
      ];

      const result = validateShortcuts(items);

      expect(result).toEqual([]);
    });

    it("should handle empty array", () => {
      const items: Array<{
        command: ButtonConfig;
        description: string;
        label: string;
      }> = [];

      const result = validateShortcuts(items);

      expect(result).toEqual([]);
    });

    it("should handle all items without shortcuts", () => {
      const items = [
        {
          command: { name: "test1" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { name: "test2" } as ButtonConfig,
          description: "",
          label: "Test 2",
        },
      ];

      const result = validateShortcuts(items);

      expect(result).toEqual([]);
    });
  });

  describe("findShortcutItem", () => {
    const items = [
      {
        command: { name: "test1", shortcut: "a" } as ButtonConfig,
        description: "",
        label: "Test 1",
      },
      {
        command: { name: "test2", shortcut: "B" } as ButtonConfig,
        description: "",
        label: "Test 2",
      },
      {
        command: { name: "test3" } as ButtonConfig,
        description: "",
        label: "Test 3",
      },
    ];

    it("should find item with matching shortcut (case insensitive)", () => {
      const result = findShortcutItem(items, "a");

      expect(result).toEqual(items[0]);
    });

    it("should find item with uppercase shortcut using lowercase input", () => {
      const result = findShortcutItem(items, "b");

      expect(result).toEqual(items[1]);
    });

    it("should find item with lowercase shortcut using uppercase input", () => {
      const result = findShortcutItem(items, "A");

      expect(result).toEqual(items[0]);
    });

    it("should return undefined for non-existent shortcut", () => {
      const result = findShortcutItem(items, "z");

      expect(result).toBeUndefined();
    });

    it("should return undefined for multi-character input", () => {
      const result = findShortcutItem(items, "ab");

      expect(result).toBeUndefined();
    });

    it("should return undefined for empty input", () => {
      const result = findShortcutItem(items, "");

      expect(result).toBeUndefined();
    });

    it("should return undefined when no items have shortcuts", () => {
      const itemsWithoutShortcuts = [
        {
          command: { name: "test1" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
      ];

      const result = findShortcutItem(itemsWithoutShortcuts, "a");

      expect(result).toBeUndefined();
    });

    it("should return undefined for empty items array", () => {
      const result = findShortcutItem([], "a");

      expect(result).toBeUndefined();
    });
  });

  describe("determineButtonExecutionType", () => {
    it("should return 'executeAll' for button with group and executeAll flag", () => {
      const button: ButtonConfig = {
        name: "test",
        group: [{ name: "child", command: "echo test" }],
        executeAll: true,
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("executeAll");
    });

    it("should return 'showQuickPick' for button with group but no executeAll flag", () => {
      const button: ButtonConfig = {
        name: "test",
        group: [{ name: "child", command: "echo test" }],
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("showQuickPick");
    });

    it("should return 'showQuickPick' for button with group and executeAll set to false", () => {
      const button: ButtonConfig = {
        name: "test",
        group: [{ name: "child", command: "echo test" }],
        executeAll: false,
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("showQuickPick");
    });

    it("should return 'executeCommand' for button with command but no group", () => {
      const button: ButtonConfig = {
        name: "test",
        command: "echo test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("executeCommand");
    });

    it("should return 'invalid' for button without command and without group", () => {
      const button: ButtonConfig = {
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("invalid");
    });

    it("should return 'invalid' for button with empty command string", () => {
      const button: ButtonConfig = {
        name: "test",
        command: "",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("invalid");
    });

    it("should return 'executeCommand' for button with both command and group (group takes precedence when executeAll is false)", () => {
      const button: ButtonConfig = {
        name: "test",
        command: "echo test",
        group: [{ name: "child", command: "echo child" }],
        executeAll: false,
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("showQuickPick");
    });

    it("should return 'executeAll' for button with both command and group when executeAll is true", () => {
      const button: ButtonConfig = {
        name: "test",
        command: "echo test",
        group: [{ name: "child", command: "echo child" }],
        executeAll: true,
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("executeAll");
    });
  });

  describe("createQuickPickItems", () => {
    it("should create QuickPickItem with shortcut in label", () => {
      const commands: ButtonConfig[] = [
        {
          name: "Test Command",
          command: "echo test",
          shortcut: "t",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          label: "Test Command (t)",
          description: "echo test",
          command: commands[0],
        },
      ]);
    });

    it("should create QuickPickItem without shortcut in label", () => {
      const commands: ButtonConfig[] = [
        {
          name: "Test Command",
          command: "echo test",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          label: "Test Command",
          description: "echo test",
          command: commands[0],
        },
      ]);
    });

    it("should handle empty command string", () => {
      const commands: ButtonConfig[] = [
        {
          name: "Test Command",
          command: "",
          shortcut: "t",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          label: "Test Command (t)",
          description: "",
          command: commands[0],
        },
      ]);
    });

    it("should handle command without command property", () => {
      const commands: ButtonConfig[] = [
        {
          name: "Test Command",
          shortcut: "t",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          label: "Test Command (t)",
          description: "",
          command: commands[0],
        },
      ]);
    });

    it("should handle multiple commands with mixed configurations", () => {
      const commands: ButtonConfig[] = [
        {
          name: "Command 1",
          command: "echo 1",
          shortcut: "1",
        },
        {
          name: "Command 2",
          command: "echo 2",
        },
        {
          name: "Command 3",
          shortcut: "3",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          label: "Command 1 (1)",
          description: "echo 1",
          command: commands[0],
        },
        {
          label: "Command 2",
          description: "echo 2",
          command: commands[1],
        },
        {
          label: "Command 3 (3)",
          description: "",
          command: commands[2],
        },
      ]);
    });

    it("should handle empty commands array", () => {
      const commands: ButtonConfig[] = [];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([]);
    });

    it("should preserve original command object reference", () => {
      const commands: ButtonConfig[] = [
        {
          name: "Test Command",
          command: "echo test",
          additionalProperty: "custom",
        } as ButtonConfig & { additionalProperty: string },
      ];

      const result = createQuickPickItems(commands);

      expect(result[0].command).toBe(commands[0]);
    });
  });

  describe("executeTerminalCommand", () => {
    it("should call terminalExecutor with command and default parameters", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        name: "Test Button",
        command: "echo test",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith("echo test", false, undefined);
    });

    it("should call terminalExecutor with useVsCodeApi true", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        name: "Test Button",
        command: "echo test",
        useVsCodeApi: true,
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith("echo test", true, undefined);
    });

    it("should call terminalExecutor with custom terminal name", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        name: "Test Button",
        command: "echo test",
        terminalName: "Custom Terminal",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith("echo test", false, "Custom Terminal");
    });

    it("should call terminalExecutor with all parameters", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        name: "Test Button",
        command: "echo test",
        useVsCodeApi: true,
        terminalName: "Custom Terminal",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith("echo test", true, "Custom Terminal");
    });

    it("should not call terminalExecutor when command is undefined", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        name: "Test Button",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should not call terminalExecutor when command is empty string", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        name: "Test Button",
        command: "",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });
  });

  describe("executeCommandsRecursively", () => {
    it("should execute terminal commands for buttons without groups", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Command 1",
          command: "echo test1",
        },
        {
          name: "Command 2",
          command: "echo test2",
          useVsCodeApi: true,
        },
        {
          name: "Command 3",
          command: "echo test3",
          terminalName: "Custom Terminal",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(3);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(1, "echo test1", false, undefined);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(2, "echo test2", true, undefined);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(3, "echo test3", false, "Custom Terminal");
    });

    it("should recursively execute commands for buttons with groups and executeAll flag", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Group Command",
          group: [
            {
              name: "Child 1",
              command: "echo child1",
            },
            {
              name: "Child 2",
              command: "echo child2",
              useVsCodeApi: true,
            },
          ],
          executeAll: true,
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(2);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(1, "echo child1", false, undefined);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(2, "echo child2", true, undefined);
    });

    it("should not execute commands for buttons with groups but no executeAll flag", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Group Command",
          group: [
            {
              name: "Child 1",
              command: "echo child1",
            },
          ],
          executeAll: false,
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should handle nested groups with executeAll flags", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Level 1 Group",
          group: [
            {
              name: "Level 2 Group",
              group: [
                {
                  name: "Level 3 Command",
                  command: "echo level3",
                },
              ],
              executeAll: true,
            },
            {
              name: "Level 2 Command",
              command: "echo level2",
            },
          ],
          executeAll: true,
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(2);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(1, "echo level3", false, undefined);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(2, "echo level2", false, undefined);
    });

    it("should skip buttons without commands and without groups", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Valid Command",
          command: "echo valid",
        },
        {
          name: "Invalid Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(1);
      expect(mockTerminalExecutor).toHaveBeenCalledWith("echo valid", false, undefined);
    });

    it("should skip buttons with empty command strings", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Valid Command",
          command: "echo valid",
        },
        {
          name: "Empty Command",
          command: "",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(1);
      expect(mockTerminalExecutor).toHaveBeenCalledWith("echo valid", false, undefined);
    });

    it("should handle empty commands array", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should handle mixed command types in single array", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Regular Command",
          command: "echo regular",
        },
        {
          name: "Group with executeAll",
          group: [
            {
              name: "Child Command",
              command: "echo child",
            },
          ],
          executeAll: true,
        },
        {
          name: "Group without executeAll",
          group: [
            {
              name: "Ignored Child",
              command: "echo ignored",
            },
          ],
          executeAll: false,
        },
        {
          name: "Invalid Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(2);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(1, "echo regular", false, undefined);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(2, "echo child", false, undefined);
    });

    it("should handle complex nested structure with mixed executeAll flags", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          name: "Root Group",
          group: [
            {
              name: "Branch 1",
              group: [
                {
                  name: "Leaf 1",
                  command: "echo leaf1",
                },
                {
                  name: "Leaf 2",
                  command: "echo leaf2",
                },
              ],
              executeAll: true,
            },
            {
              name: "Branch 2",
              group: [
                {
                  name: "Ignored Leaf",
                  command: "echo ignored",
                },
              ],
              executeAll: false,
            },
            {
              name: "Direct Command",
              command: "echo direct",
            },
          ],
          executeAll: true,
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(3);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(1, "echo leaf1", false, undefined);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(2, "echo leaf2", false, undefined);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(3, "echo direct", false, undefined);
    });
  });
});
