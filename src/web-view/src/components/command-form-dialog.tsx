import { useCommandForm } from "../context/command-form-context.tsx";
import { CommandForm } from "./command-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/core";

export const CommandFormDialog = () => {
  const { showForm, editingCommand, closeForm, handleSave } = useCommandForm();

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
