import { GripVertical, Trash2, Folder, Terminal, Edit } from "lucide-react";

import { Button, Input, Checkbox } from "~/core";

import { useCommandEdit } from "../context/command-edit-context.tsx";
import { useSortableItem } from "../hooks/use-sortable-item";
import { type ButtonConfig } from "../types";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

type GroupCommandItemProps = {
  command: ButtonConfig;
  id: string;
  index: number;
  onEditGroup?: () => void;
};

export const GroupCommandItem = ({ command, id, index, onEditGroup }: GroupCommandItemProps) => {
  const isGroup = !!command.group;
  const { deleteCommand, updateCommand } = useCommandEdit();

  const { attributes, listeners, setNodeRef, style } = useSortableItem(id);

  return (
    <div
      className="p-3 rounded border-2 bg-card border-border"
      data-testid="group-command-item"
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center gap-3">
        <div
          {...attributes}
          {...listeners}
          aria-label="Drag handle to reorder command"
          className="cursor-grab active:cursor-grabbing flex items-center justify-center w-6 h-6 text-muted-foreground hover:text-foreground transition-colors"
          role="button"
          tabIndex={0}
          title="Drag to reorder"
        >
          <GripVertical aria-hidden="true" size={16} />
        </div>

        <div
          aria-label={isGroup ? "Group command" : "Single command"}
          className="flex items-center gap-2"
        >
          {isGroup ? (
            <Folder aria-hidden="true" className="text-amber-600 dark:text-amber-400" size={16} />
          ) : (
            <Terminal aria-hidden="true" className="text-green-600 dark:text-green-400" size={16} />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Input
            onChange={(e) => updateCommand(index, { name: e.target.value })}
            placeholder={isGroup ? "Group name" : "Command name"}
            value={command.name}
          />

          {!isGroup && (
            <>
              <Input
                onChange={(e) => updateCommand(index, { command: e.target.value })}
                placeholder="Command (e.g., npm start)"
                value={command.command || ""}
              />
              <Input
                onChange={(e) => updateCommand(index, { terminalName: e.target.value })}
                placeholder="Terminal name (optional)"
                value={command.terminalName || ""}
              />
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Checkbox
                    checked={command.useVsCodeApi || false}
                    id={`vscode-${index}`}
                    label="Use VS Code API"
                    onCheckedChange={(checked) => updateCommand(index, { useVsCodeApi: !!checked })}
                  />
                </div>
                <Input
                  className="flex-1 min-w-0"
                  maxLength={1}
                  onChange={(e) => updateCommand(index, { shortcut: e.target.value })}
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
                onChange={(e) => updateCommand(index, { shortcut: e.target.value })}
                placeholder="Shortcut (optional)"
                value={command.shortcut || ""}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {isGroup && onEditGroup && (
            <Button
              aria-label={`Edit group ${command.name}`}
              className="h-8 px-3"
              onClick={onEditGroup}
              size="sm"
              title="Edit Group"
              type="button"
              variant="ghost"
            >
              <Edit aria-hidden="true" className="mr-1" size={14} />
              Edit
            </Button>
          )}
          <DeleteConfirmationDialog
            commandName={command.name}
            onConfirm={() => deleteCommand(index)}
          >
            <Button
              aria-label={`Delete ${isGroup ? "group" : "command"} ${command.name}`}
              className="h-8 w-8 p-0 [&_svg]:text-foreground-subtle [&_svg]:transition-colors [&_svg]:duration-200 hover:[&_svg]:text-destructive"
              size="sm"
              title="Delete"
              type="button"
              variant="ghost"
            >
              <Trash2 aria-hidden="true" size={14} />
            </Button>
          </DeleteConfirmationDialog>
        </div>
      </div>
    </div>
  );
};
