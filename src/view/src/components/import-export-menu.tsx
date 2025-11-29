import { ChevronDown, Download, FileJson, Upload } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

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
import { ImportPreviewDialog } from "./import-preview-dialog";
import { MESSAGE_TYPE, TOAST_DURATION } from "../../../shared/constants";
import type {
  ConfigurationTarget,
  ExportResult,
  ImportPreviewData,
  ImportPreviewResult,
  ImportResult,
  ImportStrategy,
} from "../../../shared/types";
import { toast } from "../core/toast";
import { useWebviewCommunication } from "../hooks/use-webview-communication";

type ImportExportMenuProps = {
  configurationTarget: ConfigurationTarget;
};

export const ImportExportMenu = ({ configurationTarget }: ImportExportMenuProps) => {
  const { t } = useTranslation();
  const { sendMessage } = useWebviewCommunication();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<ImportPreviewData | null>(null);
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
        toast.success(t("importExport.exportSuccess"), { duration: TOAST_DURATION.SUCCESS });
      } else if (result && result.error) {
        toast.error(result.error, { duration: TOAST_DURATION.ERROR });
      }
    } catch (error) {
      console.error("Failed to export configuration:", error);
      toast.error(t("importExport.exportFailed"), { duration: TOAST_DURATION.ERROR });
    } finally {
      setIsExporting(false);
    }
  };

  const previewImport = async () => {
    setOpen(false);
    setIsImporting(true);
    try {
      const result = await sendMessage<ImportPreviewResult>(MESSAGE_TYPE.PREVIEW_IMPORT, {
        target: configurationTarget,
      });

      if (!result) {
        return;
      }

      if (result.success && result.preview) {
        setPreviewData(result.preview);
        setShowPreviewDialog(true);
      } else if (result.error) {
        toast.error(result.error, { duration: TOAST_DURATION.ERROR });
      }
    } catch (error) {
      console.error("Failed to preview import:", error);
      toast.error(t("importExport.importPreviewFailed"), { duration: TOAST_DURATION.ERROR });
    } finally {
      setIsImporting(false);
    }
  };

  const confirmImport = async (strategy: ImportStrategy) => {
    if (!previewData) return;

    setIsConfirming(true);
    try {
      const result = await sendMessage<ImportResult>(MESSAGE_TYPE.CONFIRM_IMPORT, {
        preview: previewData,
        strategy,
      });

      if (!result) {
        toast.error(t("importExport.noResponse"), { duration: TOAST_DURATION.ERROR });
        return;
      }

      setShowPreviewDialog(false);
      setPreviewData(null);
      setImportResult(result);

      if (result.success) {
        if (result.conflictsResolved && result.conflictsResolved > 0) {
          setShowConflictDialog(true);
        } else {
          toast.success(t("importExport.importedCommands", { count: result.importedCount }), {
            duration: TOAST_DURATION.SUCCESS,
          });
        }
      } else if (result.error) {
        toast.error(result.error, { duration: TOAST_DURATION.ERROR });
      }
    } catch (error) {
      console.error("Failed to confirm import:", error);
      toast.error(t("importExport.importFailed"), { duration: TOAST_DURATION.ERROR });
    } finally {
      setIsConfirming(false);
    }
  };

  const closePreviewDialog = () => {
    setShowPreviewDialog(false);
    setPreviewData(null);
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
            aria-label={t("importExport.backup")}
            className="btn-interactive"
            disabled={isLoading}
            size="sm"
            variant="outline"
          >
            <FileJson aria-hidden="true" className="h-4 w-4 mr-2" />
            {t("importExport.backup")}
            <ChevronDown aria-hidden="true" className="h-3 w-3 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>
            {t("importExport.scope", { scope: getScopeLabel(configurationTarget) })}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isLoading} onClick={exportConfiguration}>
            <Download aria-hidden="true" className="h-4 w-4 mr-2" />
            {t("importExport.exportToFile")}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isLoading} onClick={previewImport}>
            <Upload aria-hidden="true" className="h-4 w-4 mr-2" />
            {t("importExport.importFromFile")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ImportPreviewDialog
        isConfirming={isConfirming}
        onClose={closePreviewDialog}
        onConfirm={confirmImport}
        open={showPreviewDialog}
        preview={previewData}
      />

      <ConflictResolutionDialog
        importResult={importResult}
        onClose={closeConflictDialog}
        open={showConflictDialog}
      />
    </>
  );
};
