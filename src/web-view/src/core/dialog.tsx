import { type ComponentProps } from "react";
import {
  Dialog as ShadcnDialog,
  DialogContent as ShadcnDialogContent,
  DialogHeader as ShadcnDialogHeader,
  DialogTitle as ShadcnDialogTitle
} from "./shadcn/dialog";

export const Dialog = ({ children, ...props }: ComponentProps<typeof ShadcnDialog>) => {
  return <ShadcnDialog {...props}>{children}</ShadcnDialog>;
};

export const DialogContent = ({ children, ...props }: ComponentProps<typeof ShadcnDialogContent>) => {
  return <ShadcnDialogContent {...props}>{children}</ShadcnDialogContent>;
};

export const DialogHeader = ({ children, ...props }: ComponentProps<typeof ShadcnDialogHeader>) => {
  return <ShadcnDialogHeader {...props}>{children}</ShadcnDialogHeader>;
};

export const DialogTitle = ({ children, ...props }: ComponentProps<typeof ShadcnDialogTitle>) => {
  return <ShadcnDialogTitle {...props}>{children}</ShadcnDialogTitle>;
};