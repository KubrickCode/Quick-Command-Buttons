import { Command, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "~/core";
import { cn } from "~/core/shadcn/utils";

type EmptyStateProps = {
  onAddClick: () => void;
};

export const EmptyState = ({ onAddClick }: EmptyStateProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4",
        "relative",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-b before:from-accent/5 before:to-transparent",
        "before:rounded-lg before:pointer-events-none"
      )}
    >
      {/* Icon with subtle glow */}
      <div className="relative mb-8">
        <div className={cn("absolute inset-0 bg-accent/30 blur-2xl rounded-full")} />
        <div
          className={cn(
            "relative p-6 rounded-full",
            "bg-background-subtle border border-border",
            "shadow-lg"
          )}
        >
          <Command aria-hidden="true" className="text-foreground-muted" size={48} />
        </div>
      </div>

      {/* Text */}
      <h3 className={cn("text-lg font-medium text-foreground mb-2 tracking-tight")}>
        {t("emptyState.title")}
      </h3>
      <p className={cn("text-sm text-foreground-muted text-center", "max-w-md mb-8")}>
        {t("emptyState.description")}
      </p>

      {/* CTA */}
      <Button aria-label={t("emptyState.addFirst")} onClick={onAddClick} variant="default">
        <Plus aria-hidden="true" size={16} />
        {t("emptyState.addFirst")}
      </Button>
    </div>
  );
};
