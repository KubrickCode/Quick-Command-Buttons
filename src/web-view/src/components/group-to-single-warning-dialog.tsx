import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
          <DialogDescription>
            Converting "{commandName}" from a group command to a single command
            will permanently delete all {childCount} child commands. This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
