import { useId } from "react";
import { useCommandForm } from "../context/command-form-context.tsx";
import { CommandForm } from "./command-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
} from "~/core";

export const CommandFormDialog = () => {
  const { showForm, editingCommand, closeForm, resetFormState, handleSave } = useCommandForm();
  const formId = useId();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeForm();
    }
  };

  const handleAnimationEnd = () => {
    if (!showForm) {
      resetFormState();
    }
  };

  return (
    <Dialog open={showForm} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl" onAnimationEnd={handleAnimationEnd}>
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
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
