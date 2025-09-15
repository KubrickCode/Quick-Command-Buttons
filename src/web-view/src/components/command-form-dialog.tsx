import { useId } from "react";
import { useCommandForm } from "../context/command-form-context.tsx";
import { CommandForm } from "./command-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter, Button } from "~/core";

export const CommandFormDialog = () => {
  const { showForm, editingCommand, closeForm, handleSave } = useCommandForm();
  const formId = useId();

  return (
    <Dialog open={showForm} onOpenChange={closeForm}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingCommand ? "Edit Command" : "Add New Command"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CommandForm
            command={editingCommand}
            onSave={handleSave}
            formId={formId}
          />
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeForm}>
            Cancel
          </Button>
          <Button type="submit" form={formId}>
            {editingCommand ? "Update" : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
