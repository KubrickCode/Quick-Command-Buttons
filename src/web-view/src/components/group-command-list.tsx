import { Plus, FolderPlus } from "lucide-react";
import { useCallback, useMemo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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
  } = useCommandOperations(commands, onChange);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useMemo(() => [pointerSensor, keyboardSensor], [pointerSensor, keyboardSensor]);

  const sortableItemIds = useMemo(() =>
    commands.map((_, index) => `${index}`),
    [commands]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = Number(active.id);
        const newIndex = Number(over.id);

        if (!isNaN(oldIndex) && !isNaN(newIndex)) {
          const newItems = arrayMove(commands, oldIndex, newIndex);
          onChange(newItems);
        }
      }
    },
    [commands, onChange]
  );

  return (
    <div className="space-y-4">
      {title && (
        <div className="text-sm font-medium text-foreground pb-2 border-b border-border">
          {title}
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableItemIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {commands.map((command, index) => (
              <GroupCommandItem
                key={index}
                id={`${index}`}
                command={command}
                index={index}
                onUpdate={updateCommand}
                onDelete={deleteCommand}
                onEditGroup={onEditGroup ? () => onEditGroup(index) : undefined}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
