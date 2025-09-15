import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Folder,
  Terminal,
  Edit,
} from "lucide-react";
import { type ButtonConfig } from "../types";
import { Button, Input, Checkbox } from "~/core";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

type GroupCommandItemProps = {
  command: ButtonConfig;
  index: number;
  onUpdate: (index: number, updates: Partial<ButtonConfig>) => void;
  onDelete: (index: number) => void;
  onEditGroup?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

export const GroupCommandItem = ({
  command,
  index,
  onUpdate,
  onDelete,
  onEditGroup,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: GroupCommandItemProps) => {
  const isGroup = !!command.group;

  return (
    <div className="p-3 rounded border-2 bg-white border-gray-200">
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-6 w-6 p-0"
            title="Move Up"
          >
            <ChevronUp size={12} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-6 w-6 p-0"
            title="Move Down"
          >
            <ChevronDown size={12} />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {isGroup ? (
            <Folder size={16} className="text-amber-600" />
          ) : (
            <Terminal size={16} className="text-green-600" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <Input
            placeholder={isGroup ? "Group name" : "Command name"}
            value={command.name}
            onChange={(e) => onUpdate(index, { name: e.target.value })}
          />

          {!isGroup && (
            <>
              <Input
                placeholder="Command (e.g., npm start)"
                value={command.command || ""}
                onChange={(e) => onUpdate(index, { command: e.target.value })}
              />
              <div className="flex items-center gap-4">
                <Checkbox
                  id={`vscode-${index}`}
                  label="Use VS Code API"
                  checked={command.useVsCodeApi || false}
                  onCheckedChange={(checked) =>
                    onUpdate(index, { useVsCodeApi: !!checked })
                  }
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-4">
            <Input
              placeholder="Shortcut (optional)"
              value={command.shortcut || ""}
              onChange={(e) => onUpdate(index, { shortcut: e.target.value })}
              maxLength={1}
              className="w-20"
            />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isGroup && onEditGroup && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onEditGroup}
              className="h-8 px-3"
              title="Edit Group"
            >
              <Edit size={14} className="mr-1" />
              Edit
            </Button>
          )}
          <DeleteConfirmationDialog
            commandName={command.name}
            onConfirm={() => onDelete(index)}
          >
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              title="Delete"
            >
              <Trash2 size={14} />
            </Button>
          </DeleteConfirmationDialog>
        </div>
      </div>
    </div>
  );
};
