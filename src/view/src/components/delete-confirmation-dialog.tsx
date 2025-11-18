import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogBody,
  Button,
} from "~/core";

type DeleteConfirmationDialogProps = {
  children: React.ReactNode;
  commandName: string;
  onConfirm: () => void;
};

export const DeleteConfirmationDialog = ({
  children,
  commandName,
  onConfirm,
}: DeleteConfirmationDialogProps) => {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Command</DialogTitle>
        </DialogHeader>
        <DialogBody>
          Are you sure you want to delete{" "}
          <code className="px-2 py-1 bg-muted rounded font-mono text-sm">{commandName}</code>? This
          action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
