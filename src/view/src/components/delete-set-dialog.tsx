import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/core";

import { useVscodeCommand } from "../context/vscode-command-context";

type DeleteSetDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const DeleteSetDialog = ({ onOpenChange, open }: DeleteSetDialogProps) => {
  const { t } = useTranslation();
  const { activeSet, buttonSets, deleteButtonSet } = useVscodeCommand();
  const [selectedSet, setSelectedSet] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedSet) return;

    setIsDeleting(true);
    try {
      await deleteButtonSet(selectedSet);
      handleClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    setSelectedSet(null);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buttonSets.deleteDialog.title")}</DialogTitle>
          <DialogDescription>{t("buttonSets.deleteDialog.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-2">
            {buttonSets.map((set) => (
              <button
                className={`w-full text-left px-3 py-2 rounded-md border transition-colors ${
                  selectedSet === set.name
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
                key={set.id}
                onClick={() => setSelectedSet(set.name)}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{set.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {set.buttons.length} {t("buttonSets.deleteDialog.buttons")}
                  </span>
                </div>
                {activeSet === set.name && (
                  <span className="text-xs text-amber-500">
                    {t("buttonSets.deleteDialog.currentlyActive")}
                  </span>
                )}
              </button>
            ))}
          </div>
          {selectedSet && activeSet === selectedSet && (
            <p className="mt-3 text-sm text-amber-500">
              {t("buttonSets.deleteDialog.activeWarning")}
            </p>
          )}
        </DialogBody>
        <DialogFooter>
          <Button disabled={isDeleting} onClick={handleClose} variant="ghost">
            {t("buttonSets.deleteDialog.cancel")}
          </Button>
          <Button
            disabled={isDeleting || !selectedSet}
            onClick={handleDelete}
            variant="destructive"
          >
            {isDeleting
              ? t("buttonSets.deleteDialog.deleting")
              : t("buttonSets.deleteDialog.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
