import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "bg-accent/15 text-accent border-accent/20",
        destructive: "bg-destructive/15 text-destructive border-destructive/20",
        outline: "text-foreground border-border",
        secondary: "bg-foreground-muted/10 text-foreground-muted border-border-subtle",
        success: "bg-success/15 text-success border-success/20",
        warning: "bg-warning/15 text-warning border-warning/20",
      },
    },
  }
);

export type BadgeProps = {} & React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
