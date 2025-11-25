import { ChevronDown, Download, FileJson, Upload } from "lucide-react";
import { useState } from "react";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/core";

import { ConflictResolutionDialog } from "./conflict-resolution-dialog";
import { MESSAGE_TYPE, TOAST_DURATION } from "../../../shared/constants";
import type { ConfigurationTarget, ExportResult, ImportResult } from "../../../shared/types";
import { toast } from "../core/toast";
import { useWebviewCommunication } from "../hooks/use-webview-communication";

type ImportExportMenuProps = {
  configurationTarget: ConfigurationTarget;
};

export const ImportExportMenu = ({ configurationTarget }: ImportExportMenuProps) => {
  const { sendMessage } = useWebviewCommunication();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [open, setOpen] = useState(false);

  const isLoading = isExporting || isImporting;

  const exportConfiguration = async () => {
    setOpen(false);
    setIsExporting(true);
    try {
      const result = await sendMessage<ExportResult>(MESSAGE_TYPE.EXPORT_CONFIGURATION, {
        target: configurationTarget,
      });

      if (result && result.success) {
        toast.success("Configuration exported", { duration: TOAST_DURATION.SUCCESS });
      } else if (result && result.error) {
        toast.error(result.error, { duration: TOAST_DURATION.ERROR });
      }
    } catch (error) {
      console.error("Failed to export configuration:", error);
      toast.error("Export failed", { duration: TOAST_DURATION.ERROR });
    } finally {
      setIsExporting(false);
    }
  };

  const importConfiguration = async () => {
    setOpen(false);
    setIsImporting(true);
    try {
      const result = await sendMessage<ImportResult>(MESSAGE_TYPE.IMPORT_CONFIGURATION, {
        target: configurationTarget,
      });

      if (!result) {
        toast.error("No response from import", { duration: TOAST_DURATION.ERROR });
        return;
      }

      setImportResult(result);

      if (result.success) {
        if (result.conflictsResolved && result.conflictsResolved > 0) {
          setShowConflictDialog(true);
        } else {
          toast.success(`Imported ${result.importedCount} commands`, {
            duration: TOAST_DURATION.SUCCESS,
          });
        }
      } else if (result.error) {
        toast.error(result.error, { duration: TOAST_DURATION.ERROR });
      }
    } catch (error) {
      console.error("Failed to import configuration:", error);
      toast.error("Import failed", { duration: TOAST_DURATION.ERROR });
    } finally {
      setIsImporting(false);
    }
  };

  const closeConflictDialog = () => {
    setShowConflictDialog(false);
    setImportResult(null);
  };

  const getScopeLabel = (target: ConfigurationTarget) => {
    return target.charAt(0).toUpperCase() + target.slice(1);
  };

  return (
    <>
      <DropdownMenu onOpenChange={setOpen} open={open}>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label="Backup configuration"
            className="btn-interactive"
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <FileJson aria-hidden="true" className="h-4 w-4 mr-2" />
            Backup
            <ChevronDown aria-hidden="true" className="h-3 w-3 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>{getScopeLabel(configurationTarget)} Scope</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isLoading} onClick={exportConfiguration}>
            <Download aria-hidden="true" className="h-4 w-4 mr-2" />
            Export to File
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLoading} onClick={importConfiguration}>
            <Upload aria-hidden="true" className="h-4 w-4 mr-2" />
            Import from File
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConflictResolutionDialog
        importResult={importResult}
        onClose={closeConflictDialog}
        open={showConflictDialog}
      />
    </>
  );
};
