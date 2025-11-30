import { Check, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/core";

import { CreateSetDialog } from "./create-set-dialog";
import { DeleteSetDialog } from "./delete-set-dialog";
import { RenameSetDialog } from "./rename-set-dialog";
import type { ButtonSet } from "../../../shared/types";
import { useVscodeCommand } from "../context/vscode-command-context";

export const ButtonSetSelector = () => {
  const { t } = useTranslation();
  const { activeSet, buttonSets, setActiveSet } = useVscodeCommand();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [renameTarget, setRenameTarget] = useState<ButtonSet | null>(null);

  const displayName = activeSet ?? t("buttonSets.default");

  const handleSetChange = async (name: string | null) => {
    await setActiveSet(name);
    setIsOpen(false);
  };

  const handleRenameClick = (e: React.MouseEvent, set: ButtonSet) => {
    e.stopPropagation();
    setIsOpen(false);
    setRenameTarget(set);
  };

  return (
    <>
      <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
        <Tooltip open={isOpen ? false : undefined}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={t("buttonSets.selector")}
                className="btn-interactive gap-2"
                size="sm"
                variant="outline"
              >
                <Layers aria-hidden="true" className="h-4 w-4" />
                <span className="max-w-[120px] truncate">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t("buttonSets.currentSet", { name: displayName })}
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="min-w-[200px]">
          {/* Default option */}
          <DropdownMenuItem onClick={() => handleSetChange(null)}>
            <Check
              aria-hidden="true"
              className={`h-4 w-4 mr-2 ${activeSet === null ? "opacity-100" : "opacity-0"}`}
            />
            {t("buttonSets.default")}
          </DropdownMenuItem>

          {/* Saved sets */}
          {buttonSets.length > 0 && <DropdownMenuSeparator />}
          {buttonSets.map((set) => (
            <DropdownMenuItem key={set.id} onClick={() => handleSetChange(set.name)}>
              <Check
                aria-hidden="true"
                className={`h-4 w-4 mr-2 ${activeSet === set.name ? "opacity-100" : "opacity-0"}`}
              />
              <span className="flex-1 truncate">{set.name}</span>
              <span className="ml-2 text-xs text-muted-foreground">{set.buttons.length}</span>
              <button
                aria-label={t("buttonSets.renameSet")}
                className="ml-2 p-1 rounded hover:bg-accent"
                data-testid={`rename-set-${set.id}`}
                onClick={(e) => handleRenameClick(e, set)}
                type="button"
              >
                <Pencil aria-hidden="true" className="h-3 w-3" />
              </button>
            </DropdownMenuItem>
          ))}

          {/* Actions */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setIsOpen(false);
              setShowCreateDialog(true);
            }}
          >
            <Plus aria-hidden="true" className="h-4 w-4 mr-2" />
            {t("buttonSets.createNew")}
          </DropdownMenuItem>
          {buttonSets.length > 0 && (
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                setIsOpen(false);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 aria-hidden="true" className="h-4 w-4 mr-2" />
              {t("buttonSets.deleteSet")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateSetDialog onOpenChange={setShowCreateDialog} open={showCreateDialog} />
      <DeleteSetDialog onOpenChange={setShowDeleteDialog} open={showDeleteDialog} />
      <RenameSetDialog
        onOpenChange={(open) => !open && setRenameTarget(null)}
        open={renameTarget !== null}
        targetSet={renameTarget}
      />
    </>
  );
};
