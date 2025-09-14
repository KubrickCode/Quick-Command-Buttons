import { type ButtonConfig } from "../types";
import { CommandForm } from "./command-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/core";

type CommandFormDialogProps = {
  command?: (ButtonConfig & { index?: number }) | null;
  onCancel: () => void;
  onSave: (command: ButtonConfig) => void;
  open: boolean;
};

export const CommandFormDialog = ({
  command,
  onCancel,
  onSave,
  open,
}: CommandFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {command ? "Edit Command" : "Add New Command"}
          </DialogTitle>
        </DialogHeader>
        <CommandForm command={command} onCancel={onCancel} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
};
