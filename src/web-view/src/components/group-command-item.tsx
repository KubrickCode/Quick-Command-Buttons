import { GripVertical, Trash2, Folder, Terminal, Edit } from "lucide-react";

import { Button, Input, Checkbox } from "~/core";

import { type ButtonConfig } from "../types";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useSortableItem } from "../hooks/use-sortable-item";

type GroupCommandItemProps = {
  command: ButtonConfig;
  id: string;
  index: number;
  onDelete: (index: number) => void;
  onEditGroup?: () => void;
  onUpdate: (index: number, updates: Partial<ButtonConfig>) => void;
};

export const GroupCommandItem = ({
  command,
  id,
  index,
  onDelete,
  onEditGroup,
  onUpdate,
}: GroupCommandItemProps) => {
  const isGroup = !!command.group;

  const { attributes, listeners, setNodeRef, style } = useSortableItem(id);

  return (
    <div className="p-3 rounded border-2 bg-card border-border" ref={setNodeRef} style={style}>
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </div>

        <div className="flex items-center gap-2">
          {isGroup ? (
            <Folder className="text-amber-600 dark:text-amber-400" size={16} />
          ) : (
            <Terminal className="text-green-600 dark:text-green-400" size={16} />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Input
            onChange={(e) => onUpdate(index, { name: e.target.value })}
            placeholder={isGroup ? "Group name" : "Command name"}
            value={command.name}
          />

          {!isGroup && (
            <>
              <Input
                onChange={(e) => onUpdate(index, { command: e.target.value })}
                placeholder="Command (e.g., npm start)"
                value={command.command || ""}
              />
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={command.useVsCodeApi || false}
                    id={`vscode-${index}`}
                    label="Use VS Code API"
                    onCheckedChange={(checked) => onUpdate(index, { useVsCodeApi: !!checked })}
                  />
                </div>
                <Input
                  className="flex-1 min-w-0"
                  maxLength={1}
                  onChange={(e) => onUpdate(index, { shortcut: e.target.value })}
                  placeholder="Shortcut (optional)"
                  value={command.shortcut || ""}
                />
              </div>
            </>
          )}

          {isGroup && (
            <div className="flex items-center gap-4">
              <Input
                className="flex-1"
                maxLength={1}
                onChange={(e) => onUpdate(index, { shortcut: e.target.value })}
                placeholder="Shortcut (optional)"
                value={command.shortcut || ""}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isGroup && onEditGroup && (
            <Button
              className="h-8 px-3"
              onClick={onEditGroup}
              size="sm"
              title="Edit Group"
              type="button"
              variant="ghost"
            >
              <Edit className="mr-1" size={14} />
              Edit
            </Button>
          )}
          <DeleteConfirmationDialog commandName={command.name} onConfirm={() => onDelete(index)}>
            <Button
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              size="sm"
              title="Delete"
              type="button"
              variant="ghost"
            >
              <Trash2 size={14} />
            </Button>
          </DeleteConfirmationDialog>
        </div>
      </div>
    </div>
  );
};
