import { useCallback } from "react";

import {
  type ButtonConfig,
  type CommandButton,
  type GroupButton,
  isGroupButton,
  toCommandButton,
  toGroupButton,
  toDraft,
} from "../types";

export const useCommandOperations = (
  commands: ButtonConfig[],
  onChange: (commands: ButtonConfig[]) => void
) => {
  const updateCommand = useCallback(
    (index: number, updates: Partial<ButtonConfig>) => {
      const existing = commands[index];
      const newCommands = [...commands];
      const draft = { ...toDraft(existing), ...updates };
      newCommands[index] = isGroupButton(existing) ? toGroupButton(draft) : toCommandButton(draft);
      onChange(newCommands);
    },
    [commands, onChange]
  );

  const deleteCommand = useCallback(
    (index: number) => {
      const newCommands = commands.filter((_, i) => i !== index);
      onChange(newCommands);
    },
    [commands, onChange]
  );

  const addCommand = useCallback(() => {
    const newCommand: CommandButton = {
      command: "",
      id: crypto.randomUUID(),
      name: "",
      useVsCodeApi: false,
    };
    onChange([...commands, newCommand]);
  }, [commands, onChange]);

  const addGroup = useCallback(() => {
    const newGroup: GroupButton = {
      executeAll: false,
      group: [],
      id: crypto.randomUUID(),
      name: "",
    };
    onChange([...commands, newGroup]);
  }, [commands, onChange]);

  const moveUp = useCallback(
    (index: number) => {
      if (index === 0) return; // Already at the top

      const newCommands = [...commands];
      const temp = newCommands[index];
      newCommands[index] = newCommands[index - 1];
      newCommands[index - 1] = temp;
      onChange(newCommands);
    },
    [commands, onChange]
  );

  const moveDown = useCallback(
    (index: number) => {
      if (index === commands.length - 1) return; // Already at the bottom

      const newCommands = [...commands];
      const temp = newCommands[index];
      newCommands[index] = newCommands[index + 1];
      newCommands[index + 1] = temp;
      onChange(newCommands);
    },
    [commands, onChange]
  );

  return {
    addCommand,
    addGroup,
    deleteCommand,
    moveDown,
    moveUp,
    updateCommand,
  };
};
