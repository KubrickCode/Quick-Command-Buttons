import { GripVertical } from "lucide-react";

import { Badge, Button } from "~/core";

import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useSortableItem } from "../hooks/use-sortable-item";
import { type ButtonConfig } from "../types";

type CommandCardProps = {
  command: ButtonConfig;
  id: string;
  index: number;
};

export const CommandCard = ({ command, id, index }: CommandCardProps) => {
  const { deleteCommand } = useVscodeCommand();
  const { openEditForm } = useCommandForm();

  const { attributes, listeners, setNodeRef, style } = useSortableItem(id);

  return (
    <div
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-border/80 transition-colors"
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          aria-label="Drag handle to reorder command"
          className="cursor-grab active:cursor-grabbing flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          role="button"
          tabIndex={0}
          title="Drag to reorder"
        >
          <GripVertical aria-hidden="true" size={16} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span
              className="font-medium"
              style={{ color: command.color || "hsl(var(--foreground))" }}
            >
              {command.name}
            </span>
            {command.shortcut && (
              <Badge className="font-mono" variant="secondary">
                {command.shortcut}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {command.group ? (
              <span className="text-primary">Group with {command.group.length} commands</span>
            ) : (
              <span className="font-mono">{command.command || "No command"}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          aria-label={`Edit command ${command.name}`}
          className="p-2"
          onClick={() => openEditForm(command, index)}
          size="sm"
          variant="ghost"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </Button>

        <DeleteConfirmationDialog commandName={command.name} onConfirm={() => deleteCommand(index)}>
          <Button
            aria-label={`Delete command ${command.name}`}
            className="p-2"
            size="sm"
            variant="ghost"
          >
            <svg
              aria-hidden="true"
              className="w-4 h-4 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </Button>
        </DeleteConfirmationDialog>
      </div>
    </div>
  );
};
