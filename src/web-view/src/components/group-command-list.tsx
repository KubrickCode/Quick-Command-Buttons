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
import { Plus, FolderPlus } from "lucide-react";
import { useCallback, useMemo } from "react";

import { Button } from "~/core";

import { type ButtonConfig } from "../types";
import { GroupCommandItem } from "./group-command-item";
import { useCommandOperations } from "../hooks/use-command-operations";

const MAX_NESTING_DEPTH = 2; // 0-indexed, so 3 levels total (0,1,2)

type GroupCommandListProps = {
  commands: ButtonConfig[];
  depth?: number;
  onChange: (commands: ButtonConfig[]) => void;
  onEditGroup?: (index: number) => void;
  title?: string;
};

export const GroupCommandList = ({
  commands,
  depth = 0,
  onChange,
  onEditGroup,
  title,
}: GroupCommandListProps) => {
  const canAddGroup = depth < MAX_NESTING_DEPTH;

  const { addCommand, addGroup, deleteCommand, updateCommand } = useCommandOperations(
    commands,
    onChange
  );

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useMemo(() => [pointerSensor, keyboardSensor], [pointerSensor, keyboardSensor]);

  const sortableItemIds = useMemo(() => commands.map((_, index) => `${index}`), [commands]);

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

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} sensors={sensors}>
        <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {commands.map((command, index) => (
              <GroupCommandItem
                command={command}
                id={`${index}`}
                index={index}
                key={index}
                onDelete={deleteCommand}
                onEditGroup={onEditGroup ? () => onEditGroup(index) : undefined}
                onUpdate={updateCommand}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="flex gap-2">
        <Button className="flex-1" onClick={addCommand} type="button" variant="outline">
          <Plus className="mr-2" size={16} />
          Add Command
        </Button>
        {canAddGroup && (
          <Button className="flex-1" onClick={addGroup} type="button" variant="outline">
            <FolderPlus className="mr-2" size={16} />
            Add Group
          </Button>
        )}
      </div>
    </div>
  );
};
