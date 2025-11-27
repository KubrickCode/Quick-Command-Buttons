import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive cursor-pointer",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        icon: "size-9",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
      },
      variant: {
        default:
          "bg-accent text-accent-foreground shadow-sm hover:shadow-[var(--glow-accent-subtle)] hover:brightness-105 active:brightness-95",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:brightness-105 active:brightness-95",
        ghost: "hover:bg-hover text-foreground-muted hover:text-foreground",
        gradient:
          "bg-gradient-to-br from-[oklch(0.55_0.22_260)] to-[oklch(0.5_0.2_280)] dark:from-[oklch(0.6_0.2_260)] dark:to-[oklch(0.55_0.18_280)] text-accent-foreground shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-[var(--glow-accent-strong)] active:scale-[0.98]",
        link: "text-accent underline-offset-4 hover:underline",
        outline: "border border-border bg-transparent hover:bg-hover hover:border-border-strong",
        secondary: "bg-background-subtle text-foreground hover:bg-hover",
        success:
          "bg-success text-success-foreground shadow-sm hover:shadow-[var(--glow-accent-subtle)] hover:brightness-105 active:brightness-95",
        warning:
          "bg-warning text-warning-foreground shadow-sm hover:brightness-105 active:brightness-95",
      },
    },
  }
);

function Button({
  asChild = false,
  className,
  size,
  variant,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ className, size, variant }))}
      data-slot="button"
      {...props}
    />
  );
}

export { Button };
