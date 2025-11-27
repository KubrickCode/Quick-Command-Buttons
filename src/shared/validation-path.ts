import type { ButtonConfig } from "./types";
import { isGroupButton } from "./types";

export const parsePathIndices = (path: string[]): number[] => {
  const indices: number[] = [];
  for (const segment of path) {
    const match = segment.match(/^buttons?\[(\d+)\]$|^\[(\d+)\]$/);
    if (match) {
      const index = match[1] ?? match[2];
      if (index !== undefined) {
        indices.push(parseInt(index, 10));
      }
    }
  }
  return indices;
};

export const updateButtonAtPath = (
  buttons: ButtonConfig[],
  indices: number[],
  updater: (button: ButtonConfig) => ButtonConfig
): ButtonConfig[] => {
  if (indices.length === 0) return buttons;

  const [currentIndex, ...remainingIndices] = indices;

  return buttons.map((button, idx) => {
    if (idx !== currentIndex) return button;

    if (remainingIndices.length === 0) {
      return updater(button);
    }

    if (isGroupButton(button)) {
      return {
        ...button,
        group: updateButtonAtPath(button.group, remainingIndices, updater),
      };
    }

    return button;
  });
};

export const formatPath = (path: string[]): string => {
  if (path.length === 0) return "Root";
  return path
    .map((segment) => {
      const indexMatch = segment.match(/^buttons?\[(\d+)\]$/);
      if (indexMatch) {
        return `Button ${parseInt(indexMatch[1], 10) + 1}`;
      }
      const itemMatch = segment.match(/^\[(\d+)\]$/);
      if (itemMatch) {
        return `Item ${parseInt(itemMatch[1], 10) + 1}`;
      }
      return segment;
    })
    .join(" → ");
};
