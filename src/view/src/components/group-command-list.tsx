import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, FolderPlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";

import { Button } from "~/core";

import { GroupCommandItem } from "./group-command-item";
import { useCommandEdit } from "../context/command-edit-context.tsx";

const MAX_NESTING_DEPTH = 2; // 0-indexed, so 3 levels total (0,1,2)

type GroupCommandListContextValue = {
  depth: number;
  onEditGroup?: (index: number) => void;
};

const GroupCommandListContext = createContext<GroupCommandListContextValue | undefined>(undefined);

const useGroupCommandListContext = () => {
  const context = useContext(GroupCommandListContext);
  if (!context) {
    throw new Error("GroupCommandList sub-components must be used within GroupCommandList");
  }
  return context;
};

type GroupCommandListProps = {
  children: ReactNode;
  depth?: number;
  onEditGroup?: (index: number) => void;
};

const GroupCommandListRoot = ({ children, depth = 0, onEditGroup }: GroupCommandListProps) => {
  const contextValue = useMemo(() => ({ depth, onEditGroup }), [depth, onEditGroup]);

  return (
    <GroupCommandListContext.Provider value={contextValue}>
      <div className="space-y-4">{children}</div>
    </GroupCommandListContext.Provider>
  );
};

type TitleProps = {
  children: ReactNode;
};

const Title = ({ children }: TitleProps) => {
  return (
    <div className="text-sm font-medium text-foreground pb-2 border-b border-border">
      {children}
    </div>
  );
};

const Items = () => {
  const { onEditGroup } = useGroupCommandListContext();
  const { commands, onCommandsChange } = useCommandEdit();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    <DndContext
      autoScroll={false}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext items={sortableItemIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          <AnimatePresence initial={false} mode="popLayout">
            {commands.map((command, index) => (
              <motion.div
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                initial={{ opacity: 0, scale: 0.96 }}
                key={command.id}
                layout
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <GroupCommandItem
                  command={command}
                  id={command.id}
                  index={index}
                  onEditGroup={onEditGroup ? () => onEditGroup(index) : undefined}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  );
};

const Actions = () => {
  const { depth } = useGroupCommandListContext();
  const { addCommand, addGroup } = useCommandEdit();
  const canAddGroup = depth < MAX_NESTING_DEPTH;

  return (
    <div className="flex gap-2">
      <Button
        aria-label="Add new command"
        className="flex-1"
        onClick={addCommand}
        type="button"
        variant="outline"
      >
        <Plus aria-hidden="true" className="mr-2" size={16} />
        Add Command
      </Button>
      {canAddGroup && (
        <Button
          aria-label="Add new group"
          className="flex-1"
          onClick={addGroup}
          type="button"
          variant="outline"
        >
          <FolderPlus aria-hidden="true" className="mr-2" size={16} />
          Add Group
        </Button>
      )}
    </div>
  );
};

export const GroupCommandList = Object.assign(GroupCommandListRoot, {
  Actions,
  Items,
  Title,
});
