import { describe, it, expect } from "@jest/globals";
import { isCommandButton, isGroupButton, ButtonConfig, CommandButton, GroupButton } from "./types";

describe("type guards", () => {
  describe("isCommandButton", () => {
    it("should return true for command button", () => {
      const button: ButtonConfig = {
        command: "npm test",
        id: "1",
        name: "Test",
      };

      expect(isCommandButton(button)).toBe(true);
    });

    it("should return false for group button", () => {
      const button: ButtonConfig = {
        group: [{ command: "echo", id: "2", name: "Child" }],
        id: "1",
        name: "Group",
      };

      expect(isCommandButton(button)).toBe(false);
    });

    it("should return true for command button with optional properties", () => {
      const button: CommandButton = {
        color: "#fff",
        command: "npm test",
        id: "1",
        insertOnly: false,
        name: "Test",
        shortcut: "t",
        terminalName: "Test Terminal",
        useVsCodeApi: false,
      };

      expect(isCommandButton(button)).toBe(true);
    });
  });

  describe("isGroupButton", () => {
    it("should return true for group button", () => {
      const button: ButtonConfig = {
        group: [{ command: "echo", id: "2", name: "Child" }],
        id: "1",
        name: "Group",
      };

      expect(isGroupButton(button)).toBe(true);
    });

    it("should return false for command button", () => {
      const button: ButtonConfig = {
        command: "npm test",
        id: "1",
        name: "Test",
      };

      expect(isGroupButton(button)).toBe(false);
    });

    it("should return true for group button with nested groups", () => {
      const button: GroupButton = {
        group: [
          {
            group: [{ command: "echo", id: "3", name: "Grandchild" }],
            id: "2",
            name: "Child Group",
          },
        ],
        id: "1",
        name: "Parent",
      };

      expect(isGroupButton(button)).toBe(true);
    });

    it("should return true for group button with executeAll", () => {
      const button: GroupButton = {
        executeAll: true,
        group: [{ command: "echo", id: "2", name: "Child" }],
        id: "1",
        name: "Group",
      };

      expect(isGroupButton(button)).toBe(true);
    });
  });

  describe("type narrowing", () => {
    it("should narrow to CommandButton when isCommandButton returns true", () => {
      const button: ButtonConfig = {
        command: "npm test",
        id: "1",
        name: "Test",
      };

      if (isCommandButton(button)) {
        // TypeScript should know this is CommandButton
        expect(button.command).toBe("npm test");
      } else {
        throw new Error("Should be command button");
      }
    });

    it("should narrow to GroupButton when isGroupButton returns true", () => {
      const button: ButtonConfig = {
        group: [{ command: "echo", id: "2", name: "Child" }],
        id: "1",
        name: "Group",
      };

      if (isGroupButton(button)) {
        // TypeScript should know this is GroupButton
        expect(button.group).toHaveLength(1);
      } else {
        throw new Error("Should be group button");
      }
    });
  });
});
