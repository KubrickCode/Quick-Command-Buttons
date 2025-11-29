import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("groupToSingleWarning.title")}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("groupToSingleWarning.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {t("groupToSingleWarning.message", { count: childCount, name: commandName })}
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="outline">
            {t("groupToSingleWarning.cancel")}
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            {t("groupToSingleWarning.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
