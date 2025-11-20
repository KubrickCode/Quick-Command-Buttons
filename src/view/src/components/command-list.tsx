import { Card, CardContent, CardHeader, CardTitle } from "~/core";

import { CommandCard } from "./command-card";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useSortableList } from "../hooks/use-sortable-list";

export const CommandList = () => {
  const { commands, reorderCommands } = useVscodeCommand();

  const { SortableWrapper } = useSortableList({
    items: commands,
    onReorder: reorderCommands,
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Current Commands</CardTitle>
      </CardHeader>
      <CardContent>
        {commands.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No commands configured. Add your first command to get started.
          </p>
        ) : (
          <SortableWrapper>
            <div className="space-y-3">
              {commands.map((command, index) => (
                <CommandCard command={command} id={command.id} index={index} key={command.id} />
              ))}
            </div>
          </SortableWrapper>
        )}
      </CardContent>
    </Card>
  );
};
