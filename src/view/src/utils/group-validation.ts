import { type ButtonConfig } from "../types";

export type GroupValidationError =
  | "empty"
  | "emptyName"
  | "emptyCommand"
  | "emptyNestedGroup"
  | "duplicateShortcut"
  | null;

/**
 * Validates group commands recursively.
 * Returns the first validation error found, or null if valid.
 */
export const validateGroupCommands = (commands: ButtonConfig[]): GroupValidationError => {
  if (commands.length === 0) return "empty";

  if (hasDuplicateShortcutInGroup(commands)) return "duplicateShortcut";

  for (const item of commands) {
    if (!item.name || item.name.trim() === "") return "emptyName";

    const isGroup = item.group !== undefined;
    if (isGroup) {
      if (item.group!.length === 0) return "emptyNestedGroup";
      const nestedError = validateGroupCommands(item.group!);
      if (nestedError) return nestedError;
    } else {
      if (!item.command || item.command.trim() === "") return "emptyCommand";
    }
  }

  return null;
};

/**
 * Checks if any item in the group has an empty command (for single commands only).
 * Used by Zod schema refinement.
 */
export const hasEmptyCommandInGroup = (items: ButtonConfig[]): boolean => {
  for (const item of items) {
    // If group property exists, it's a group (empty array or not)
    const isGroup = item.group !== undefined;
    if (isGroup) {
      // Only recursively check non-empty groups (empty groups handled by hasEmptyNestedGroup)
      if (item.group!.length > 0) {
        if (hasEmptyCommandInGroup(item.group!)) return true;
      }
    } else {
      // Single command requires command field
      if (!item.command || item.command.trim().length === 0) {
        return true;
      }
    }
  }
  return false;
};

/**
 * Checks if any item in the group has an empty name.
 * Used by Zod schema refinement.
 */
export const hasEmptyNameInGroup = (items: ButtonConfig[]): boolean => {
  for (const item of items) {
    if (!item.name || item.name.trim().length === 0) {
      return true;
    }
    if (item.group && item.group.length > 0) {
      if (hasEmptyNameInGroup(item.group)) return true;
    }
  }
  return false;
};

/**
 * Checks if any nested group is empty.
 * Used by Zod schema refinement.
 */
export const hasEmptyNestedGroup = (items: ButtonConfig[]): boolean => {
  for (const item of items) {
    if (item.group !== undefined && item.group.length === 0) {
      return true;
    }
    if (item.group && item.group.length > 0) {
      if (hasEmptyNestedGroup(item.group)) return true;
    }
  }
  return false;
};

/**
 * Checks if any group has duplicate shortcuts at the same nesting level.
 * Performs case-insensitive comparison and recursively validates nested groups.
 *
 * @param items - Array of button configs to validate
 * @returns true if duplicates found at any level, false otherwise
 */
export const hasDuplicateShortcutInGroup = (items: ButtonConfig[]): boolean => {
  const shortcuts = items
    .map((item) => item.shortcut?.toLowerCase().trim())
    .filter((shortcut): shortcut is string => !!shortcut && shortcut.length > 0);

  const uniqueShortcuts = new Set(shortcuts);
  if (shortcuts.length !== uniqueShortcuts.size) {
    return true;
  }

  for (const item of items) {
    if (item.group && item.group.length > 0) {
      if (hasDuplicateShortcutInGroup(item.group)) {
        return true;
      }
    }
  }

  return false;
};
