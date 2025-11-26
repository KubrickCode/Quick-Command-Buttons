import { useState } from "react";

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
  FormLabel,
} from "~/core";

import { type ButtonConfigDraft, type GroupButton, toDraft, toGroupButton } from "../types";
import { GroupCommandEditor } from "./group-command-editor";

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
  const [localDraft, setLocalDraft] = useState<ButtonConfigDraft>(() => toDraft(group));

  const handleSave = () => {
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
          <DialogTitle>Edit Group: {title}</DialogTitle>
          <DialogDescription className="sr-only">Edit group command settings</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel htmlFor="group-name">Group Name</FormLabel>
              <Input
                id="group-name"
                onChange={(e) => setLocalDraft({ ...localDraft, name: e.target.value })}
                placeholder="Group name"
                value={localDraft.name}
              />
              <Checkbox
                checked={localDraft.executeAll || false}
                id="execute-all"
                label="Execute all commands simultaneously"
                onCheckedChange={(checked) =>
                  setLocalDraft({ ...localDraft, executeAll: !!checked })
                }
              />
            </div>

            <GroupCommandEditor
              commands={localDraft.group || []}
              depth={depth + 1}
              onChange={(commands) => setLocalDraft({ ...localDraft, group: commands })}
              title={`${title} Commands`}
            />
          </div>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCancel} type="button" variant="outline">
            Cancel
          </Button>
          <Button onClick={handleSave} type="button">
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
