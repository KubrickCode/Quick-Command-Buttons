import { ButtonConfig } from "../../pkg/types";
import { ensureId, ensureIdsInArray, stripId, stripIdsInArray } from "./ensure-id";

describe("ensureId", () => {
  describe("ensureId", () => {
    it("should add ID to ButtonConfig without ID", () => {
      const config = {
        command: "echo test",
        name: "Test Button",
      } as ButtonConfig;

      const result = ensureId(config);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("should preserve existing ID", () => {
      const existingId = "existing-id-123";
      const config: ButtonConfig = {
        command: "echo test",
        id: existingId,
        name: "Test Button",
      };

      const result = ensureId(config);

      expect(result.id).toBe(existingId);
    });

    it("should preserve all other properties", () => {
      const config = {
        color: "#FF0000",
        command: "echo test",
        executeAll: false,
        name: "Test Button",
        shortcut: "ctrl+t",
        terminalName: "TestTerminal",
        useVsCodeApi: true,
      } as ButtonConfig;

      const result = ensureId(config);

      expect(result.name).toBe(config.name);
      expect(result.command).toBe(config.command);
      expect(result.color).toBe(config.color);
      expect(result.shortcut).toBe(config.shortcut);
      expect(result.terminalName).toBe(config.terminalName);
      expect(result.useVsCodeApi).toBe(config.useVsCodeApi);
      expect(result.executeAll).toBe(config.executeAll);
    });

    it("should recursively add IDs to group items", () => {
      const config = {
        group: [
          { command: "echo 1", name: "Child 1" },
          { command: "echo 2", name: "Child 2" },
        ],
        name: "Parent Group",
      } as ButtonConfig;

      const result = ensureId(config);

      expect(result.id).toBeDefined();
      expect(result.group).toBeDefined();
      expect(result.group![0].id).toBeDefined();
      expect(result.group![1].id).toBeDefined();
      expect(result.group![0].id).not.toBe(result.group![1].id);
    });

    it("should handle deeply nested groups", () => {
      const config = {
        group: [
          {
            group: [
              {
                command: "echo deep",
                name: "Level 3",
              },
            ],
            name: "Level 2",
          },
        ],
        name: "Level 1",
      } as ButtonConfig;

      const result = ensureId(config);

      expect(result.id).toBeDefined();
      expect(result.group![0].id).toBeDefined();
      expect(result.group![0].group![0].id).toBeDefined();
    });

    it("should preserve existing IDs in nested groups", () => {
      const parentId = "parent-id";
      const childId = "child-id";
      const config: ButtonConfig = {
        group: [
          {
            command: "echo test",
            id: childId,
            name: "Child",
          },
        ],
        id: parentId,
        name: "Parent",
      };

      const result = ensureId(config);

      expect(result.id).toBe(parentId);
      expect(result.group![0].id).toBe(childId);
    });

    it("should handle empty group array", () => {
      const config = {
        group: [] as ButtonConfig[],
        name: "Empty Group",
      } as ButtonConfig;

      const result = ensureId(config);

      expect(result.id).toBeDefined();
      expect(result.group).toEqual([]);
    });

    it("should generate unique IDs for multiple calls", () => {
      const config = {
        command: "echo test",
        name: "Test Button",
      } as ButtonConfig;

      const result1 = ensureId(config);
      const result2 = ensureId(config);

      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("ensureIdsInArray", () => {
    it("should add IDs to all configs in array", () => {
      const configs = [
        { command: "echo 1", name: "Button 1" },
        { command: "echo 2", name: "Button 2" },
        { command: "echo 3", name: "Button 3" },
      ] as ButtonConfig[];

      const result = ensureIdsInArray(configs);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[2].id).toBeDefined();
      expect(result[0].id).not.toBe(result[1].id);
      expect(result[1].id).not.toBe(result[2].id);
    });

    it("should handle empty array", () => {
      const configs: ButtonConfig[] = [];

      const result = ensureIdsInArray(configs);

      expect(result).toEqual([]);
    });

    it("should preserve existing IDs in array", () => {
      const id1 = "existing-1";
      const id2 = "existing-2";
      const configs: ButtonConfig[] = [
        { command: "echo 1", id: id1, name: "Button 1" },
        { command: "echo 2", id: id2, name: "Button 2" },
      ];

      const result = ensureIdsInArray(configs);

      expect(result[0].id).toBe(id1);
      expect(result[1].id).toBe(id2);
    });

    it("should handle mixed configs with and without IDs", () => {
      const existingId = "existing-id";
      const configs = [
        { command: "echo 1", id: existingId, name: "Button 1" },
        { command: "echo 2", name: "Button 2" },
      ] as ButtonConfig[];

      const result = ensureIdsInArray(configs);

      expect(result[0].id).toBe(existingId);
      expect(result[1].id).toBeDefined();
      expect(result[1].id).not.toBe(existingId);
    });

    it("should recursively process nested groups in array", () => {
      const configs = [
        {
          group: [{ command: "echo 1", name: "Child 1" }],
          name: "Group 1",
        },
        {
          group: [{ command: "echo 2", name: "Child 2" }],
          name: "Group 2",
        },
      ] as ButtonConfig[];

      const result = ensureIdsInArray(configs);

      expect(result[0].id).toBeDefined();
      expect(result[0].group![0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[1].group![0].id).toBeDefined();
    });
  });
});

describe("stripId", () => {
  describe("stripId", () => {
    it("should remove ID from ButtonConfig", () => {
      const config: ButtonConfig = {
        command: "echo test",
        id: "test-id-123",
        name: "Test Button",
      };

      const result = stripId(config);

      expect(result).not.toHaveProperty("id");
      expect(result.name).toBe("Test Button");
      expect(result.command).toBe("echo test");
    });

    it("should preserve all other properties", () => {
      const config: ButtonConfig = {
        color: "#FF0000",
        command: "echo test",
        executeAll: false,
        id: "test-id",
        name: "Test Button",
        shortcut: "ctrl+t",
        terminalName: "TestTerminal",
        useVsCodeApi: true,
      };

      const result = stripId(config);

      expect(result).not.toHaveProperty("id");
      expect(result.name).toBe(config.name);
      expect(result.command).toBe(config.command);
      expect(result.color).toBe(config.color);
      expect(result.shortcut).toBe(config.shortcut);
      expect(result.terminalName).toBe(config.terminalName);
      expect(result.useVsCodeApi).toBe(config.useVsCodeApi);
      expect(result.executeAll).toBe(config.executeAll);
    });

    it("should recursively remove IDs from group items", () => {
      const config: ButtonConfig = {
        group: [
          { command: "echo 1", id: "child-1", name: "Child 1" },
          { command: "echo 2", id: "child-2", name: "Child 2" },
        ],
        id: "parent-id",
        name: "Parent Group",
      };

      const result = stripId(config);

      expect(result).not.toHaveProperty("id");
      expect(result.group).toBeDefined();
      expect(result.group![0]).not.toHaveProperty("id");
      expect(result.group![1]).not.toHaveProperty("id");
      expect(result.group![0].name).toBe("Child 1");
      expect(result.group![1].name).toBe("Child 2");
    });

    it("should handle deeply nested groups", () => {
      const config: ButtonConfig = {
        group: [
          {
            group: [
              {
                command: "echo deep",
                id: "level-3",
                name: "Level 3",
              },
            ],
            id: "level-2",
            name: "Level 2",
          },
        ],
        id: "level-1",
        name: "Level 1",
      };

      const result = stripId(config);

      expect(result).not.toHaveProperty("id");
      expect(result.group![0]).not.toHaveProperty("id");
      expect(result.group![0].group![0]).not.toHaveProperty("id");
      expect(result.group![0].group![0].command).toBe("echo deep");
    });

    it("should handle empty group array", () => {
      const config: ButtonConfig = {
        group: [],
        id: "empty-group-id",
        name: "Empty Group",
      };

      const result = stripId(config);

      expect(result).not.toHaveProperty("id");
      expect(result.group).toEqual([]);
    });

    it("should handle config without group", () => {
      const config: ButtonConfig = {
        command: "echo test",
        id: "no-group-id",
        name: "No Group",
      };

      const result = stripId(config);

      expect(result).not.toHaveProperty("id");
      expect(result).not.toHaveProperty("group");
    });
  });

  describe("stripIdsInArray", () => {
    it("should remove IDs from all configs in array", () => {
      const configs: ButtonConfig[] = [
        { command: "echo 1", id: "id-1", name: "Button 1" },
        { command: "echo 2", id: "id-2", name: "Button 2" },
        { command: "echo 3", id: "id-3", name: "Button 3" },
      ];

      const result = stripIdsInArray(configs);

      expect(result).toHaveLength(3);
      expect(result[0]).not.toHaveProperty("id");
      expect(result[1]).not.toHaveProperty("id");
      expect(result[2]).not.toHaveProperty("id");
    });

    it("should handle empty array", () => {
      const configs: ButtonConfig[] = [];

      const result = stripIdsInArray(configs);

      expect(result).toEqual([]);
    });

    it("should recursively process nested groups in array", () => {
      const configs: ButtonConfig[] = [
        {
          group: [{ command: "echo 1", id: "child-1", name: "Child 1" }],
          id: "group-1",
          name: "Group 1",
        },
        {
          group: [{ command: "echo 2", id: "child-2", name: "Child 2" }],
          id: "group-2",
          name: "Group 2",
        },
      ];

      const result = stripIdsInArray(configs);

      expect(result[0]).not.toHaveProperty("id");
      expect(result[0].group![0]).not.toHaveProperty("id");
      expect(result[1]).not.toHaveProperty("id");
      expect(result[1].group![0]).not.toHaveProperty("id");
    });
  });
});
