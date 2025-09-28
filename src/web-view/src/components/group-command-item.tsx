import {
  GripVertical,
  Trash2,
  Folder,
  Terminal,
  Edit,
} from "lucide-react";
import { type ButtonConfig } from "../types";
import { Button, Input, Checkbox } from "~/core";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useSortableItem } from "../hooks/use-sortable-item";

type GroupCommandItemProps = {
  id: string;
  command: ButtonConfig;
  index: number;
  onUpdate: (index: number, updates: Partial<ButtonConfig>) => void;
  onDelete: (index: number) => void;
  onEditGroup?: () => void;
};

export const GroupCommandItem = ({
  id,
  command,
  index,
  onUpdate,
  onDelete,
  onEditGroup,
}: GroupCommandItemProps) => {
  const isGroup = !!command.group;

  const { attributes, listeners, setNodeRef, style } = useSortableItem(id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded border-2 bg-card border-border"
    >
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
            <Folder size={16} className="text-amber-600 dark:text-amber-400" />
          ) : (
            <Terminal size={16} className="text-green-600 dark:text-green-400" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Input
            placeholder={isGroup ? "Group name" : "Command name"}
            value={command.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
          />

          {!isGroup && (
            <>
              <Input
                placeholder="Command (e.g., npm start)"
                value={command.command || ""}
                onChange={(e) => onUpdate(index, { command: e.target.value })}
              />
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Checkbox
                    id={`vscode-${index}`}
                    label="Use VS Code API"
                    checked={command.useVsCodeApi || false}
                    onCheckedChange={(checked) =>
                      onUpdate(index, { useVsCodeApi: !!checked })
                    }
                  />
                </div>
                <Input
                  placeholder="Shortcut (optional)"
                  value={command.shortcut || ""}
                  onChange={(e) => onUpdate(index, { shortcut: e.target.value })}
                  maxLength={1}
                  className="flex-1 min-w-0"
                />
              </div>
            </>
          )}

          {isGroup && (
            <div className="flex items-center gap-4">
              <Input
                placeholder="Shortcut (optional)"
                value={command.shortcut || ""}
                onChange={(e) => onUpdate(index, { shortcut: e.target.value })}
                maxLength={1}
                className="flex-1"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isGroup && onEditGroup && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onEditGroup}
              className="h-8 px-3"
              title="Edit Group"
            >
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
          )}
          <DeleteConfirmationDialog
            commandName={command.name}
            onConfirm={() => onDelete(index)}
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="Delete"
            >
              <Trash2 size={14} />
            </Button>
          </DeleteConfirmationDialog>
        </div>
      </div>
    </div>
  );
};
