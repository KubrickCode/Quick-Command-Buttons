import { useId } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
} from "~/core";

import { CommandForm } from "./command-form";
import { useCommandForm } from "../context/command-form-context.tsx";

export const CommandFormDialog = () => {
  const { closeForm, editingCommand, handleSave, resetFormState, showForm } = useCommandForm();
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
    <Dialog onOpenChange={handleOpenChange} open={showForm}>
      <DialogContent className="max-w-2xl" onAnimationEnd={handleAnimationEnd}>
        <DialogHeader>
          <DialogTitle>{editingCommand ? "Edit Command" : "Add New Command"}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <CommandForm command={editingCommand} formId={formId} onSave={handleSave} />
        </DialogBody>
        <DialogFooter>
          <Button onClick={closeForm} type="button" variant="outline">
            Cancel
          </Button>
          <Button form={formId} type="submit">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
