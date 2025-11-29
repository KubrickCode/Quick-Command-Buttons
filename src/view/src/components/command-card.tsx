import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { Badge, Button } from "~/core";
import { cn } from "~/core/shadcn/utils";

import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { ValidationErrorTooltip } from "./validation-error-tooltip";
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
  const { t } = useTranslation();
  const { deleteCommand, validationErrors } = useVscodeCommand();
  const { openEditForm } = useCommandForm();

  const { attributes, listeners, setNodeRef, style } = useSortableItem(id);
  const { displayText, iconName, spin } = parseVSCodeIconName(command.name);

  const validationError = useMemo(() => {
    return validationErrors.find(
      (e) => e.buttonId === command.id || e.path[0] === `buttons[${index}]`
    );
  }, [command.id, index, validationErrors]);
  const hasValidationError = Boolean(validationError);

  return (
    <div
      className={cn(
        "group flex items-center justify-between p-4",
        "rounded-lg bg-background-elevated",
        "shadow-[var(--shadow-float)]",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-1.5 hover:scale-[1.008]",
        "hover:shadow-[var(--shadow-float-hover),var(--glow-accent-subtle)]",
        "hover:bg-gradient-to-br hover:from-transparent hover:to-accent/5",
        hasValidationError && "ring-2 ring-destructive bg-destructive/5"
      )}
      data-testid="command-card"
      ref={setNodeRef}
      style={style}
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          aria-label={t("commandCard.dragToReorder")}
          className={cn(
            "cursor-grab active:cursor-grabbing",
            "flex items-center justify-center",
            "text-foreground-subtle transition-colors",
            "group-hover:text-foreground-muted"
          )}
          role="button"
          tabIndex={0}
          title={t("commandCard.dragToReorder")}
        >
          <GripVertical aria-hidden="true" size={16} />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <span
              className="flex items-center gap-1.5 font-medium tracking-tight"
              data-testid="command-name"
              style={{ color: command.color || "var(--foreground)" }}
            >
              {iconName && <VSCodeIcon name={iconName} spin={spin} />}
              {displayText}
            </span>
            {command.shortcut && <Badge variant="kbd">{command.shortcut}</Badge>}
          </div>
          <div className="text-sm mt-1">
            {command.group ? (
              <span className="text-foreground-muted">
                {command.group.length} {t("commandCard.commands")}
              </span>
            ) : (
              <code className="font-mono text-xs bg-background-subtle px-1.5 py-0.5 rounded text-foreground-muted">
                {command.command || t("commandCard.noCommand")}
              </code>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        {hasValidationError && validationError && (
          <ValidationErrorTooltip buttonId={command.id} error={validationError} />
        )}
        <Button
          aria-label={t("commandCard.editCommand", { name: command.name })}
          onClick={() => openEditForm(command, index)}
          size="icon"
          variant="ghost"
        >
          <Pencil aria-hidden="true" size={14} />
        </Button>

        <DeleteConfirmationDialog commandName={command.name} onConfirm={() => deleteCommand(index)}>
          <Button
            aria-label={t("commandCard.deleteCommand", { name: command.name })}
            className="[&_svg]:text-foreground-subtle [&_svg]:transition-colors [&_svg]:duration-200 hover:[&_svg]:text-destructive"
            size="icon"
            title={t("commandCard.deleteCommand", { name: command.name })}
            variant="ghost"
          >
            <Trash2 aria-hidden="true" size={14} />
          </Button>
        </DeleteConfirmationDialog>
      </div>
    </div>
  );
};
