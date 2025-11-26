import { useCallback } from "react";

import { CommandEditProvider, useCommandEdit } from "../context/command-edit-context.tsx";
import { type ButtonConfig, isGroupButton } from "../types";
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
  return (
    <CommandEditProvider commands={commands} onCommandsChange={onChange}>
      <GroupCommandEditorContent depth={depth} title={title} />
    </CommandEditProvider>
  );
};

const GroupCommandEditorContent = ({ depth = 0, title }: { depth?: number; title?: string }) => {
  const { closeGroupEditor, commands, editingGroup, openGroupEditor, saveGroup } = useCommandEdit();

  const editGroup = useCallback(
    (index: number) => {
      const group = commands[index];
      if (isGroupButton(group)) {
        openGroupEditor(group, index, depth);
      }
    },
    [commands, depth, openGroupEditor]
  );

  return (
    <div className="space-y-4">
      <GroupCommandList depth={depth} onEditGroup={editGroup}>
        {title && <GroupCommandList.Title>{title}</GroupCommandList.Title>}
        <GroupCommandList.Items />
        <GroupCommandList.Actions />
      </GroupCommandList>

      {editingGroup && (
        <GroupEditDialog
          depth={editingGroup.depth}
          group={editingGroup.group}
          isOpen={!!editingGroup}
          onClose={closeGroupEditor}
          onSave={saveGroup}
          title={editingGroup.group.name}
        />
      )}
    </div>
  );
};
