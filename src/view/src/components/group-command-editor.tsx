import { useState, useCallback } from "react";

import { type ButtonConfig } from "../types";
import { GroupCommandList } from "./group-command-list";
import { GroupEditDialog } from "./group-edit-dialog";

type GroupCommandEditorProps = {
  commands: ButtonConfig[];
  depth?: number;
  onChange: (commands: ButtonConfig[]) => void;
  title?: string;
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
