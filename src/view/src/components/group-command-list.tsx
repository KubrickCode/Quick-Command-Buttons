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

import { GroupCommandItem } from "./group-command-item";
import { useCommandEdit } from "../context/command-edit-context.tsx";

const MAX_NESTING_DEPTH = 2; // 0-indexed, so 3 levels total (0,1,2)

type GroupCommandListProps = {
  depth?: number;
  onEditGroup?: (index: number) => void;
  title?: string;
};

export const GroupCommandList = ({ depth = 0, onEditGroup, title }: GroupCommandListProps) => {
  const canAddGroup = depth < MAX_NESTING_DEPTH;

  const { addCommand, addGroup, commands, onCommandsChange } = useCommandEdit();

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });

  const sensors = useMemo(() => [pointerSensor, keyboardSensor], [pointerSensor, keyboardSensor]);

  const sortableItemIds = useMemo(() => commands.map((command) => command.id), [commands]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = commands.findIndex((cmd) => cmd.id === active.id);
        const newIndex = commands.findIndex((cmd) => cmd.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(commands, oldIndex, newIndex);
          onCommandsChange(newItems);
        }
      }
    },
    [commands, onCommandsChange]
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
                id={command.id}
                index={index}
                key={command.id}
                onEditGroup={onEditGroup ? () => onEditGroup(index) : undefined}
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
