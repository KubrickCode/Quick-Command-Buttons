import { validateShortcuts, findShortcutItem } from "./command-executor";
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
});
