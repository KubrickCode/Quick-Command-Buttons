import { createContext, useContext, useState, type ReactNode } from "react";

import { type ButtonConfig } from "../types";
import { useVscodeCommand } from "./vscode-command-context.tsx";

type CommandFormContextType = {
  closeForm: () => void;
  editingCommand: ButtonConfig | null;
  handleSave: (command: ButtonConfig) => void;
  openEditForm: (command: ButtonConfig, index: number) => void;
  openForm: () => void;
  resetFormState: () => void;
  showForm: boolean;
};

const CommandFormContext = createContext<CommandFormContextType | undefined>(undefined);

export const useCommandForm = () => {
  const context = useContext(CommandFormContext);
  if (context === undefined) {
    throw new Error("useCommandForm must be used within a CommandFormProvider");
  }
  return context;
};

type CommandFormProviderProps = {
  children: ReactNode;
};

export const CommandFormProvider = ({ children }: CommandFormProviderProps) => {
  const { addCommand, updateCommand } = useVscodeCommand();
  const [showForm, setShowForm] = useState(false);
  const [editingCommand, setEditingCommand] = useState<ButtonConfig | null>(null);

  const openForm = () => {
    setEditingCommand(null);
    setShowForm(true);
  };

  const openEditForm = (command: ButtonConfig, index: number) => {
    setEditingCommand({ ...command, index });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
  };

  const resetFormState = () => {
    setEditingCommand(null);
  };

  const handleSave = (command: ButtonConfig) => {
    if (editingCommand?.index !== undefined) {
      updateCommand(editingCommand.index, command);
    } else {
      addCommand(command);
    }
    closeForm();
  };

  return (
    <CommandFormContext.Provider
      value={{
        closeForm,
        editingCommand,
        handleSave,
        openEditForm,
        openForm,
        resetFormState,
        showForm,
      }}
    >
      {children}
    </CommandFormContext.Provider>
  );
};
