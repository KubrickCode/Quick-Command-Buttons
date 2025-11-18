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

export const Dialog = ({ children, ...props }: ComponentProps<typeof ShadcnDialog>) => {
  return <ShadcnDialog {...props}>{children}</ShadcnDialog>;
};

export const DialogContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogContent>) => {
  return (
    <ShadcnDialogContent className={`p-0 flex flex-col max-h-[90vh] ${className || ""}`} {...props}>
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
    <ShadcnDialogHeader className={`px-6 pt-6 pb-4 flex-shrink-0 ${className || ""}`} {...props}>
      {children}
    </ShadcnDialogHeader>
  );
};

export const DialogTitle = ({ children, ...props }: ComponentProps<typeof ShadcnDialogTitle>) => {
  return <ShadcnDialogTitle {...props}>{children}</ShadcnDialogTitle>;
};

export const DialogDescription = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialogDescription>) => {
  return <ShadcnDialogDescription {...props}>{children}</ShadcnDialogDescription>;
};

export const DialogBody = ({ children, className, ...props }: ComponentProps<"div">) => {
  return (
    <div className={`flex-1 overflow-y-auto px-6 py-2 min-h-0 ${className || ""}`} {...props}>
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
    <ShadcnDialogFooter className={`px-6 pb-6 pt-4 flex-shrink-0 ${className || ""}`} {...props}>
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
