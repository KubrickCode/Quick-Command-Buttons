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
            {commands.map((command, index) => (
              <CommandCard command={command} id={command.id} index={index} key={command.id} />
            ))}
          </div>
        </SortableWrapper>
      </CardContent>
    </Card>
  );
};
