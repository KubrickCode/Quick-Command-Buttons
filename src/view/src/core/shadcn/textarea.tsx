import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-border bg-background-subtle px-3 py-2",
        "text-sm text-foreground placeholder:text-foreground-subtle",
        "transition-all duration-200 outline-none",
        "focus:border-accent focus:ring-2 focus:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className
      )}
      data-slot="textarea"
      {...props}
    />
  );
}

export { Textarea };
