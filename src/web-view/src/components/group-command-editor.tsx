import { useState, useCallback } from "react";

import {
  Button,
  Checkbox,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  FormLabel,
} from "~/core";

import { type ButtonConfig } from "../types";
import { GroupCommandList } from "./group-command-list";

type GroupCommandEditorProps = {
  commands: ButtonConfig[];
  depth?: number;
  onChange: (commands: ButtonConfig[]) => void;
  title?: string;
};

type GroupEditDialogProps = {
  depth: number;
  group: ButtonConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: ButtonConfig) => void;
  title: string;
};

const GroupEditDialog = ({
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

export const GroupCommandEditor = ({
  commands,
  depth = 0,
  onChange,
  title,
}: GroupCommandEditorProps) => {
  const [editingGroup, setEditingGroup] = useState<{
    group: ButtonConfig;
    index: number;
  } | null>(null);

  const editGroup = useCallback(
    (index: number) => {
      const group = commands[index];
      if (group.group !== undefined) {
        setEditingGroup({ group, index });
      }
    },
    [commands]
  );

  const saveEditedGroup = useCallback(
    (updatedGroup: ButtonConfig) => {
      if (editingGroup) {
        const newCommands = [...commands];
        newCommands[editingGroup.index] = {
          ...newCommands[editingGroup.index],
          ...updatedGroup,
        };
        onChange(newCommands);
      }
    },
    [editingGroup, commands, onChange]
  );

  return (
    <div className="space-y-4">
      <GroupCommandList
        commands={commands}
        depth={depth}
        onChange={onChange}
        onEditGroup={editGroup}
        title={title}
      />

      {editingGroup && (
        <GroupEditDialog
          depth={depth}
          group={editingGroup.group}
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          onSave={saveEditedGroup}
          title={editingGroup.group.name}
        />
      )}
    </div>
  );
};
