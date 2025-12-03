import { useEffect } from "react";

import { commandStore } from "../stores/command-store";

export const useUndoRedoShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow native undo/redo in editable elements
      if (!(event.target instanceof HTMLElement)) return;
      const target = event.target;
      const isEditable =
        target.isContentEditable || target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (isEditable) return;

      const isCtrlOrCmd = event.ctrlKey || event.metaKey;

      if (!isCtrlOrCmd) return;

      const key = event.key.toLowerCase();

      // Ctrl+Z: Undo
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        const { pastStates, undo } = commandStore.temporal.getState();
        if (pastStates.length > 0) {
          undo();
        }
        return;
      }

      // Ctrl+Shift+Z or Ctrl+Y: Redo
      if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        const { futureStates, redo } = commandStore.temporal.getState();
        if (futureStates.length > 0) {
          redo();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
