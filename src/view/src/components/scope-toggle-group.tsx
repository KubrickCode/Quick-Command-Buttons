import { useTranslation } from "react-i18next";

import { Tooltip, TooltipContent, TooltipTrigger } from "~/core";
import { cn } from "~/core/shadcn/utils";

import type { ConfigurationTarget } from "../../../shared/types";
import { SCOPE_OPTIONS_WITH_COLOR } from "../constants/scope-options";

type ScopeToggleGroupProps = {
  disabled?: boolean;
  onValueChange: (value: ConfigurationTarget) => void;
  value: ConfigurationTarget;
};

export const ScopeToggleGroup = ({
  disabled = false,
  onValueChange,
  value,
}: ScopeToggleGroupProps) => {
  const { t } = useTranslation();
  const handleKeyDown = (e: React.KeyboardEvent, currentIndex: number) => {
    if (disabled) return;

    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const nextIndex =
        e.key === "ArrowRight"
          ? (currentIndex + 1) % SCOPE_OPTIONS_WITH_COLOR.length
          : (currentIndex - 1 + SCOPE_OPTIONS_WITH_COLOR.length) % SCOPE_OPTIONS_WITH_COLOR.length;
      onValueChange(SCOPE_OPTIONS_WITH_COLOR[nextIndex].value);
    }
  };

  return (
    <div
      aria-label="Configuration scope"
      className="inline-flex rounded-md border border-border bg-background shadow-sm"
      role="radiogroup"
    >
      {SCOPE_OPTIONS_WITH_COLOR.map((option, index) => {
        const Icon = option.icon;
        const isSelected = value === option.value;
        const isFirst = index === 0;
        const isLast = index === SCOPE_OPTIONS_WITH_COLOR.length - 1;

        return (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>
              <button
                aria-checked={isSelected}
                aria-label={`${t(`scopeToggle.${option.value}.label`)} scope: ${t(`scopeToggle.${option.value}.description`)}. ${t(`scopeToggle.${option.value}.storage`)}`}
                className={cn(
                  "relative inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                  "focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  "disabled:pointer-events-none disabled:opacity-50",
                  !isFirst && "border-l border-border",
                  isFirst && "rounded-l-md",
                  isLast && "rounded-r-md",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm z-[1]"
                    : "bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                disabled={disabled}
                onClick={() => onValueChange(option.value)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                role="radio"
                type="button"
              >
                <Icon
                  aria-hidden="true"
                  className={cn("h-3.5 w-3.5 shrink-0", !isSelected && option.iconColor)}
                />
                <span className="hidden sm:inline">{t(`scopeToggle.${option.value}.label`)}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs" side="bottom">
              <div className="flex flex-col gap-1">
                <div className="font-semibold">{t(`scopeToggle.${option.value}.label`)}</div>
                <div className="text-xs text-muted-foreground">
                  {t(`scopeToggle.${option.value}.description`)}
                </div>
                <div className="text-xs text-muted-foreground/70 italic">
                  {t(`scopeToggle.${option.value}.storage`)}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
};
