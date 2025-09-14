import { type ButtonConfig } from "../types";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { CommandForm } from "./command-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/core";

export const CommandFormDialog = () => {
  const { showForm, editingCommand, closeForm, addCommand, updateCommand } =
    useVscodeCommand();

  const handleSave = (command: ButtonConfig) => {
    if (editingCommand?.index !== undefined) {
      updateCommand(editingCommand.index, command);
    } else {
      addCommand(command);
    }
  };

  return (
    <Dialog open={showForm} onOpenChange={closeForm}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingCommand ? "Edit Command" : "Add New Command"}
          </DialogTitle>
        </DialogHeader>
        <CommandForm
          command={editingCommand}
          onCancel={closeForm}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
};
