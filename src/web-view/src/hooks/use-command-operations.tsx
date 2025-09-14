import { useCallback } from "react";
import { type ButtonConfig } from "../types";

export const useCommandOperations = (
  commands: ButtonConfig[],
  onChange: (commands: ButtonConfig[]) => void
) => {
  const updateCommand = useCallback(
    (index: number, updates: Partial<ButtonConfig>) => {
      const newCommands = [...commands];
      newCommands[index] = { ...newCommands[index], ...updates };
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
    const newCommand: ButtonConfig = {
      name: "New Command",
      command: "",
      useVsCodeApi: false,
    };
    onChange([...commands, newCommand]);
  }, [commands, onChange]);

  const addGroup = useCallback(() => {
    const newGroup: ButtonConfig = {
      name: "New Group",
      group: [],
      executeAll: false,
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
    updateCommand,
    deleteCommand,
    addCommand,
    addGroup,
    moveUp,
    moveDown,
  };
};
