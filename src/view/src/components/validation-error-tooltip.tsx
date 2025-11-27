import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { ValidationError } from "../../../shared/types";
import { useVscodeCommand } from "../context/vscode-command-context";
import { Button } from "../core/button";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../core/dialog";
import { formatPath } from "../utils/validation-path";

type ValidationErrorTooltipProps = {
  buttonId: string;
  error: ValidationError;
};

export const ValidationErrorTooltip = ({ buttonId, error }: ValidationErrorTooltipProps) => {
  const { t } = useTranslation();
  const { removeCommandFromButton, removeGroupFromButton } = useVscodeCommand();
  const [open, setOpen] = useState(false);

  const handleRemoveCommand = () => {
    removeCommandFromButton(buttonId, error);
    setOpen(false);
  };

  const handleRemoveGroup = () => {
    removeGroupFromButton(buttonId, error);
    setOpen(false);
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button
          aria-label="View validation error"
          className="text-destructive hover:text-destructive"
          size="icon"
          variant="ghost"
        >
          <AlertTriangle aria-hidden="true" size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {t("validationError.title")}
          </DialogTitle>
          <DialogDescription>{t("validationError.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground-muted">
                {t("validationError.buttonName")}
              </p>
              <p className="text-sm font-semibold">{error.buttonName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-muted">
                {t("validationError.location")}
              </p>
              <p className="text-sm font-mono bg-background-subtle px-2 py-1 rounded">
                {formatPath(error.path)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-muted">
                {t("validationError.issue")}
              </p>
              <p className="text-sm">{error.message}</p>
            </div>
            {error.rawCommand && (
              <div>
                <p className="text-sm font-medium text-foreground-muted">
                  {t("validationError.currentCommand")}
                </p>
                <code className="text-xs font-mono bg-background-subtle px-2 py-1 rounded block truncate">
                  {error.rawCommand}
                </code>
              </div>
            )}
            {error.rawGroup && error.rawGroup.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground-muted">
                  {t("validationError.currentGroup")}
                </p>
                <p className="text-sm">
                  {t("validationError.nestedCommands", { count: error.rawGroup.length })}
                </p>
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            className="flex-1"
            disabled={!error.rawGroup || error.rawGroup.length === 0}
            onClick={handleRemoveCommand}
            variant="outline"
          >
            {t("validationError.keepGroupOnly")}
          </Button>
          <Button
            className="flex-1"
            disabled={!error.rawCommand}
            onClick={handleRemoveGroup}
            variant="outline"
          >
            {t("validationError.keepCommandOnly")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
