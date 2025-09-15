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

export const Dialog = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialog>) => {
  return <ShadcnDialog {...props}>{children}</ShadcnDialog>;
};

export const DialogContent = ({
  children,
  className,
  ...props
}: ComponentProps<typeof ShadcnDialogContent>) => {
  return <ShadcnDialogContent className={`p-5 ${className || ''}`} {...props}>{children}</ShadcnDialogContent>;
};

export const DialogHeader = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialogHeader>) => {
  return <ShadcnDialogHeader {...props}>{children}</ShadcnDialogHeader>;
};

export const DialogTitle = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialogTitle>) => {
  return <ShadcnDialogTitle {...props}>{children}</ShadcnDialogTitle>;
};

export const DialogDescription = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialogDescription>) => {
  return (
    <ShadcnDialogDescription {...props}>{children}</ShadcnDialogDescription>
  );
};

export const DialogFooter = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialogFooter>) => {
  return <ShadcnDialogFooter {...props}>{children}</ShadcnDialogFooter>;
};

export const DialogTrigger = ({
  children,
  ...props
}: ComponentProps<typeof ShadcnDialogTrigger>) => {
  return <ShadcnDialogTrigger {...props}>{children}</ShadcnDialogTrigger>;
};
