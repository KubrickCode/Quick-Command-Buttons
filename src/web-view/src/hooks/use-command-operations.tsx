import { useCallback } from "react";
import { type DropResult } from "@hello-pangea/dnd";
import { type ButtonConfig } from "../types";

export const useCommandOperations = (
  commands: ButtonConfig[],
  onChange: (commands: ButtonConfig[]) => void
) => {
  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(commands);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    onChange(items);
  }, [commands, onChange]);

  const updateCommand = useCallback((index: number, updates: Partial<ButtonConfig>) => {
    const newCommands = [...commands];
    newCommands[index] = { ...newCommands[index], ...updates };
    onChange(newCommands);
  }, [commands, onChange]);

  const deleteCommand = useCallback((index: number) => {
    const newCommands = commands.filter((_, i) => i !== index);
    onChange(newCommands);
  }, [commands, onChange]);

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

  return {
    handleDragEnd,
    updateCommand,
    deleteCommand,
    addCommand,
    addGroup,
  };
};