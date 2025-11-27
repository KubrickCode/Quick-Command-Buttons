import { type ComponentProps } from "react";

import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle,
  DialogDescription as ShadcnDialogDescription,
  DialogFooter as ShadcnDialogFooter,
  DialogTrigger as ShadcnDialogTrigger,
} from "./shadcn/dialog";
import { cn } from "./shadcn/utils";

export const Dialog = ({ children, ...props }: ComponentProps<typeof ShadcnDialog>) => {
  return <ShadcnDialog {...props}>{children}</ShadcnDialog>;
};

export const DialogContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogContent>) => {
  return (
    <ShadcnDialogContent
      className={cn(
        "p-0 flex flex-col max-h-[90vh]",
        "bg-background-elevated border-border-subtle",
        "shadow-lg rounded-lg overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnDialogContent>
  );
};

export const DialogHeader = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogHeader>) => {
  return (
    <ShadcnDialogHeader
      className={cn(
        "px-6 pt-6 pb-4 flex-shrink-0",
        "border-b border-border-subtle bg-background-subtle/50",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnDialogHeader>
  );
};

export const DialogTitle = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogTitle>) => {
  return (
    <ShadcnDialogTitle
      className={cn("text-xl font-bold tracking-tight text-foreground", className)}
      {...props}
    >
      {children}
    </ShadcnDialogTitle>
  );
};

export const DialogDescription = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogDescription>) => {
  return (
    <ShadcnDialogDescription className={cn("text-foreground-muted mt-1.5", className)} {...props}>
      {children}
    </ShadcnDialogDescription>
  );
};

export const DialogBody = ({ children, className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={cn(
        "flex-1 overflow-y-auto px-6 py-4 min-h-0",
        "bg-background-elevated scrollbar-thin",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const DialogFooter = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogFooter>) => {
  return (
    <ShadcnDialogFooter
      className={cn(
        "px-6 pb-6 pt-4 flex-shrink-0",
        "border-t border-border-subtle bg-background-subtle/30",
        "flex gap-3 justify-end",
        className
      )}
      {...props}
    >
      {children}
    </ShadcnDialogFooter>
  );
};

export const DialogTrigger = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialogTrigger>) => {
  return <ShadcnDialogTrigger {...props}>{children}</ShadcnDialogTrigger>;
};
