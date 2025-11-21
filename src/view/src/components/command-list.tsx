import { AnimatePresence, motion } from "motion/react";

import { Card, CardContent, CardHeader, CardTitle } from "~/core";

import { CommandCard } from "./command-card";
import { EmptyState } from "./empty-state";
import { useCommandForm } from "../context/command-form-context";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useSortableList } from "../hooks/use-sortable-list";

export const CommandList = () => {
  const { commands, reorderCommands } = useVscodeCommand();
  const { openForm } = useCommandForm();

  const { SortableWrapper } = useSortableList({
    items: commands,
    onReorder: reorderCommands,
  });

  if (commands.length === 0) {
    return (
      <Card className="mb-6">
        <EmptyState onAddClick={openForm} />
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Current Commands</CardTitle>
      </CardHeader>
      <CardContent>
        <SortableWrapper>
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
                  <CommandCard command={command} id={command.id} index={index} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </SortableWrapper>
      </CardContent>
    </Card>
  );
};
