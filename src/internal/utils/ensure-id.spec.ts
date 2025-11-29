import {
  ButtonConfig,
  ButtonConfigWithOptionalId,
  ButtonSet,
  ButtonSetWithoutId,
} from "../../pkg/types";
import {
  ensureId,
  ensureIdsInArray,
  ensureSetId,
  ensureSetIdsInArray,
  stripId,
  stripIdsInArray,
  stripSetId,
  stripSetIdsInArray,
  validateUniqueSetName,
} from "./ensure-id";

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

    it("should preserve all other properties for command button", () => {
      const config = {
        color: "#FF0000",
        command: "echo test",
        insertOnly: false,
        name: "Test Button",
        shortcut: "ctrl+t",
        terminalName: "TestTerminal",
        useVsCodeApi: true,
      } as ButtonConfigWithOptionalId;

      const result = ensureId(config);

      expect(result.name).toBe(config.name);
      expect((result as any).command).toBe(config.command);
      expect(result.color).toBe(config.color);
      expect(result.shortcut).toBe(config.shortcut);
      expect((result as any).terminalName).toBe((config as any).terminalName);
      expect((result as any).useVsCodeApi).toBe((config as any).useVsCodeApi);
      expect((result as any).insertOnly).toBe((config as any).insertOnly);
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

    it("should preserve all other properties for command button", () => {
      const config: ButtonConfig = {
        color: "#FF0000",
        command: "echo test",
        id: "test-id",
        insertOnly: false,
        name: "Test Button",
        shortcut: "ctrl+t",
        terminalName: "TestTerminal",
        useVsCodeApi: true,
      };

      const result = stripId(config);

      expect(result).not.toHaveProperty("id");
      expect(result.name).toBe(config.name);
      expect((result as any).command).toBe((config as any).command);
      expect(result.color).toBe(config.color);
      expect(result.shortcut).toBe(config.shortcut);
      expect((result as any).terminalName).toBe((config as any).terminalName);
      expect((result as any).useVsCodeApi).toBe((config as any).useVsCodeApi);
      expect((result as any).insertOnly).toBe((config as any).insertOnly);
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

describe("Button Set ID utilities", () => {
  describe("ensureSetId", () => {
    it("should add ID to ButtonSet without ID", () => {
      const set: ButtonSetWithoutId = {
        buttons: [],
        name: "Test Set",
      };

      const result = ensureSetId(set);

      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(result.name).toBe("Test Set");
    });

    it("should ensure IDs in button array", () => {
      const set: ButtonSetWithoutId = {
        buttons: [
          { command: "echo 1", name: "Button 1" },
          { command: "echo 2", name: "Button 2" },
        ],
        name: "Test Set",
      };

      const result = ensureSetId(set);

      expect(result.buttons[0].id).toBeDefined();
      expect(result.buttons[1].id).toBeDefined();
      expect(result.buttons[0].id).not.toBe(result.buttons[1].id);
    });

    it("should handle nested group buttons", () => {
      const set: ButtonSetWithoutId = {
        buttons: [
          {
            group: [{ command: "echo nested", name: "Nested" }],
            name: "Group",
          },
        ],
        name: "Test Set",
      };

      const result = ensureSetId(set);

      expect(result.buttons[0].id).toBeDefined();
      expect(result.buttons[0].group![0].id).toBeDefined();
    });

    it("should generate unique set IDs for multiple calls", () => {
      const set: ButtonSetWithoutId = { buttons: [], name: "Test" };

      const result1 = ensureSetId(set);
      const result2 = ensureSetId(set);

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("ensureSetIdsInArray", () => {
    it("should add IDs to all sets in array", () => {
      const sets: ButtonSetWithoutId[] = [
        { buttons: [], name: "Set 1" },
        { buttons: [], name: "Set 2" },
      ];

      const result = ensureSetIdsInArray(sets);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBeDefined();
      expect(result[1].id).toBeDefined();
      expect(result[0].id).not.toBe(result[1].id);
    });

    it("should handle empty array", () => {
      const sets: ButtonSetWithoutId[] = [];

      const result = ensureSetIdsInArray(sets);

      expect(result).toEqual([]);
    });
  });

  describe("stripSetId", () => {
    it("should remove ID from ButtonSet", () => {
      const set: ButtonSet = {
        buttons: [{ command: "echo test", id: "btn-1", name: "Button" }],
        id: "set-id-123",
        name: "Test Set",
      };

      const result = stripSetId(set);

      expect(result).not.toHaveProperty("id");
      expect(result.name).toBe("Test Set");
    });

    it("should strip IDs from buttons array", () => {
      const set: ButtonSet = {
        buttons: [
          { command: "echo 1", id: "btn-1", name: "Button 1" },
          { command: "echo 2", id: "btn-2", name: "Button 2" },
        ],
        id: "set-id",
        name: "Test Set",
      };

      const result = stripSetId(set);

      expect(result.buttons[0]).not.toHaveProperty("id");
      expect(result.buttons[1]).not.toHaveProperty("id");
    });

    it("should strip IDs from nested group buttons", () => {
      const set: ButtonSet = {
        buttons: [
          {
            group: [{ command: "echo nested", id: "nested-btn", name: "Nested" }],
            id: "group-btn",
            name: "Group",
          },
        ],
        id: "set-id",
        name: "Test Set",
      };

      const result = stripSetId(set);

      expect(result.buttons[0]).not.toHaveProperty("id");
      expect(result.buttons[0].group![0]).not.toHaveProperty("id");
    });
  });

  describe("stripSetIdsInArray", () => {
    it("should remove IDs from all sets in array", () => {
      const sets: ButtonSet[] = [
        { buttons: [], id: "id-1", name: "Set 1" },
        { buttons: [], id: "id-2", name: "Set 2" },
      ];

      const result = stripSetIdsInArray(sets);

      expect(result).toHaveLength(2);
      expect(result[0]).not.toHaveProperty("id");
      expect(result[1]).not.toHaveProperty("id");
    });

    it("should handle empty array", () => {
      const sets: ButtonSet[] = [];

      const result = stripSetIdsInArray(sets);

      expect(result).toEqual([]);
    });
  });
});

describe("validateUniqueSetName", () => {
  it("should return true for unique name", () => {
    const existingSets: ButtonSet[] = [
      { buttons: [], id: "1", name: "Frontend" },
      { buttons: [], id: "2", name: "Backend" },
    ];

    expect(validateUniqueSetName("DevOps", existingSets)).toBe(true);
  });

  it("should return false for existing name", () => {
    const existingSets: ButtonSet[] = [{ buttons: [], id: "1", name: "Frontend" }];

    expect(validateUniqueSetName("Frontend", existingSets)).toBe(false);
  });

  it("should be case-insensitive", () => {
    const existingSets: ButtonSet[] = [{ buttons: [], id: "1", name: "Frontend" }];

    expect(validateUniqueSetName("frontend", existingSets)).toBe(false);
    expect(validateUniqueSetName("FRONTEND", existingSets)).toBe(false);
    expect(validateUniqueSetName("FrontEnd", existingSets)).toBe(false);
  });

  it("should return true for empty existing sets", () => {
    expect(validateUniqueSetName("Any Name", [])).toBe(true);
  });

  it("should handle special characters in names", () => {
    const existingSets: ButtonSet[] = [{ buttons: [], id: "1", name: "Dev & Test" }];

    expect(validateUniqueSetName("Dev & Test", existingSets)).toBe(false);
    expect(validateUniqueSetName("Dev&Test", existingSets)).toBe(true);
  });

  it("should handle whitespace in names", () => {
    const existingSets: ButtonSet[] = [{ buttons: [], id: "1", name: "My Set" }];

    expect(validateUniqueSetName("My Set", existingSets)).toBe(false);
    expect(validateUniqueSetName("MySet", existingSets)).toBe(true);
    expect(validateUniqueSetName(" My Set ", existingSets)).toBe(true);
  });
});
