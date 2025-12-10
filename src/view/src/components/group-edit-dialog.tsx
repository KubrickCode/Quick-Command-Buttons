import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  Checkbox,
  Input,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  FormField,
  FormLabel,
} from "~/core";

import { type ButtonConfigDraft, type GroupButton, toDraft, toGroupButton } from "../types";
import { GroupCommandEditor } from "./group-command-editor";
import { type GroupValidationError, validateGroupCommands } from "../utils/group-validation";

type GroupEditDialogProps = {
  depth: number;
  group: GroupButton;
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: GroupButton) => void;
  title: string;
};

export const GroupEditDialog = ({
  depth,
  group,
  isOpen,
  onClose,
  onSave,
  title,
}: GroupEditDialogProps) => {
  const { t } = useTranslation();
  const [localDraft, setLocalDraft] = useState<ButtonConfigDraft>(() => toDraft(group));
  const [hasError, setHasError] = useState(false);
  const [groupError, setGroupError] = useState<GroupValidationError>(null);

  const isNameEmpty = !localDraft.name || localDraft.name.trim() === "";

  useEffect(() => {
    if (isOpen) {
      setLocalDraft(toDraft(group));
      setHasError(false);
      setGroupError(null);
    }
  }, [isOpen, group]);

  const getGroupErrorMessage = (): string | undefined => {
    if (!groupError) return undefined;
    switch (groupError) {
      case "empty":
        return t("commandForm.errors.groupEmpty");
      case "emptyName":
        return t("commandForm.errors.groupNameRequired");
      case "emptyCommand":
        return t("commandForm.errors.groupCommandRequired");
      case "emptyNestedGroup":
        return t("commandForm.errors.nestedGroupEmpty");
      case "duplicateShortcut":
        return t("commandForm.errors.duplicateShortcut");
    }
  };

  const handleSave = () => {
    const commands = localDraft.group || [];
    const validationError = validateGroupCommands(commands);

    if (isNameEmpty || validationError) {
      setHasError(true);
      setGroupError(validationError);
      return;
    }

    setHasError(false);
    setGroupError(null);
    onSave(toGroupButton(localDraft));
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog onOpenChange={onClose} open={isOpen}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{t("groupEditDialog.title", { title })}</DialogTitle>
          <DialogDescription className="sr-only">
            {t("groupEditDialog.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel htmlFor="group-name">{t("groupEditDialog.groupName")}</FormLabel>
              <Input
                error={hasError && isNameEmpty}
                errorMessage={
                  hasError && isNameEmpty ? t("groupEditDialog.errors.nameRequired") : undefined
                }
                id="group-name"
                onChange={(e) => {
                  const newName = e.target.value;
                  setLocalDraft({ ...localDraft, name: newName });
                  if (hasError && newName.trim() !== "") {
                    setHasError(false);
                  }
                }}
                placeholder={t("groupEditDialog.groupNamePlaceholder")}
                value={localDraft.name}
              />
              <Checkbox
                checked={localDraft.executeAll || false}
                id="execute-all"
                label={t("groupEditDialog.executeAll")}
                onCheckedChange={(checked) =>
                  setLocalDraft({ ...localDraft, executeAll: !!checked })
                }
              />
            </div>

            <FormField
              error={!!groupError}
              errorMessage={getGroupErrorMessage()}
              id="group-commands"
            >
              <GroupCommandEditor
                commands={localDraft.group || []}
                depth={depth + 1}
                hasError={hasError}
                onChange={(commands) => {
                  setLocalDraft({ ...localDraft, group: commands });
                  if (groupError) setGroupError(null);
                }}
                title={t("groupEditDialog.commands", { title })}
              />
            </FormField>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCancel} type="button" variant="outline">
            {t("groupEditDialog.cancel")}
          </Button>
          <Button onClick={handleSave} type="button">
            {t("groupEditDialog.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
