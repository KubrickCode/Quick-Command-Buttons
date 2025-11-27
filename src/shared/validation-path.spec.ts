import { describe, expect, it } from "@jest/globals";

import { ButtonConfig } from "./types";
import { formatPath, parsePathIndices, updateButtonAtPath } from "./validation-path";

describe("parsePathIndices", () => {
  it("should parse top-level button index", () => {
    expect(parsePathIndices(["buttons[0]"])).toEqual([0]);
    expect(parsePathIndices(["buttons[3]"])).toEqual([3]);
    expect(parsePathIndices(["buttons[10]"])).toEqual([10]);
  });

  it("should parse nested path indices", () => {
    expect(parsePathIndices(["buttons[3]", "Utils", "[2]"])).toEqual([3, 2]);
    expect(parsePathIndices(["buttons[0]", "Parent", "[1]", "Child", "[0]"])).toEqual([0, 1, 0]);
  });

  it("should ignore non-index segments", () => {
    expect(parsePathIndices(["buttons[0]", "SomeName"])).toEqual([0]);
    expect(parsePathIndices(["buttons[2]", "Group", "[1]", "ChildName"])).toEqual([2, 1]);
  });

  it("should return empty array for empty path", () => {
    expect(parsePathIndices([])).toEqual([]);
  });

  it("should handle various bracket formats", () => {
    expect(parsePathIndices(["button[0]"])).toEqual([0]);
    expect(parsePathIndices(["[5]"])).toEqual([5]);
  });
});

describe("updateButtonAtPath", () => {
  const createTestButtons = (): ButtonConfig[] =>
    [
      { command: "cmd1", id: "1", name: "Button1" },
      { command: "cmd2", id: "2", name: "Button2" },
      {
        group: [
          { command: "child1", id: "3a", name: "Child1" },
          {
            group: [{ command: "deep", id: "4a", name: "DeepChild" }],
            id: "3b",
            name: "ChildGroup",
          },
        ],
        id: "3",
        name: "Group",
      },
    ] as ButtonConfig[];

  it("should update top-level button", () => {
    const buttons = createTestButtons();
    const result = updateButtonAtPath(buttons, [0], (btn) => ({
      ...btn,
      name: "Updated",
    }));

    expect(result[0].name).toBe("Updated");
    expect(result[1].name).toBe("Button2");
  });

  it("should update nested button in group", () => {
    const buttons = createTestButtons();
    const result = updateButtonAtPath(buttons, [2, 0], (btn) => ({
      ...btn,
      name: "UpdatedChild",
    }));

    expect(result[2].name).toBe("Group");
    const group = result[2] as { group: ButtonConfig[] };
    expect(group.group[0].name).toBe("UpdatedChild");
    expect(group.group[1].name).toBe("ChildGroup");
  });

  it("should update deeply nested button", () => {
    const buttons = createTestButtons();
    const result = updateButtonAtPath(buttons, [2, 1, 0], (btn) => ({
      ...btn,
      name: "DeepUpdated",
    }));

    const group = result[2] as { group: ButtonConfig[] };
    const childGroup = group.group[1] as { group: ButtonConfig[] };
    expect(childGroup.group[0].name).toBe("DeepUpdated");
  });

  it("should not modify other buttons", () => {
    const buttons = createTestButtons();
    const result = updateButtonAtPath(buttons, [1], (btn) => ({
      ...btn,
      name: "OnlyThis",
    }));

    expect(result[0].name).toBe("Button1");
    expect(result[1].name).toBe("OnlyThis");
    expect(result[2].name).toBe("Group");
  });

  it("should return original array for empty indices", () => {
    const buttons = createTestButtons();
    const result = updateButtonAtPath(buttons, [], (btn) => ({
      ...btn,
      name: "ShouldNotChange",
    }));

    expect(result).toEqual(buttons);
  });

  it("should handle out-of-bounds index gracefully", () => {
    const buttons = createTestButtons();
    const result = updateButtonAtPath(buttons, [99], (btn) => ({
      ...btn,
      name: "NeverReached",
    }));

    expect(result[0].name).toBe("Button1");
    expect(result[1].name).toBe("Button2");
    expect(result[2].name).toBe("Group");
  });
});

describe("formatPath", () => {
  it("should return Root for empty path", () => {
    expect(formatPath([])).toBe("Root");
  });

  it("should format top-level button", () => {
    expect(formatPath(["buttons[0]"])).toBe("Button 1");
    expect(formatPath(["buttons[3]"])).toBe("Button 4");
  });

  it("should format nested path with button names", () => {
    expect(formatPath(["buttons[3]", "Utils", "[2]"])).toBe("Button 4 → Utils → Item 3");
  });

  it("should format deeply nested path", () => {
    expect(formatPath(["buttons[0]", "Parent", "[1]", "Child", "[0]"])).toBe(
      "Button 1 → Parent → Item 2 → Child → Item 1"
    );
  });

  it("should handle button name segments", () => {
    expect(formatPath(["buttons[2]", "MyGroup"])).toBe("Button 3 → MyGroup");
  });
});
