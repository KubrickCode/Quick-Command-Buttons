import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const useSortableItem = (id: string) => {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    animateLayoutChanges: () => false,
    id,
  });

  const style = {
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? "none" : transition,
  };

  return {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    style,
  };
};
