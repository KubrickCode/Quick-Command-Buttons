import { type ComponentProps } from "react";
import {
  Tooltip as ShadcnTooltip,
  TooltipContent as ShadcnTooltipContent,
  TooltipProvider as ShadcnTooltipProvider,
  TooltipTrigger as ShadcnTooltipTrigger
} from "./shadcn/tooltip";

type TooltipProps = ComponentProps<typeof ShadcnTooltip>;
type TooltipContentProps = ComponentProps<typeof ShadcnTooltipContent>;
type TooltipProviderProps = ComponentProps<typeof ShadcnTooltipProvider>;
type TooltipTriggerProps = ComponentProps<typeof ShadcnTooltipTrigger>;

export const Tooltip = (props: TooltipProps) => <ShadcnTooltip {...props} />;
export const TooltipContent = (props: TooltipContentProps) => <ShadcnTooltipContent {...props} />;
export const TooltipProvider = (props: TooltipProviderProps) => <ShadcnTooltipProvider {...props} />;
export const TooltipTrigger = (props: TooltipTriggerProps) => <ShadcnTooltipTrigger {...props} />;