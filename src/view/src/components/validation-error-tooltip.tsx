import { AlertTriangle } from "lucide-react";
import { useState } from "react";

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
            Configuration Issue
          </DialogTitle>
          <DialogDescription>
            This button has an invalid configuration that needs to be fixed.
          </DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground-muted">Button Name</p>
              <p className="text-sm font-semibold">{error.buttonName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-muted">Location</p>
              <p className="text-sm font-mono bg-background-subtle px-2 py-1 rounded">
                {formatPath(error.path)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground-muted">Issue</p>
              <p className="text-sm">{error.message}</p>
            </div>
            {error.rawCommand && (
              <div>
                <p className="text-sm font-medium text-foreground-muted">Current Command</p>
                <code className="text-xs font-mono bg-background-subtle px-2 py-1 rounded block truncate">
                  {error.rawCommand}
                </code>
              </div>
            )}
            {error.rawGroup && error.rawGroup.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground-muted">Current Group</p>
                <p className="text-sm">{error.rawGroup.length} nested command(s)</p>
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
            Keep Group Only
          </Button>
          <Button
            className="flex-1"
            disabled={!error.rawCommand}
            onClick={handleRemoveGroup}
            variant="outline"
          >
            Keep Command Only
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
