import { AlertCircle, CheckCircle } from "lucide-react";

import { Button } from "~/core";

import type { ImportResult } from "../../../shared/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../core/dialog";

type ConflictResolutionDialogProps = {
  importResult: ImportResult | null;
  onClose: () => void;
  open: boolean;
};

export const ConflictResolutionDialog = ({
  importResult,
  onClose,
  open,
}: ConflictResolutionDialogProps) => {
  if (!importResult || !importResult.success) {
    return null;
  }

  const hasConflicts = importResult.conflictsResolved && importResult.conflictsResolved > 0;

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {hasConflicts ? (
              <>
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Import Completed with Conflicts
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                Import Completed
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {hasConflicts ? (
              <div className="space-y-2">
                <p>
                  Your configuration has been imported successfully.{" "}
                  {importResult.conflictsResolved} conflict(s) were resolved using the merge
                  strategy.
                </p>
                <p className="text-sm text-muted-foreground">
                  Existing commands with the same name were updated with imported values. A backup
                  has been created at:
                </p>
                {importResult.backupPath && (
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                    {importResult.backupPath}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p>
                  Your configuration has been imported successfully. {importResult.importedCount}{" "}
                  item(s) were added.
                </p>
                {importResult.backupPath && (
                  <div>
                    <p className="text-sm text-muted-foreground">A backup has been created at:</p>
                    <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                      {importResult.backupPath}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={onClose}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
