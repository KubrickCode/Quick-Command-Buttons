import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Badge, Button } from "~/core";
import { cn } from "~/core/shadcn/utils";

import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useSortableItem } from "../hooks/use-sortable-item";
import { type ButtonConfig } from "../types";
import { parseVSCodeIconName, VSCodeIcon } from "../utils/parse-vscode-icon-name";

type CommandCardProps = {
  command: ButtonConfig;
  id: string;
  index: number;
};

export const CommandCard = ({ command, id, index }: CommandCardProps) => {
  const { deleteCommand } = useVscodeCommand();
  const { openEditForm } = useCommandForm();

  const { attributes, listeners, setNodeRef, style } = useSortableItem(id);
  const { displayText, iconName, spin } = parseVSCodeIconName(command.name);

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4",
        "border border-border rounded-lg bg-background-elevated",
        "transition-all duration-200",
        "hover:border-border-strong hover:bg-hover",
        "hover:shadow-[var(--glow-accent-subtle)]"
      )}
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          aria-label="Drag handle to reorder command"
          className={cn(
            "cursor-grab active:cursor-grabbing",
            "flex items-center justify-center",
            "text-foreground-subtle transition-colors",
            "group-hover:text-foreground-muted"
          )}
          role="button"
          tabIndex={0}
          title="Drag to reorder"
        >
          <GripVertical aria-hidden="true" size={16} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span
              className="flex items-center gap-1.5 font-medium tracking-tight"
              style={{ color: command.color || "var(--foreground)" }}
            >
              {iconName && <VSCodeIcon name={iconName} spin={spin} />}
              {displayText}
            </span>
            {command.shortcut && (
              <Badge className="font-mono text-[10px]" variant="secondary">
                {command.shortcut}
              </Badge>
            )}
          </div>
          <div className="text-sm mt-1">
            {command.group ? (
              <span className="text-accent">{command.group.length} commands</span>
            ) : (
              <code className="font-mono text-xs bg-background-subtle px-1.5 py-0.5 rounded text-foreground-muted">
                {command.command || "No command"}
              </code>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <Button
          aria-label={`Edit command ${command.name}`}
          onClick={() => openEditForm(command, index)}
          size="icon"
          variant="ghost"
        >
          <Pencil aria-hidden="true" size={14} />
        </Button>

        <DeleteConfirmationDialog commandName={command.name} onConfirm={() => deleteCommand(index)}>
          <Button aria-label={`Delete command ${command.name}`} size="icon" variant="ghost">
            <Trash2 aria-hidden="true" className="text-destructive" size={14} />
          </Button>
        </DeleteConfirmationDialog>
      </div>
    </div>
  );
};
