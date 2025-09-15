import { useState, useCallback } from "react";
import { type ButtonConfig } from "../types";
import {
  Button,
  Checkbox,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  FormLabel,
} from "~/core";
import { GroupCommandList } from "./group-command-list";

type GroupCommandEditorProps = {
  commands: ButtonConfig[];
  onChange: (commands: ButtonConfig[]) => void;
  title?: string;
  depth?: number;
};

type GroupEditDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  group: ButtonConfig;
  onSave: (group: ButtonConfig) => void;
  title: string;
  depth: number;
};

const GroupEditDialog = ({
  isOpen,
  onClose,
  group,
  onSave,
  title,
  depth,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Group: {title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <FormLabel htmlFor="group-name">Group Name</FormLabel>
            <Input
              id="group-name"
              placeholder="Group name"
              value={localGroup.name}
              onChange={(e) =>
                setLocalGroup({ ...localGroup, name: e.target.value })
              }
            />
            <Checkbox
              id="execute-all"
              label="Execute all commands simultaneously"
              checked={localGroup.executeAll || false}
              onCheckedChange={(checked) =>
                setLocalGroup({ ...localGroup, executeAll: !!checked })
              }
            />
          </div>

          <GroupCommandEditor
            commands={localGroup.group || []}
            onChange={(commands) =>
              setLocalGroup({ ...localGroup, group: commands })
            }
            title={`${title} Commands`}
            depth={depth + 1}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const GroupCommandEditor = ({
  commands,
  onChange,
  title,
  depth = 0,
}: GroupCommandEditorProps) => {
  const [editingGroup, setEditingGroup] = useState<{
    index: number;
    group: ButtonConfig;
  } | null>(null);

  const editGroup = useCallback(
    (index: number) => {
      const group = commands[index];
      if (group.group !== undefined) {
        setEditingGroup({ index, group });
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
        onChange={onChange}
        title={title}
        depth={depth}
        onEditGroup={editGroup}
      />

      {editingGroup && (
        <GroupEditDialog
          isOpen={!!editingGroup}
          onClose={() => setEditingGroup(null)}
          group={editingGroup.group}
          onSave={saveEditedGroup}
          title={editingGroup.group.name}
          depth={depth}
        />
      )}
    </div>
  );
};
