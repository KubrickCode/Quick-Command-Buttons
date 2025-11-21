import { Command, Plus } from "lucide-react";

import { Button } from "~/core";
import { cn } from "~/core/shadcn/utils";

type EmptyStateProps = {
  onAddClick: () => void;
};

export const EmptyState = ({ onAddClick }: EmptyStateProps) => (
  <div className={cn("flex flex-col items-center justify-center py-16 px-4")}>
    {/* Icon with subtle glow */}
    <div className="relative mb-8">
      <div className={cn("absolute inset-0 bg-accent/25 blur-xl rounded-full")} />
      <div className={cn("relative p-4 rounded-full", "bg-background-subtle border border-border")}>
        <Command aria-hidden="true" className="text-foreground-muted" size={32} />
      </div>
    </div>

    {/* Text */}
    <h3 className={cn("text-lg font-medium text-foreground mb-2 tracking-tight")}>
      No commands configured
    </h3>
    <p className={cn("text-sm text-foreground-muted text-center", "max-w-md mb-8")}>
      Create your first command. It will appear as a button in VS Code's status bar, ready to
      execute with one click.
    </p>

    {/* CTA */}
    <Button aria-label="Add your first command" onClick={onAddClick}>
      <Plus aria-hidden="true" size={16} />
      Add your first command
    </Button>
  </div>
);
