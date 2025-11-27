import { createContext, type ComponentProps, useContext } from "react";

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

type DialogVariant = "default" | "premium" | "glass";

const DialogVariantContext = createContext<DialogVariant>("default");

export const Dialog = ({ children, ...props }: ComponentProps<typeof ShadcnDialog>) => {
  return <ShadcnDialog {...props}>{children}</ShadcnDialog>;
};

type DialogContentProps = ComponentProps<typeof ShadcnDialogContent> & {
  variant?: DialogVariant;
};

export const DialogContent = ({
  children,
  className,
  variant = "default",
  ...props
}: DialogContentProps) => {
  return (
    <DialogVariantContext.Provider value={variant}>
      <ShadcnDialogContent
        className={cn(
          "p-0 flex flex-col max-h-[90vh]",
          "border-border-subtle shadow-lg rounded-lg overflow-hidden",
          // Variant-specific backgrounds
          variant === "default" && "bg-background-elevated",
          variant === "premium" && "bg-background-elevated dialog-content-premium",
          variant === "glass" && "bg-background-elevated/95 backdrop-blur-xl border-border/50",
          className
        )}
        {...props}
      >
        {children}
      </ShadcnDialogContent>
    </DialogVariantContext.Provider>
  );
};

export const DialogHeader = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogHeader>) => {
  const variant = useContext(DialogVariantContext);

  return (
    <ShadcnDialogHeader
      className={cn(
        "px-6 pt-6 pb-4 flex-shrink-0",
        "border-b border-border-subtle",
        // Variant-specific styling
        variant === "default" && "bg-background-subtle/50",
        variant === "premium" && "dialog-header-premium",
        variant === "glass" && "backdrop-blur-xl bg-background-elevated/60",
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
  const variant = useContext(DialogVariantContext);

  return (
    <ShadcnDialogFooter
      className={cn(
        "px-6 pb-6 pt-4 flex-shrink-0",
        "border-t border-border-subtle",
        "flex gap-3 justify-end",
        // Variant-specific styling
        variant === "default" && "bg-background-subtle/30",
        variant === "premium" && "bg-gradient-to-t from-background-subtle/40 to-transparent",
        variant === "glass" && "backdrop-blur-xl bg-background-elevated/50",
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
