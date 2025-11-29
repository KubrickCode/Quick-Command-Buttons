import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileDown,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  RadioGroup,
  RadioGroupItem,
} from "~/core";
import { Label } from "~/core/label";

import type {
  ButtonConfigWithOptionalId,
  ImportAnalysis,
  ImportPreviewData,
  ImportStrategy,
  ShortcutConflict,
} from "../../../shared/types";

type ImportPreviewDialogProps = {
  isConfirming: boolean;
  onClose: () => void;
  onConfirm: (strategy: ImportStrategy) => void;
  open: boolean;
  preview: ImportPreviewData | null;
};

type CollapsibleSectionProps = {
  children: React.ReactNode;
  count: number;
  defaultOpen?: boolean;
  icon: React.ReactNode;
  title: string;
};

const CollapsibleSection = ({
  children,
  count,
  defaultOpen = false,
  icon,
  title,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  if (count === 0) return null;

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden">
      <button
        aria-controls={contentId}
        aria-expanded={isOpen}
        className="flex items-center gap-2 w-full px-4 py-3 bg-background-subtle/50 hover:bg-background-subtle transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-foreground-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-foreground-muted" />
        )}
        {icon}
        <span className="font-medium">{title}</span>
        <span className="ml-auto text-sm text-foreground-muted">({count})</span>
      </button>
      {isOpen && (
        <div className="px-4 py-3 space-y-2 bg-background-elevated" id={contentId}>
          {children}
        </div>
      )}
    </div>
  );
};

const ButtonItem = ({ button }: { button: ButtonConfigWithOptionalId }) => {
  const isGroup = button.group && button.group.length > 0;

  return (
    <div className="flex items-center gap-2 text-sm">
      <code className="px-2 py-0.5 bg-muted rounded text-xs font-mono">{button.name}</code>
      {isGroup && (
        <span className="text-xs text-foreground-muted">({button.group?.length} commands)</span>
      )}
      {button.command && (
        <span className="text-xs text-foreground-muted truncate max-w-[200px]">
          {button.command}
        </span>
      )}
    </div>
  );
};

const AnalysisSummary = ({ analysis }: { analysis: ImportAnalysis }) => {
  const { t } = useTranslation();
  const total = analysis.added.length + analysis.modified.length + analysis.unchanged.length;

  return (
    <div className="flex flex-wrap gap-4 text-sm">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-green-500" />
        <span>
          {analysis.added.length} {t("importPreview.added")}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <span>
          {analysis.modified.length} {t("importPreview.modified")}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
        <span>
          {analysis.unchanged.length} {t("importPreview.unchanged")}
        </span>
      </div>
      {analysis.shortcutConflicts.length > 0 && (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>
            {analysis.shortcutConflicts.length} {t("importPreview.shortcutConflicts")}
          </span>
        </div>
      )}
      <div className="ml-auto text-foreground-muted">
        {total} {t("importPreview.total")}
      </div>
    </div>
  );
};

const ShortcutConflictItem = ({ conflict }: { conflict: ShortcutConflict }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2">
        <code className="px-2 py-0.5 bg-red-500/20 rounded text-xs font-mono text-red-400">
          {conflict.shortcut}
        </code>
        <span className="text-xs text-foreground-muted">{t("importPreview.usedBy")}</span>
      </div>
      <div className="ml-4 space-y-1">
        {conflict.buttons.map((btn, idx) => (
          <div
            className="flex items-center gap-2 text-xs"
            key={btn.id ?? `${btn.source}-${btn.name}-${idx}`}
          >
            <span className={btn.source === "existing" ? "text-blue-400" : "text-green-400"}>
              [
              {btn.source === "existing"
                ? t("importPreview.existing")
                : t("importPreview.imported")}
              ]
            </span>
            <span>{btn.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const ImportPreviewDialog = ({
  isConfirming,
  onClose,
  onConfirm,
  open,
  preview,
}: ImportPreviewDialogProps) => {
  const { t } = useTranslation();
  const [strategy, setStrategy] = useState<ImportStrategy>("merge");

  // Reset strategy to default when dialog opens
  useEffect(() => {
    if (open) {
      setStrategy("merge");
    }
  }, [open]);

  if (!preview) return null;

  const { analysis } = preview;
  const hasChanges = analysis.added.length > 0 || analysis.modified.length > 0;

  const handleConfirm = () => {
    onConfirm(strategy);
  };

  return (
    <Dialog onOpenChange={onClose} open={open}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            {t("importPreview.title")}
          </DialogTitle>
          <DialogDescription>{t("importPreview.description")}</DialogDescription>
        </DialogHeader>
        <DialogBody className="space-y-4">
          <AnalysisSummary analysis={analysis} />

          <div className="space-y-2">
            <CollapsibleSection
              count={analysis.added.length}
              defaultOpen={true}
              icon={<Plus className="h-4 w-4 text-green-500" />}
              title={t("importPreview.newCommands")}
            >
              {analysis.added.map((button, index) => (
                <ButtonItem button={button} key={`added-${button.name}-${index}`} />
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              count={analysis.modified.length}
              defaultOpen={true}
              icon={<RefreshCw className="h-4 w-4 text-amber-500" />}
              title={t("importPreview.modifiedCommands")}
            >
              {analysis.modified.map((conflict, index) => (
                <ButtonItem
                  button={conflict.importedButton}
                  key={`modified-${conflict.importedButton.name}-${index}`}
                />
              ))}
            </CollapsibleSection>

            <CollapsibleSection
              count={analysis.shortcutConflicts.length}
              defaultOpen={true}
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
              title={t("importPreview.shortcutConflictsTitle")}
            >
              {analysis.shortcutConflicts.map((conflict, index) => (
                <ShortcutConflictItem
                  conflict={conflict}
                  key={`shortcut-${conflict.shortcut}-${index}`}
                />
              ))}
            </CollapsibleSection>
          </div>

          {analysis.modified.length > 0 && (
            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium">{t("importPreview.importStrategy")}</Label>
              <RadioGroup
                defaultValue="merge"
                onValueChange={(value) => setStrategy(value as ImportStrategy)}
                value={strategy}
              >
                <div className="flex items-start gap-3">
                  <RadioGroupItem id="strategy-merge" value="merge" />
                  <div className="grid gap-1">
                    <Label className="font-normal cursor-pointer" htmlFor="strategy-merge">
                      {t("importPreview.merge")}
                    </Label>
                    <p className="text-xs text-foreground-muted">
                      {t("importPreview.mergeDescription")}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RadioGroupItem id="strategy-replace" value="replace" />
                  <div className="grid gap-1">
                    <Label className="font-normal cursor-pointer" htmlFor="strategy-replace">
                      {t("importPreview.replace")}
                    </Label>
                    <p className="text-xs text-foreground-muted">
                      {t("importPreview.replaceDescription")}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          )}

          {!hasChanges && (
            <div className="text-center py-4 text-foreground-muted">
              <p>{t("importPreview.noChanges")}</p>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button disabled={isConfirming} onClick={onClose} variant="outline">
            {t("importPreview.cancel")}
          </Button>
          <Button disabled={!hasChanges || isConfirming} onClick={handleConfirm}>
            {isConfirming && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isConfirming ? t("importPreview.importing") : t("importPreview.import")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
