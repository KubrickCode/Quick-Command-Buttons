import { type ButtonConfig } from "./types";
import { Button } from "~/core";

type ButtonListProps = {
  buttons: ButtonConfig[];
  onEdit: (button: ButtonConfig, index: number) => void;
  onDelete: (index: number) => void;
};

export const ButtonList = ({ buttons, onEdit, onDelete }: ButtonListProps) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border mb-6">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">
          Current Buttons
        </h2>
        {buttons.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No buttons configured. Add your first button to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {buttons.map((button, index) => (
              <ButtonCard
                key={index}
                button={button}
                onEdit={() => onEdit(button, index)}
                onDelete={() => onDelete(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
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
            <span className="px-2 py-1 bg-muted text-muted-foreground text-sm rounded font-mono">
              {button.shortcut}
            </span>
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          title="Edit button"
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          title="Delete button"
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
      </div>
    </div>
  );
};
