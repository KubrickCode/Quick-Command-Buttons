import { ButtonConfigWithOptionalId } from "../../shared/types";
import { validateButtonConfigs, formatValidationErrorMessage } from "./validate-button-config";

describe("validateButtonConfigs", () => {
  describe("valid configurations", () => {
    it("should return no errors for command-only button", () => {
      const buttons: ButtonConfigWithOptionalId[] = [
        { command: "npm test", id: "1", name: "Test" },
      ];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    it("should return no errors for group-only button", () => {
      const buttons: ButtonConfigWithOptionalId[] = [
        {
          group: [{ command: "npm run child", id: "2", name: "Child" }],
          id: "1",
          name: "Group",
        },
      ];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    it("should return no errors for nested groups", () => {
      const buttons: ButtonConfigWithOptionalId[] = [
        {
          group: [
            {
              group: [{ command: "echo hello", id: "3", name: "Grandchild" }],
              id: "2",
              name: "Child Group",
            },
          ],
          id: "1",
          name: "Parent",
        },
      ];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
    });

    it("should return no errors for empty buttons array", () => {
      const result = validateButtonConfigs([]);

      expect(result.hasErrors).toBe(false);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("invalid configurations", () => {
    it("should detect button with both command and group", () => {
      const buttons = [
        {
          command: "npm test",
          group: [{ command: "npm run child", id: "2", name: "Child" }],
          id: "1",
          name: "Invalid",
        },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].buttonName).toBe("Invalid");
      expect(result.errors[0].buttonId).toBe("1");
      expect(result.errors[0].message).toContain("command");
      expect(result.errors[0].message).toContain("group");
    });

    it("should detect nested button with both command and group", () => {
      const buttons = [
        {
          group: [
            {
              command: "npm test",
              group: [{ command: "echo", id: "3", name: "Grandchild" }],
              id: "2",
              name: "Invalid Child",
            },
          ],
          id: "1",
          name: "Parent",
        },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].buttonName).toBe("Invalid Child");
      expect(result.errors[0].buttonId).toBe("2");
    });

    it("should detect multiple invalid buttons", () => {
      const buttons = [
        {
          command: "npm test",
          group: [{ command: "echo", id: "3", name: "Child" }],
          id: "1",
          name: "Invalid 1",
        },
        {
          command: "npm build",
          group: [{ command: "echo 2", id: "4", name: "Child 2" }],
          id: "2",
          name: "Invalid 2",
        },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.map((e) => e.buttonName)).toContain("Invalid 1");
      expect(result.errors.map((e) => e.buttonName)).toContain("Invalid 2");
    });

    it("should include path information in errors", () => {
      const buttons = [
        {
          command: "npm test",
          group: [{ command: "echo", id: "2", name: "Child" }],
          id: "1",
          name: "Invalid",
        },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.errors[0].path).toContain("buttons[0]");
    });

    it("should include rawCommand and rawGroup in error for command+group conflict", () => {
      const buttons = [
        {
          command: "git pull",
          group: [
            { command: "git push", id: "2", name: "Push" },
            { command: "git status", id: "3", name: "Status" },
          ],
          id: "1",
          name: "Git",
        },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors[0].rawCommand).toBe("git pull");
      expect(result.errors[0].rawGroup).toHaveLength(2);
      expect(result.errors[0].rawGroup).toEqual([
        { command: "git push", id: "2", name: "Push" },
        { command: "git status", id: "3", name: "Status" },
      ]);
    });

    it("should include rawCommand and rawGroup for nested command+group conflict", () => {
      const buttons = [
        {
          group: [
            {
              command: "nested command",
              group: [{ command: "deep", id: "3", name: "Deep" }],
              id: "2",
              name: "Nested Invalid",
            },
          ],
          id: "1",
          name: "Parent",
        },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors[0].buttonName).toBe("Nested Invalid");
      expect(result.errors[0].rawCommand).toBe("nested command");
      expect(result.errors[0].rawGroup).toHaveLength(1);
      expect(result.errors[0].path).toEqual(["buttons[0]", "Parent", "[0]"]);
    });

    it("should not include rawCommand/rawGroup for neither-command-nor-group error", () => {
      const buttons = [{ id: "1", name: "Empty" }] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors[0].rawCommand).toBeUndefined();
      expect(result.errors[0].rawGroup).toBeUndefined();
    });

    it("should detect button with neither command nor group", () => {
      const buttons = [
        { id: "1", name: "Empty Button" },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].buttonName).toBe("Empty Button");
      expect(result.errors[0].message).toContain("command");
      expect(result.errors[0].message).toContain("group");
    });

    it("should detect button with empty string command", () => {
      const buttons = [
        { command: "", id: "1", name: "Empty Command" },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].buttonName).toBe("Empty Command");
    });

    it("should detect button with empty group array", () => {
      const buttons = [
        { group: [], id: "1", name: "Empty Group" },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].buttonName).toBe("Empty Group");
    });

    it("should detect nested button with neither command nor group", () => {
      const buttons = [
        {
          group: [{ id: "2", name: "Invalid Nested" }],
          id: "1",
          name: "Parent",
        },
      ] as unknown as ButtonConfigWithOptionalId[];

      const result = validateButtonConfigs(buttons);

      expect(result.hasErrors).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].buttonName).toBe("Invalid Nested");
    });
  });
});

describe("formatValidationErrorMessage", () => {
  it("should return empty string for no errors", () => {
    const result = formatValidationErrorMessage([]);

    expect(result).toBe("");
  });

  it("should format single error message", () => {
    const errors = [
      {
        buttonId: "1",
        buttonName: "Test Button",
        message: "Cannot have both command and group",
        path: ["buttons[0]"],
      },
    ];

    const result = formatValidationErrorMessage(errors);

    expect(result).toContain("Test Button");
    expect(result).toContain("command");
    expect(result).toContain("group");
  });

  it("should format multiple errors message", () => {
    const errors = [
      {
        buttonId: "1",
        buttonName: "Button 1",
        message: "Error",
        path: ["buttons[0]"],
      },
      {
        buttonId: "2",
        buttonName: "Button 2",
        message: "Error",
        path: ["buttons[1]"],
      },
    ];

    const result = formatValidationErrorMessage(errors);

    expect(result).toContain("2");
    expect(result).toContain("configuration issues");
  });
});
