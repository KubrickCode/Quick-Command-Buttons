import { ButtonConfig } from "../pkg/types";
import {
  createQuickPickWithShortcuts,
  determineButtonExecutionType,
  executeCommandsRecursively,
  executeTerminalCommand,
  findShortcutItem,
  SHORTCUT_DEBOUNCE_MS,
  validateShortcuts,
} from "./command-executor";
import { createQuickPickItems, QuickPickItem } from "./utils/ui-items";

const createMockQuickPick = () => {
  const handlers = {
    accept: (() => {}) as () => void,
    changeValue: ((_value: string) => {}) as (value: string) => void,
    hide: (() => {}) as () => void,
  };
  return {
    dispose: jest.fn(),
    handlers,
    items: [] as QuickPickItem[],
    onDidAccept: jest.fn((handler: () => void) => {
      handlers.accept = handler;
    }),
    onDidChangeValue: jest.fn((handler: (value: string) => void) => {
      handlers.changeValue = handler;
    }),
    onDidHide: jest.fn((handler: () => void) => {
      handlers.hide = handler;
    }),
    placeholder: "",
    selectedItems: [] as QuickPickItem[],
    show: jest.fn(),
    title: "",
  };
};

describe("command-executor", () => {
  describe("validateShortcuts", () => {
    it("should return empty array for unique shortcuts", () => {
      const items = [
        {
          command: { id: "test-1", name: "test1", shortcut: "a" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { id: "test-2", name: "test2", shortcut: "b" } as ButtonConfig,
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
          command: { id: "test-1", name: "test1", shortcut: "a" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { id: "test-2", name: "test2", shortcut: "A" } as ButtonConfig,
          description: "",
          label: "Test 2",
        },
        {
          command: { id: "test-3", name: "test3", shortcut: "b" } as ButtonConfig,
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
          command: { id: "test-1", name: "test1", shortcut: "a" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { id: "test-2", name: "test2", shortcut: "A" } as ButtonConfig,
          description: "",
          label: "Test 2",
        },
        {
          command: { id: "test-3", name: "test3", shortcut: "b" } as ButtonConfig,
          description: "",
          label: "Test 3",
        },
        {
          command: { id: "test-4", name: "test4", shortcut: "B" } as ButtonConfig,
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
          command: { id: "test-1", name: "test1" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { id: "test-2", name: "test2", shortcut: "a" } as ButtonConfig,
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
          command: { id: "test-1", name: "test1" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
        {
          command: { id: "test-2", name: "test2" } as ButtonConfig,
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
        command: { id: "test-1", name: "test1", shortcut: "a" } as ButtonConfig,
        description: "",
        label: "Test 1",
      },
      {
        command: { id: "test-2", name: "test2", shortcut: "B" } as ButtonConfig,
        description: "",
        label: "Test 2",
      },
      {
        command: { id: "test-3", name: "test3" } as ButtonConfig,
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
          command: { id: "test-1", name: "test1" } as ButtonConfig,
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

    it("should find item with Korean character matching English shortcut", () => {
      const result = findShortcutItem(items, "ㅁ");

      expect(result).toEqual(items[0]);
    });

    it("should find item with Korean character ㅠ matching English shortcut b", () => {
      const result = findShortcutItem(items, "ㅠ");

      expect(result).toEqual(items[1]);
    });

    it("should find item with Russian character matching English shortcut", () => {
      const result = findShortcutItem(items, "ф");

      expect(result).toEqual(items[0]);
    });

    it("should handle Arabic characters", () => {
      const arabicItems = [
        {
          command: { id: "test-arabic", name: "test1", shortcut: "z" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
      ];
      const result = findShortcutItem(arabicItems, "ض");

      expect(result).toEqual(arabicItems[0]);
    });

    it("should handle Hebrew characters", () => {
      const hebrewItems = [
        {
          command: { id: "test-hebrew", name: "test1", shortcut: "e" } as ButtonConfig,
          description: "",
          label: "Test 1",
        },
      ];
      const result = findShortcutItem(hebrewItems, "ק");

      expect(result).toEqual(hebrewItems[0]);
    });
  });

  describe("determineButtonExecutionType", () => {
    it("should return 'executeAll' for button with group and executeAll flag", () => {
      const button: ButtonConfig = {
        executeAll: true,
        group: [{ command: "echo test", id: "child-1", name: "child" }],
        id: "test-group",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("executeAll");
    });

    it("should return 'showQuickPick' for button with group but no executeAll flag", () => {
      const button: ButtonConfig = {
        group: [{ command: "echo test", id: "child-1", name: "child" }],
        id: "test-group",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("showQuickPick");
    });

    it("should return 'showQuickPick' for button with group and executeAll set to false", () => {
      const button: ButtonConfig = {
        executeAll: false,
        group: [{ command: "echo test", id: "child-1", name: "child" }],
        id: "test-group",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("showQuickPick");
    });

    it("should return 'executeCommand' for button with command but no group", () => {
      const button: ButtonConfig = {
        command: "echo test",
        id: "test-command",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("executeCommand");
    });

    it("should return 'invalid' for button without command and without group", () => {
      const button: ButtonConfig = {
        id: "test-invalid",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("invalid");
    });

    it("should return 'invalid' for button with empty command string", () => {
      const button: ButtonConfig = {
        command: "",
        id: "test-empty",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("invalid");
    });

    it("should return 'executeCommand' for button with both command and group (group takes precedence when executeAll is false)", () => {
      const button: ButtonConfig = {
        command: "echo test",
        executeAll: false,
        group: [{ command: "echo child", id: "child-1", name: "child" }],
        id: "test-mixed",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("showQuickPick");
    });

    it("should return 'executeAll' for button with both command and group when executeAll is true", () => {
      const button: ButtonConfig = {
        command: "echo test",
        executeAll: true,
        group: [{ command: "echo child", id: "child-1", name: "child" }],
        id: "test-executeall",
        name: "test",
      };

      const result = determineButtonExecutionType(button);

      expect(result).toBe("executeAll");
    });
  });

  describe("createQuickPickItems", () => {
    it("should create QuickPickItem with shortcut in label", () => {
      const commands: ButtonConfig[] = [
        {
          command: "echo test",
          id: "test-shortcut",
          name: "Test Command",
          shortcut: "t",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          command: commands[0],
          description: "echo test",
          label: "Test Command (t)",
        },
      ]);
    });

    it("should create QuickPickItem without shortcut in label", () => {
      const commands: ButtonConfig[] = [
        {
          command: "echo test",
          id: "test-no-shortcut",
          name: "Test Command",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          command: commands[0],
          description: "echo test",
          label: "Test Command",
        },
      ]);
    });

    it("should handle empty command string", () => {
      const commands: ButtonConfig[] = [
        {
          command: "",
          id: "test-empty-cmd",
          name: "Test Command",
          shortcut: "t",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          command: commands[0],
          description: "",
          label: "Test Command (t)",
        },
      ]);
    });

    it("should handle command without command property", () => {
      const commands: ButtonConfig[] = [
        {
          id: "test-no-cmd-prop",
          name: "Test Command",
          shortcut: "t",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          command: commands[0],
          description: "",
          label: "Test Command (t)",
        },
      ]);
    });

    it("should handle multiple commands with mixed configurations", () => {
      const commands: ButtonConfig[] = [
        {
          command: "echo 1",
          id: "cmd-1",
          name: "Command 1",
          shortcut: "1",
        },
        {
          command: "echo 2",
          id: "cmd-2",
          name: "Command 2",
        },
        {
          id: "cmd-3",
          name: "Command 3",
          shortcut: "3",
        },
      ];

      const result = createQuickPickItems(commands);

      expect(result).toEqual([
        {
          command: commands[0],
          description: "echo 1",
          label: "Command 1 (1)",
        },
        {
          command: commands[1],
          description: "echo 2",
          label: "Command 2",
        },
        {
          command: commands[2],
          description: "",
          label: "Command 3 (3)",
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
          additionalProperty: "custom",
          command: "echo test",
          id: "test-preserve",
          name: "Test Command",
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
        command: "echo test",
        id: "test-terminal-1",
        name: "Test Button",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo test",
        false,
        undefined,
        "Test Button",
        expect.objectContaining({
          command: "echo test",
          id: "test-terminal-1",
          name: "Test Button",
        })
      );
    });

    it("should call terminalExecutor with useVsCodeApi true", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        command: "echo test",
        id: "test-vscode-api",
        name: "Test Button",
        useVsCodeApi: true,
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo test",
        true,
        undefined,
        "Test Button",
        expect.objectContaining({
          command: "echo test",
          id: "test-vscode-api",
          name: "Test Button",
          useVsCodeApi: true,
        })
      );
    });

    it("should call terminalExecutor with custom terminal name", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        command: "echo test",
        id: "test-terminal-name",
        name: "Test Button",
        terminalName: "Custom Terminal",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo test",
        false,
        "Custom Terminal",
        "Test Button",
        expect.objectContaining({
          command: "echo test",
          id: "test-terminal-name",
          name: "Test Button",
          terminalName: "Custom Terminal",
        })
      );
    });

    it("should call terminalExecutor with all parameters", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        command: "echo test",
        id: "test-all-params",
        name: "Test Button",
        terminalName: "Custom Terminal",
        useVsCodeApi: true,
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo test",
        true,
        "Custom Terminal",
        "Test Button",
        expect.objectContaining({
          command: "echo test",
          id: "test-all-params",
          name: "Test Button",
          terminalName: "Custom Terminal",
          useVsCodeApi: true,
        })
      );
    });

    it("should not call terminalExecutor when command is undefined", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        id: "test-no-command",
        name: "Test Button",
      };

      executeTerminalCommand(button, mockTerminalExecutor);

      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should not call terminalExecutor when command is empty string", () => {
      const mockTerminalExecutor = jest.fn();
      const button: ButtonConfig = {
        command: "",
        id: "test-empty-command",
        name: "Test Button",
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
          command: "echo test1",
          id: "rec-cmd-1",
          name: "Command 1",
        },
        {
          command: "echo test2",
          id: "rec-cmd-2",
          name: "Command 2",
          useVsCodeApi: true,
        },
        {
          command: "echo test3",
          id: "rec-cmd-3",
          name: "Command 3",
          terminalName: "Custom Terminal",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(3);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        1,
        "echo test1",
        false,
        undefined,
        "Command 1[0]",
        expect.anything()
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        2,
        "echo test2",
        true,
        undefined,
        "Command 2[1]",
        expect.anything()
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        3,
        "echo test3",
        false,
        "Custom Terminal",
        "Command 3[2]",
        expect.anything()
      );
    });

    it("should recursively execute commands for buttons with groups and executeAll flag", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          executeAll: true,
          group: [
            {
              command: "echo child1",
              id: "child-1",
              name: "Child 1",
            },
            {
              command: "echo child2",
              id: "child-2",
              name: "Child 2",
              useVsCodeApi: true,
            },
          ],
          id: "group-cmd",
          name: "Group Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(2);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        1,
        "echo child1",
        false,
        undefined,
        "Group Command[0]>Child 1[0]",
        expect.anything()
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        2,
        "echo child2",
        true,
        undefined,
        "Group Command[0]>Child 2[1]",
        expect.anything()
      );
    });

    it("should not execute commands for buttons with groups but no executeAll flag", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          executeAll: false,
          group: [
            {
              command: "echo child1",
              id: "child-1",
              name: "Child 1",
            },
          ],
          id: "group-no-exec",
          name: "Group Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should handle nested groups with executeAll flags", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          executeAll: true,
          group: [
            {
              executeAll: true,
              group: [
                {
                  command: "echo level3",
                  id: "level-3",
                  name: "Level 3 Command",
                },
              ],
              id: "level-2-group",
              name: "Level 2 Group",
            },
            {
              command: "echo level2",
              id: "level-2-cmd",
              name: "Level 2 Command",
            },
          ],
          id: "level-1-group",
          name: "Level 1 Group",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(2);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        1,
        "echo level3",
        false,
        undefined,
        "Level 1 Group[0]>Level 2 Group[0]>Level 3 Command[0]",
        expect.anything()
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        2,
        "echo level2",
        false,
        undefined,
        "Level 1 Group[0]>Level 2 Command[1]",
        expect.anything()
      );
    });

    it("should skip buttons without commands and without groups", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          command: "echo valid",
          id: "valid-cmd",
          name: "Valid Command",
        },
        {
          id: "invalid-cmd",
          name: "Invalid Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(1);
      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo valid",
        false,
        undefined,
        "Valid Command[0]",
        expect.anything()
      );
    });

    it("should skip buttons with empty command strings", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          command: "echo valid",
          id: "valid-cmd",
          name: "Valid Command",
        },
        {
          command: "",
          id: "empty-cmd",
          name: "Empty Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(1);
      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo valid",
        false,
        undefined,
        "Valid Command[0]",
        expect.anything()
      );
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
          command: "echo regular",
          id: "regular-cmd",
          name: "Regular Command",
        },
        {
          executeAll: true,
          group: [
            {
              command: "echo child",
              id: "child-cmd",
              name: "Child Command",
            },
          ],
          id: "group-with-exec",
          name: "Group with executeAll",
        },
        {
          executeAll: false,
          group: [
            {
              command: "echo ignored",
              id: "ignored-child",
              name: "Ignored Child",
            },
          ],
          id: "group-without-exec",
          name: "Group without executeAll",
        },
        {
          id: "invalid-cmd",
          name: "Invalid Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(2);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        1,
        "echo regular",
        false,
        undefined,
        "Regular Command[0]",
        expect.anything()
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        2,
        "echo child",
        false,
        undefined,
        "Group with executeAll[1]>Child Command[0]",
        expect.anything()
      );
    });

    it("should handle complex nested structure with mixed executeAll flags", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          executeAll: true,
          group: [
            {
              executeAll: true,
              group: [
                {
                  command: "echo leaf1",
                  id: "leaf-1",
                  name: "Leaf 1",
                },
                {
                  command: "echo leaf2",
                  id: "leaf-2",
                  name: "Leaf 2",
                },
              ],
              id: "branch-1",
              name: "Branch 1",
            },
            {
              executeAll: false,
              group: [
                {
                  command: "echo ignored",
                  id: "ignored-leaf",
                  name: "Ignored Leaf",
                },
              ],
              id: "branch-2",
              name: "Branch 2",
            },
            {
              command: "echo direct",
              id: "direct-cmd",
              name: "Direct Command",
            },
          ],
          id: "root-group",
          name: "Root Group",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(3);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        1,
        "echo leaf1",
        false,
        undefined,
        "Root Group[0]>Branch 1[0]>Leaf 1[0]",
        expect.anything()
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        2,
        "echo leaf2",
        false,
        undefined,
        "Root Group[0]>Branch 1[0]>Leaf 2[1]",
        expect.anything()
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        3,
        "echo direct",
        false,
        undefined,
        "Root Group[0]>Direct Command[2]",
        expect.anything()
      );
    });

    it("should pass buttonRef as 5th parameter to terminalExecutor", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          command: "echo test",
          id: "test-cmd",
          insertOnly: true,
          name: "Test Command",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo test",
        false,
        undefined,
        "Test Command[0]",
        expect.objectContaining({ insertOnly: true })
      );
    });

    it("should pass insertOnly flag through buttonRef in nested groups", () => {
      const mockTerminalExecutor = jest.fn();
      const commands: ButtonConfig[] = [
        {
          executeAll: true,
          group: [
            {
              command: "docker exec -it container bash",
              id: "docker-cmd",
              insertOnly: true,
              name: "Docker Shell",
            },
            {
              command: "git status",
              id: "git-cmd",
              insertOnly: false,
              name: "Git Status",
            },
          ],
          id: "group-cmd",
          name: "Dev Tools",
        },
      ];

      executeCommandsRecursively(commands, mockTerminalExecutor);

      expect(mockTerminalExecutor).toHaveBeenCalledTimes(2);
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        1,
        "docker exec -it container bash",
        false,
        undefined,
        "Dev Tools[0]>Docker Shell[0]",
        expect.objectContaining({ insertOnly: true })
      );
      expect(mockTerminalExecutor).toHaveBeenNthCalledWith(
        2,
        "git status",
        false,
        undefined,
        "Dev Tools[0]>Git Status[1]",
        expect.objectContaining({ insertOnly: false })
      );
    });
  });

  describe("createQuickPickWithShortcuts", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const createTestItems = (): QuickPickItem[] => [
      {
        command: { command: "echo test", id: "test-1", name: "Test 1", shortcut: "a" } as ButtonConfig,
        description: "echo test",
        label: "Test 1 (a)",
      },
      {
        command: { command: "echo test2", id: "test-2", name: "Test 2", shortcut: "b" } as ButtonConfig,
        description: "echo test2",
        label: "Test 2 (b)",
      },
    ];

    it("should not execute shortcut immediately on input (debounce)", () => {
      const mockQuickPick = createMockQuickPick();
      const mockTerminalExecutor = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockQuickPickCreator = jest.fn(() => mockQuickPick) as any;
      const items = createTestItems();

      createQuickPickWithShortcuts(
        { items, placeholder: "Select", title: "Test" },
        mockTerminalExecutor,
        mockQuickPickCreator
      );

      mockQuickPick.handlers.changeValue("a");

      expect(mockQuickPick.dispose).not.toHaveBeenCalled();
      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should execute shortcut after debounce delay (200ms)", () => {
      const mockQuickPick = createMockQuickPick();
      const mockTerminalExecutor = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockQuickPickCreator = jest.fn(() => mockQuickPick) as any;
      const items = createTestItems();

      createQuickPickWithShortcuts(
        { items, placeholder: "Select", title: "Test" },
        mockTerminalExecutor,
        mockQuickPickCreator
      );

      mockQuickPick.handlers.changeValue("a");
      jest.advanceTimersByTime(SHORTCUT_DEBOUNCE_MS);

      expect(mockQuickPick.dispose).toHaveBeenCalled();
      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo test",
        false,
        undefined,
        "Test 1",
        expect.objectContaining({ shortcut: "a" })
      );
    });

    it("should cancel debounce on rapid consecutive input (search intent)", () => {
      const mockQuickPick = createMockQuickPick();
      const mockTerminalExecutor = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockQuickPickCreator = jest.fn(() => mockQuickPick) as any;
      const items = createTestItems();

      createQuickPickWithShortcuts(
        { items, placeholder: "Select", title: "Test" },
        mockTerminalExecutor,
        mockQuickPickCreator
      );

      mockQuickPick.handlers.changeValue("a");
      jest.advanceTimersByTime(SHORTCUT_DEBOUNCE_MS / 2);
      mockQuickPick.handlers.changeValue("ab");
      jest.advanceTimersByTime(SHORTCUT_DEBOUNCE_MS);

      expect(mockQuickPick.dispose).not.toHaveBeenCalled();
      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should cancel debounce when onDidAccept is triggered", () => {
      const mockQuickPick = createMockQuickPick();
      const mockTerminalExecutor = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockQuickPickCreator = jest.fn(() => mockQuickPick) as any;
      const items = createTestItems();

      createQuickPickWithShortcuts(
        { items, placeholder: "Select", title: "Test" },
        mockTerminalExecutor,
        mockQuickPickCreator
      );

      mockQuickPick.handlers.changeValue("a");
      mockQuickPick.selectedItems = [items[1]];
      mockQuickPick.handlers.accept();

      jest.advanceTimersByTime(SHORTCUT_DEBOUNCE_MS);

      expect(mockQuickPick.dispose).toHaveBeenCalledTimes(1);
      expect(mockTerminalExecutor).toHaveBeenCalledWith(
        "echo test2",
        false,
        undefined,
        "Test 2",
        expect.objectContaining({ shortcut: "b" })
      );
    });

    it("should cancel debounce when onDidHide is triggered (cleanup)", () => {
      const mockQuickPick = createMockQuickPick();
      const mockTerminalExecutor = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockQuickPickCreator = jest.fn(() => mockQuickPick) as any;
      const items = createTestItems();

      createQuickPickWithShortcuts(
        { items, placeholder: "Select", title: "Test" },
        mockTerminalExecutor,
        mockQuickPickCreator
      );

      mockQuickPick.handlers.changeValue("a");
      mockQuickPick.handlers.hide();
      jest.advanceTimersByTime(SHORTCUT_DEBOUNCE_MS);

      expect(mockQuickPick.dispose).not.toHaveBeenCalled();
      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });

    it("should not execute shortcut for multi-character input even after debounce", () => {
      const mockQuickPick = createMockQuickPick();
      const mockTerminalExecutor = jest.fn();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mockQuickPickCreator = jest.fn(() => mockQuickPick) as any;
      const items = createTestItems();

      createQuickPickWithShortcuts(
        { items, placeholder: "Select", title: "Test" },
        mockTerminalExecutor,
        mockQuickPickCreator
      );

      mockQuickPick.handlers.changeValue("abc");
      jest.advanceTimersByTime(SHORTCUT_DEBOUNCE_MS);

      expect(mockQuickPick.dispose).not.toHaveBeenCalled();
      expect(mockTerminalExecutor).not.toHaveBeenCalled();
    });
  });
});
