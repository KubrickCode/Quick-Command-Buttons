import { createContext, useContext, useState, type ReactNode } from "react";
import { type ButtonConfig } from "../types";
import { useVscodeCommand } from "./vscode-command-context.tsx";

type CommandFormContextType = {
  showForm: boolean;
  editingCommand: ButtonConfig | null;
  openForm: () => void;
  openEditForm: (command: ButtonConfig, index: number) => void;
  closeForm: () => void;
  handleSave: (command: ButtonConfig) => void;
};

const CommandFormContext = createContext<CommandFormContextType | undefined>(
  undefined
);

export const useCommandForm = () => {
  const context = useContext(CommandFormContext);
  if (context === undefined) {
    throw new Error(
      "useCommandForm must be used within a CommandFormProvider"
    );
  }
  return context;
};

type CommandFormProviderProps = {
  children: ReactNode;
};

export const CommandFormProvider = ({ children }: CommandFormProviderProps) => {
  const { addCommand, updateCommand } = useVscodeCommand();
  const [showForm, setShowForm] = useState(false);
  const [editingCommand, setEditingCommand] = useState<ButtonConfig | null>(
    null
  );

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
        showForm,
        editingCommand,
        openForm,
        openEditForm,
        closeForm,
        handleSave,
      }}
    >
      {children}
    </CommandFormContext.Provider>
  );
};