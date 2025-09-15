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
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commandName: string;
  childCount: number;
  onConfirm: () => void;
};

export const GroupToSingleWarningDialog = ({
  open,
  onOpenChange,
  commandName,
  childCount,
  onConfirm,
}: GroupToSingleWarningDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Convert to Single Command?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          Converting "{commandName}" from a group command to a single command
          will permanently delete all {childCount} child commands. This action
          cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Convert & Delete Child Commands
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
