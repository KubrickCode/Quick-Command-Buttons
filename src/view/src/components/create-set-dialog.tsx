import { useEffect, useState } from "react";
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
  FormLabel,
  Input,
} from "~/core";

import { useVscodeCommand } from "../context/vscode-command-context";

type CreateSetDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export const CreateSetDialog = ({ onOpenChange, open }: CreateSetDialogProps) => {
  const { t } = useTranslation();
  const { buttonSets, createButtonSet } = useVscodeCommand();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setNameError(null);
    }
  }, [open]);

  const validateName = (newName: string): boolean => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError(t("buttonSets.errors.nameRequired"));
      return false;
    }
    const isDuplicate = buttonSets.some((s) => s.name.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      setNameError(t("buttonSets.errors.nameDuplicate"));
      return false;
    }
    setNameError(null);
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      validateName(value);
    }
  };

  const handleCreate = async () => {
    if (!validateName(name)) return;

    setIsCreating(true);
    try {
      const result = await createButtonSet(name.trim());
      if (result.success) {
        handleClose();
      } else if (result.error) {
        if (result.error === "duplicateSetName") {
          setNameError(t("buttonSets.errors.nameDuplicate"));
        } else if (result.error === "setNameRequired") {
          setNameError(t("buttonSets.errors.nameRequired"));
        }
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName("");
    setNameError(null);
    onOpenChange(false);
  };

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buttonSets.createDialog.title")}</DialogTitle>
          <DialogDescription>{t("buttonSets.createDialog.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-2">
            <FormLabel htmlFor="new-set-name">{t("buttonSets.createDialog.nameLabel")}</FormLabel>
            <Input
              error={!!nameError}
              errorMessage={nameError ?? undefined}
              id="new-set-name"
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim() && !isCreating) {
                  handleCreate();
                }
              }}
              placeholder={t("buttonSets.createDialog.namePlaceholder")}
              value={name}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button disabled={isCreating} onClick={handleClose} variant="ghost">
            {t("buttonSets.createDialog.cancel")}
          </Button>
          <Button disabled={isCreating || !name.trim()} onClick={handleCreate}>
            {isCreating
              ? t("buttonSets.createDialog.creating")
              : t("buttonSets.createDialog.create")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
