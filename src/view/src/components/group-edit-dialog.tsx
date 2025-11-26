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

import { type ButtonConfig } from "../types";
import { GroupCommandEditor } from "./group-command-editor";

type GroupEditDialogProps = {
  depth: number;
  group: ButtonConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: ButtonConfig) => void;
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
  const [localGroup, setLocalGroup] = useState(group);

  const handleSave = () => {
    onSave(localGroup);
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
                onChange={(e) => setLocalGroup({ ...localGroup, name: e.target.value })}
                placeholder="Group name"
                value={localGroup.name}
              />
              <Checkbox
                checked={localGroup.executeAll || false}
                id="execute-all"
                label="Execute all commands simultaneously"
                onCheckedChange={(checked) =>
                  setLocalGroup({ ...localGroup, executeAll: !!checked })
                }
              />
            </div>

            <GroupCommandEditor
              commands={localGroup.group || []}
              depth={depth + 1}
              onChange={(commands) => setLocalGroup({ ...localGroup, group: commands })}
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
