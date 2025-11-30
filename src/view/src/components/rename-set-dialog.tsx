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

import type { ButtonSet } from "../../../shared/types";
import { useVscodeCommand } from "../context/vscode-command-context";

type RenameSetDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  targetSet: ButtonSet | null;
};

export const RenameSetDialog = ({ onOpenChange, open, targetSet }: RenameSetDialogProps) => {
  const { t } = useTranslation();
  const { buttonSets, renameButtonSet } = useVscodeCommand();
  const [name, setName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (open && targetSet) {
      setName(targetSet.name);
      setNameError(null);
    }
  }, [open, targetSet?.name]);

  const validateName = (newName: string): boolean => {
    if (!targetSet) {
      return false;
    }
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError(t("buttonSets.errors.nameRequired"));
      return false;
    }
    const isDuplicate = buttonSets.some(
      (s) =>
        s.name.toLowerCase() === trimmed.toLowerCase() &&
        s.name.toLowerCase() !== targetSet.name.toLowerCase()
    );
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

  const handleRename = async () => {
    if (!targetSet || !validateName(name)) return;

    setIsRenaming(true);
    try {
      const result = await renameButtonSet(targetSet.name, name.trim());
      if (result.success) {
        handleClose();
      } else if (result.error) {
        if (result.error === "duplicateSetName") {
          setNameError(t("buttonSets.errors.nameDuplicate"));
        } else if (result.error === "setNameRequired") {
          setNameError(t("buttonSets.errors.nameRequired"));
        } else if (result.error === "setNotFound") {
          handleClose();
        }
      }
    } finally {
      setIsRenaming(false);
    }
  };

  const handleClose = () => {
    setName("");
    setNameError(null);
    onOpenChange(false);
  };

  const hasNameChanged = !!targetSet && name.trim() !== targetSet.name;

  return (
    <Dialog onOpenChange={handleClose} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("buttonSets.renameDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("buttonSets.renameDialog.description", { name: targetSet?.name })}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-2">
            <FormLabel htmlFor="rename-set-name">
              {t("buttonSets.renameDialog.newNameLabel")}
            </FormLabel>
            <Input
              className={nameError ? "border-destructive" : ""}
              id="rename-set-name"
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hasNameChanged && !isRenaming) {
                  handleRename();
                }
              }}
              placeholder={t("buttonSets.renameDialog.newNamePlaceholder")}
              value={name}
            />
            {nameError && (
              <p aria-live="polite" className="text-sm text-destructive" role="alert">
                {nameError}
              </p>
            )}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button disabled={isRenaming} onClick={handleClose} variant="ghost">
            {t("buttonSets.renameDialog.cancel")}
          </Button>
          <Button disabled={isRenaming || !hasNameChanged} onClick={handleRename}>
            {isRenaming
              ? t("buttonSets.renameDialog.renaming")
              : t("buttonSets.renameDialog.rename")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
