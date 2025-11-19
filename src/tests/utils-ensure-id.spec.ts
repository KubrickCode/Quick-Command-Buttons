import { ensureId, ensureIdsInArray } from "../internal/utils/ensure-id";
import { ButtonConfig } from "../pkg/types";

describe("ensureId", () => {
  describe("ensureId", () => {
    it("should add ID to ButtonConfig without ID", () => {
      const config = {
        name: "Test Button",
        command: "echo test",
      } as ButtonConfig;

      const result = ensureId(config);

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("string");
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it("should preserve existing ID", () => {
      const existingId = "existing-id-123";
      const config: ButtonConfig = {
        name: "Test Button",
        command: "echo test",
        id: existingId,
      };

      const result = ensureId(config);

      expect(result.id).toBe(existingId);
    });

    it("should preserve all other properties", () => {
      const config = {
        name: "Test Button",
        command: "echo test",
        color: "#FF0000",
        shortcut: "ctrl+t",
        terminalName: "TestTerminal",
        useVsCodeApi: true,
        executeAll: false,
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
        name: "Parent Group",
        group: [
          { name: "Child 1", command: "echo 1" },
          { name: "Child 2", command: "echo 2" },
        ],
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
        name: "Level 1",
        group: [
          {
            name: "Level 2",
            group: [
              {
                name: "Level 3",
                command: "echo deep",
              },
            ],
          },
        ],
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
        name: "Parent",
        id: parentId,
        group: [
          {
            name: "Child",
            id: childId,
            command: "echo test",
          },
        ],
      };

      const result = ensureId(config);

      expect(result.id).toBe(parentId);
      expect(result.group![0].id).toBe(childId);
    });

    it("should handle empty group array", () => {
      const config = {
        name: "Empty Group",
        group: [] as ButtonConfig[],
      } as ButtonConfig;

      const result = ensureId(config);

      expect(result.id).toBeDefined();
      expect(result.group).toEqual([]);
    });

    it("should generate unique IDs for multiple calls", () => {
      const config = {
        name: "Test Button",
        command: "echo test",
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
        { name: "Button 1", command: "echo 1" },
        { name: "Button 2", command: "echo 2" },
        { name: "Button 3", command: "echo 3" },
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
        { name: "Button 1", command: "echo 1", id: id1 },
        { name: "Button 2", command: "echo 2", id: id2 },
      ];

      const result = ensureIdsInArray(configs);

      expect(result[0].id).toBe(id1);
      expect(result[1].id).toBe(id2);
    });

    it("should handle mixed configs with and without IDs", () => {
      const existingId = "existing-id";
      const configs = [
        { name: "Button 1", command: "echo 1", id: existingId },
        { name: "Button 2", command: "echo 2" },
      ] as ButtonConfig[];

      const result = ensureIdsInArray(configs);

      expect(result[0].id).toBe(existingId);
      expect(result[1].id).toBeDefined();
      expect(result[1].id).not.toBe(existingId);
    });

    it("should recursively process nested groups in array", () => {
      const configs = [
        {
          name: "Group 1",
          group: [{ name: "Child 1", command: "echo 1" }],
        },
        {
          name: "Group 2",
          group: [{ name: "Child 2", command: "echo 2" }],
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
