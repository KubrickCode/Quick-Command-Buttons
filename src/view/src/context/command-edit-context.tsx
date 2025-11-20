import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

import { type ButtonConfig } from "../types";

type EditingGroup = {
  depth: number;
  group: ButtonConfig;
  index: number;
} | null;

type CommandEditContextType = {
  addCommand: () => void;
  addGroup: () => void;
  closeGroupEditor: () => void;
  commands: ButtonConfig[];
  deleteCommand: (index: number) => void;
  editingGroup: EditingGroup;
  onCommandsChange: (commands: ButtonConfig[]) => void;
  openGroupEditor: (group: ButtonConfig, index: number, depth: number) => void;
  saveGroup: (updatedGroup: ButtonConfig) => void;
  updateCommand: (index: number, updates: Partial<ButtonConfig>) => void;
};

const CommandEditContext = createContext<CommandEditContextType | undefined>(undefined);

export const useCommandEdit = () => {
  const context = useContext(CommandEditContext);
  if (context === undefined) {
    throw new Error("useCommandEdit must be used within a CommandEditProvider");
  }
  return context;
};

type CommandEditProviderProps = {
  children: ReactNode;
  commands: ButtonConfig[];
  onCommandsChange: (commands: ButtonConfig[]) => void;
};

export const CommandEditProvider = ({
  children,
  commands,
  onCommandsChange,
}: CommandEditProviderProps) => {
  const [editingGroup, setEditingGroup] = useState<EditingGroup>(null);

  const openGroupEditor = useCallback((group: ButtonConfig, index: number, depth: number) => {
    setEditingGroup({ depth, group, index });
  }, []);

  const closeGroupEditor = useCallback(() => {
    setEditingGroup(null);
  }, []);

  const saveGroup = useCallback(
    (updatedGroup: ButtonConfig) => {
      if (editingGroup) {
        const newCommands = [...commands];
        newCommands[editingGroup.index] = {
          ...newCommands[editingGroup.index],
          ...updatedGroup,
        };
        onCommandsChange(newCommands);
        closeGroupEditor();
      }
    },
    [editingGroup, commands, onCommandsChange, closeGroupEditor]
  );

  const updateCommand = useCallback(
    (index: number, updates: Partial<ButtonConfig>) => {
      const newCommands = [...commands];
      newCommands[index] = { ...newCommands[index], ...updates };
      onCommandsChange(newCommands);
    },
    [commands, onCommandsChange]
  );

  const deleteCommand = useCallback(
    (index: number) => {
      const newCommands = commands.filter((_, i) => i !== index);
      onCommandsChange(newCommands);
    },
    [commands, onCommandsChange]
  );

  const addCommand = useCallback(() => {
    const newCommand: ButtonConfig = {
      color: "",
      command: "",
      id: crypto.randomUUID(),
      name: "",
      shortcut: "",
      terminalName: "",
      useVsCodeApi: false,
    };
    onCommandsChange([...commands, newCommand]);
  }, [commands, onCommandsChange]);

  const addGroup = useCallback(() => {
    const newGroup: ButtonConfig = {
      color: "",
      executeAll: false,
      group: [],
      id: crypto.randomUUID(),
      name: "",
      shortcut: "",
    };
    onCommandsChange([...commands, newGroup]);
  }, [commands, onCommandsChange]);

  return (
    <CommandEditContext.Provider
      value={{
        addCommand,
        addGroup,
        closeGroupEditor,
        commands,
        deleteCommand,
        editingGroup,
        onCommandsChange,
        openGroupEditor,
        saveGroup,
        updateCommand,
      }}
    >
      {children}
    </CommandEditContext.Provider>
  );
};
