import { createQuickPickItemsFromButtons } from "./show-all-commands";
import { ButtonConfig } from "./types";

describe("show-all-commands", () => {
  describe("createQuickPickItemsFromButtons", () => {
    it("should create QuickPickItems with shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Test Command 1",
          command: "echo test1",
          shortcut: "1",
        },
        {
          name: "Test Command 2",
          command: "echo test2",
          shortcut: "2",
        },
      ];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        label: "Test Command 1 (1)",
        description: "echo test1",
        command: buttons[0],
      });
      expect(result[1]).toEqual({
        label: "Test Command 2 (2)",
        description: "echo test2",
        command: buttons[1],
      });
    });

    it("should create QuickPickItems without shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Test Command 1",
          command: "echo test1",
        },
        {
          name: "Test Command 2",
          command: "echo test2",
        },
      ];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        label: "Test Command 1",
        description: "echo test1",
        command: buttons[0],
      });
      expect(result[1]).toEqual({
        label: "Test Command 2",
        description: "echo test2",
        command: buttons[1],
      });
    });

    it("should handle group buttons", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Test Group",
          group: [
            {
              name: "Nested Command 1",
              command: "echo nested1",
            },
            {
              name: "Nested Command 2",
              command: "echo nested2",
            },
          ],
        },
      ];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        label: "Test Group",
        description: "2 commands",
        command: buttons[0],
      });
    });

    it("should handle group buttons with shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Test Group",
          shortcut: "g",
          group: [
            {
              name: "Nested Command",
              command: "echo nested",
            },
          ],
        },
      ];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        label: "Test Group (g)",
        description: "1 commands",
        command: buttons[0],
      });
    });

    it("should handle buttons with no command", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Test Button",
        },
      ];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        label: "Test Button",
        description: "",
        command: buttons[0],
      });
    });

    it("should handle empty array", () => {
      const buttons: ButtonConfig[] = [];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should preserve object references", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Test Command",
          command: "echo test",
        },
      ];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result[0].command).toBe(buttons[0]);
    });

    it("should handle mixed configurations", () => {
      const buttons: ButtonConfig[] = [
        {
          name: "Command Button",
          command: "echo command",
          shortcut: "c",
        },
        {
          name: "Group Button",
          group: [
            {
              name: "Nested",
              command: "echo nested",
            },
          ],
        },
        {
          name: "Empty Button",
        },
      ];

      const result = createQuickPickItemsFromButtons(buttons);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        label: "Command Button (c)",
        description: "echo command",
        command: buttons[0],
      });
      expect(result[1]).toEqual({
        label: "Group Button",
        description: "1 commands",
        command: buttons[1],
      });
      expect(result[2]).toEqual({
        label: "Empty Button",
        description: "",
        command: buttons[2],
      });
    });
  });
});
