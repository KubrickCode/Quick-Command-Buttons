import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

import {
  type ButtonConfig,
  type CommandButton,
  type GroupButton,
  isGroupButton,
  toCommandButton,
  toGroupButton,
  toDraft,
} from "../types";

type EditingGroup = {
  depth: number;
  group: GroupButton;
  index: number;
} | null;

type CommandEditContextType = {
  addCommand: () => void;
  addGroup: () => void;
  closeGroupEditor: () => void;
  commands: ButtonConfig[];
  deleteCommand: (index: number) => void;
  editingGroup: EditingGroup;
  hasError: boolean;
  onCommandsChange: (commands: ButtonConfig[]) => void;
  openGroupEditor: (group: GroupButton, index: number, depth: number) => void;
  saveGroup: (updatedGroup: GroupButton) => void;
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
  hasError?: boolean;
  onCommandsChange: (commands: ButtonConfig[]) => void;
};

export const CommandEditProvider = ({
  children,
  commands,
  hasError = false,
  onCommandsChange,
}: CommandEditProviderProps) => {
  const [editingGroup, setEditingGroup] = useState<EditingGroup>(null);

  const openGroupEditor = useCallback((group: GroupButton, index: number, depth: number) => {
    setEditingGroup({ depth, group, index });
  }, []);

  const closeGroupEditor = useCallback(() => {
    setEditingGroup(null);
  }, []);

  const saveGroup = useCallback(
    (updatedGroup: GroupButton) => {
      if (editingGroup) {
        const newCommands = [...commands];
        newCommands[editingGroup.index] = updatedGroup;
        onCommandsChange(newCommands);
        closeGroupEditor();
      }
    },
    [editingGroup, commands, onCommandsChange, closeGroupEditor]
  );

  const updateCommand = useCallback(
    (index: number, updates: Partial<ButtonConfig>) => {
      const existing = commands[index];
      const newCommands = [...commands];
      // Merge updates into a draft, then convert back to proper type
      const draft = { ...toDraft(existing), ...updates };
      newCommands[index] = isGroupButton(existing) ? toGroupButton(draft) : toCommandButton(draft);
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
    const newCommand: CommandButton = {
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
    const newGroup: GroupButton = {
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
        hasError,
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
