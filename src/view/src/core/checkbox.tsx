import { useId, type ComponentProps } from "react";

import { Checkbox as ShadcnCheckbox } from "./shadcn/checkbox";
import { Label } from "./shadcn/label";
import { cn } from "./shadcn/utils";

type CheckboxProps = ComponentProps<typeof ShadcnCheckbox> & {
  description?: string;
  label: string;
};

export const Checkbox = ({ className, description, id, label, ...props }: CheckboxProps) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div
      className={cn(
        "flex items-start gap-3 py-2 px-3 -mx-3 rounded-md",
        "hover:bg-hover transition-colors duration-150",
        className
      )}
    >
      <ShadcnCheckbox className="mt-0.5" id={checkboxId} {...props} />
      <div className="flex flex-col gap-0.5">
        <Label
          className="text-sm text-foreground cursor-pointer select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
          htmlFor={checkboxId}
        >
          {label}
        </Label>
        {description && <span className="text-xs text-foreground-muted">{description}</span>}
      </div>
    </div>
  );
};
