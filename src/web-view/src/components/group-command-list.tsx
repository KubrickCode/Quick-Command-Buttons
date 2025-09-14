import { Plus, FolderPlus } from "lucide-react";
import { type ButtonConfig } from "../types";
import { Button } from "~/core";
import { GroupCommandItem } from "./group-command-item";
import { useCommandOperations } from "../hooks/use-command-operations";

const MAX_NESTING_DEPTH = 2; // 0-indexed, so 3 levels total (0,1,2)

type GroupCommandListProps = {
  commands: ButtonConfig[];
  onChange: (commands: ButtonConfig[]) => void;
  title?: string;
  depth?: number;
  onEditGroup?: (index: number) => void;
};

export const GroupCommandList = ({
  commands,
  onChange,
  title,
  depth = 0,
  onEditGroup,
}: GroupCommandListProps) => {
  const canAddGroup = depth < MAX_NESTING_DEPTH;

  const {
    updateCommand,
    deleteCommand,
    addCommand,
    addGroup,
    moveUp,
    moveDown,
  } = useCommandOperations(commands, onChange);

  return (
    <div className="space-y-4">
      {title && (
        <div className="text-sm font-medium text-gray-700 pb-2 border-b">
          {title}
        </div>
      )}

      <div className="space-y-3">
        {commands.map((command, index) => (
          <GroupCommandItem
            key={index}
            command={command}
            index={index}
            onUpdate={updateCommand}
            onDelete={deleteCommand}
            onEditGroup={onEditGroup ? () => onEditGroup(index) : undefined}
            onMoveUp={() => moveUp(index)}
            onMoveDown={() => moveDown(index)}
            canMoveUp={index > 0}
            canMoveDown={index < commands.length - 1}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={addCommand}
          variant="outline"
          className="flex-1"
        >
          <Plus size={16} className="mr-2" />
          Add Command
        </Button>
        {canAddGroup && (
          <Button
            type="button"
            onClick={addGroup}
            variant="outline"
            className="flex-1"
          >
            <FolderPlus size={16} className="mr-2" />
            Add Group
          </Button>
        )}
      </div>
    </div>
  );
};
