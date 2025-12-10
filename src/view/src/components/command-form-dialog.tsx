import { useId } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  Button,
} from "~/core";

import { CommandForm } from "./command-form";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";

export const CommandFormDialog = () => {
  const { t } = useTranslation();
  const { closeForm, editingCommand, handleSave, resetFormState, showForm } = useCommandForm();
  const { commands } = useVscodeCommand();
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
      <DialogContent className="max-w-2xl" onAnimationEnd={handleAnimationEnd} variant="premium">
        <DialogHeader>
          <DialogTitle>
            {editingCommand
              ? t("commandFormDialog.editCommand")
              : t("commandFormDialog.addNewCommand")}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {editingCommand
              ? t("commandFormDialog.editDescription")
              : t("commandFormDialog.addDescription")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <CommandForm
            command={editingCommand}
            formId={formId}
            onSave={handleSave}
            siblingCommands={commands}
          />
        </DialogBody>
        <DialogFooter>
          <Button onClick={closeForm} type="button" variant="outline">
            {t("commandFormDialog.cancel")}
          </Button>
          <Button form={formId} type="submit">
            {t("commandFormDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
