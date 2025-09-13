import { type ButtonConfig } from "../types";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/core";

type ButtonListProps = {
  commands: ButtonConfig[];
  onEdit: (command: ButtonConfig, index: number) => void;
  onDelete: (index: number) => void;
};

export const ButtonList = ({ commands, onEdit, onDelete }: ButtonListProps) => {
  return (
    <TooltipProvider>
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
            <div className="space-y-3">
              {commands.map((command, index) => (
                <ButtonCard
                  key={index}
                  button={command}
                  onEdit={() => onEdit(command, index)}
                  onDelete={() => onDelete(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

type ButtonCardProps = {
  button: ButtonConfig;
  onDelete: () => void;
  onEdit: () => void;
};

const ButtonCard = ({ button, onEdit, onDelete }: ButtonCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:border-border/80 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-3">
          <span
            className="font-medium"
            style={{ color: button.color || "hsl(var(--foreground))" }}
          >
            {button.name}
          </span>
          {button.shortcut && (
            <Badge variant="secondary" className="font-mono">
              {button.shortcut}
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-1">
          {button.group ? (
            <span className="text-primary">
              Group with {button.group.length} commands
            </span>
          ) : (
            <span className="font-mono">{button.command || "No command"}</span>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onEdit} className="p-2">
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit command</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
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
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete command</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
