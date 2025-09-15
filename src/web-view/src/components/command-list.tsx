import { GripVertical } from "lucide-react";
import { type ButtonConfig } from "../types";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useCommandForm } from "../context/command-form-context.tsx";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/core";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { useSortableList } from "../hooks/use-sortable-list";
import { useSortableItem } from "../hooks/use-sortable-item";

export const CommandList = () => {
  const { commands, reorderCommands } = useVscodeCommand();

  const { SortableWrapper } = useSortableList({
    items: commands,
    onReorder: reorderCommands,
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Current Commands</CardTitle>
      </CardHeader>
      <CardContent>
        {commands.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No commands configured. Add your first command to get started.
          </p>
        ) : (
          <SortableWrapper>
            <div className="space-y-3">
              {commands.map((command, index) => (
                <CommandCard
                  key={index}
                  id={`${index}`}
                  command={command}
                  index={index}
                />
              ))}
            </div>
          </SortableWrapper>
        )}
      </CardContent>
    </Card>
  );
};

type CommandCardProps = {
  id: string;
  command: ButtonConfig;
  index: number;
};

const CommandCard = ({ id, command, index }: CommandCardProps) => {
  const { deleteCommand } = useVscodeCommand();
  const { openEditForm } = useCommandForm();

  const { attributes, listeners, setNodeRef, style } = useSortableItem(id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-border/80 transition-colors"
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
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
              <Badge variant="secondary" className="font-mono">
                {command.shortcut}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-1">
            {command.group ? (
              <span className="text-primary">
                Group with {command.group.length} commands
              </span>
            ) : (
              <span className="font-mono">{command.command || "No command"}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openEditForm(command, index)}
          className="p-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Button>

        <DeleteConfirmationDialog
          commandName={command.name}
          onConfirm={() => deleteCommand(index)}
        >
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:text-destructive"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </Button>
        </DeleteConfirmationDialog>
      </div>
    </div>
  );
};
