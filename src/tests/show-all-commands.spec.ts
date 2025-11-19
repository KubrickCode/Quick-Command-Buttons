import { createQuickPickItems } from "../internal/utils/ui-items";
import { ButtonConfig } from "../pkg/types";

describe("show-all-commands", () => {
  describe("createQuickPickItems with includeCommandCount", () => {
    it("should create QuickPickItems with shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "test-cmd-1",
          command: "echo test1",
          name: "Test Command 1",
          shortcut: "1",
        },
        {
          id: "test-cmd-2",
          command: "echo test2",
          name: "Test Command 2",
          shortcut: "2",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "echo test1",
        label: "Test Command 1 (1)",
      });
      expect(result[1]).toEqual({
        command: buttons[1],
        description: "echo test2",
        label: "Test Command 2 (2)",
      });
    });

    it("should create QuickPickItems without shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "test-cmd-1",
          command: "echo test1",
          name: "Test Command 1",
        },
        {
          id: "test-cmd-2",
          command: "echo test2",
          name: "Test Command 2",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "echo test1",
        label: "Test Command 1",
      });
      expect(result[1]).toEqual({
        command: buttons[1],
        description: "echo test2",
        label: "Test Command 2",
      });
    });

    it("should handle group buttons", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "test-group",
          group: [
            {
              id: "nested-cmd-1",
              command: "echo nested1",
              name: "Nested Command 1",
            },
            {
              id: "nested-cmd-2",
              command: "echo nested2",
              name: "Nested Command 2",
            },
          ],
          name: "Test Group",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "2 commands",
        label: "Test Group",
      });
    });

    it("should handle group buttons with shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "test-group",
          group: [
            {
              id: "nested-cmd",
              command: "echo nested",
              name: "Nested Command",
            },
          ],
          name: "Test Group",
          shortcut: "g",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "1 commands",
        label: "Test Group (g)",
      });
    });

    it("should handle buttons with no command", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "test-btn",
          name: "Test Button",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "",
        label: "Test Button",
      });
    });

    it("should handle empty array", () => {
      const buttons: ButtonConfig[] = [];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should preserve object references", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "test-preserve",
          command: "echo test",
          name: "Test Command",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result[0].command).toBe(buttons[0]);
    });

    it("should handle mixed configurations", () => {
      const buttons: ButtonConfig[] = [
        {
          id: "cmd-btn",
          command: "echo command",
          name: "Command Button",
          shortcut: "c",
        },
        {
          id: "group-btn",
          group: [
            {
              id: "nested-cmd",
              command: "echo nested",
              name: "Nested",
            },
          ],
          name: "Group Button",
        },
        {
          id: "empty-btn",
          name: "Empty Button",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "echo command",
        label: "Command Button (c)",
      });
      expect(result[1]).toEqual({
        command: buttons[1],
        description: "1 commands",
        label: "Group Button",
      });
      expect(result[2]).toEqual({
        command: buttons[2],
        description: "",
        label: "Empty Button",
      });
    });
  });
});
