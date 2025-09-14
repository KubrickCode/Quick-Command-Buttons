import { Draggable } from "@hello-pangea/dnd";
import { GripVertical, Trash2, Folder, Terminal, Edit } from "lucide-react";
import { type ButtonConfig } from "../types";
import { Button, Input, Checkbox } from "~/core";

type CommandItemProps = {
  command: ButtonConfig;
  index: number;
  onUpdate: (index: number, updates: Partial<ButtonConfig>) => void;
  onDelete: (index: number) => void;
  onEditGroup?: () => void;
};

export const CommandItem = ({
  command,
  index,
  onUpdate,
  onDelete,
  onEditGroup,
}: CommandItemProps) => {
  const isGroup = !!command.group;

  return (
    <Draggable draggableId={`command-${index}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`
            p-3 rounded border-2 bg-white transition-colors
            ${
              snapshot.isDragging
                ? "border-blue-400 shadow-md"
                : "border-gray-200"
            }
          `}
        >
          <div className="flex items-center gap-3">
            <div
              {...provided.dragHandleProps}
              className="text-gray-400 hover:text-gray-600"
            >
              <GripVertical size={16} />
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
                    onChange={(e) =>
                      onUpdate(index, { command: e.target.value })
                    }
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
                    <Input
                      placeholder="Shortcut (optional)"
                      value={command.shortcut || ""}
                      onChange={(e) =>
                        onUpdate(index, { shortcut: e.target.value })
                      }
                      maxLength={1}
                      className="w-20"
                    />
                  </div>
                </>
              )}

              {isGroup && (
                <div className="text-sm text-gray-500">
                  {command.group?.length || 0} items • Execute all:{" "}
                  {command.executeAll ? "Yes" : "No"}
                </div>
              )}
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
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onDelete(index)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                title="Delete"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};
