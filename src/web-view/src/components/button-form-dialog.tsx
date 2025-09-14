import { type ButtonConfig } from "../types";
import { ButtonForm } from "./button-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/core";

type ButtonFormDialogProps = {
  command?: (ButtonConfig & { index?: number }) | null;
  onCancel: () => void;
  onSave: (command: ButtonConfig) => void;
  open: boolean;
};

export const ButtonFormDialog = ({ command, onCancel, onSave, open }: ButtonFormDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {command ? "Edit Command" : "Add New Command"}
          </DialogTitle>
        </DialogHeader>
        <ButtonForm command={command} onCancel={onCancel} onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
};