import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const { t } = useTranslation();
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
          <DialogTitle>{t("deleteConfirmation.title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("deleteConfirmation.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {t("deleteConfirmation.message")}{" "}
          <code className="px-2 py-1 bg-muted rounded font-mono text-sm">{commandName}</code>
          {t("deleteConfirmation.warning")}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            {t("deleteConfirmation.cancel")}
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            {t("deleteConfirmation.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
