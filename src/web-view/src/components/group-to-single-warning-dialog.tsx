import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogBody,
  Button,
} from "~/core";

type GroupToSingleWarningDialogProps = {
  childCount: number;
  commandName: string;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const GroupToSingleWarningDialog = ({
  childCount,
  commandName,
  onConfirm,
  onOpenChange,
  open,
}: GroupToSingleWarningDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to Single Command?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          Converting "{commandName}" from a group command to a single command will permanently
          delete all {childCount} child commands. This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            Convert & Delete Child Commands
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
