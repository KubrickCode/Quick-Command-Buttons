import { AlertCircle, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/core";

import type { ImportResult } from "../../../shared/types";
import {
  Dialog,
  DialogBody,
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
  const { t } = useTranslation();

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
                {t("conflictResolution.titleWithConflicts")}
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                {t("conflictResolution.titleSuccess")}
              </>
            )}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {t("conflictResolution.description")}
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          {hasConflicts ? (
            <div className="space-y-2">
              <p>
                {t("conflictResolution.successWithConflicts", {
                  count: importResult.conflictsResolved,
                })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("conflictResolution.conflictDetails")}
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
                {t("conflictResolution.successNoConflicts", {
                  count: importResult.importedCount,
                })}
              </p>
              {importResult.backupPath && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("conflictResolution.backupCreated")}
                  </p>
                  <p className="text-xs font-mono bg-muted p-2 rounded mt-1 break-all">
                    {importResult.backupPath}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={onClose}>{t("conflictResolution.ok")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
