import type { ComponentProps } from "react";

import { Label } from "./label";
import { cn } from "./shadcn/utils";

type FormLabelProps = ComponentProps<typeof Label> & {
  optional?: boolean;
  required?: boolean;
};

export const FormLabel = ({
  children,
  className,
  optional,
  required,
  ...props
}: FormLabelProps) => {
  return (
    <Label
      className={cn(
        "text-sm font-medium text-foreground",
        required && "after:content-['*'] after:ml-0.5 after:text-destructive",
        optional &&
          "after:content-['(optional)'] after:ml-1.5 after:text-foreground-subtle after:text-xs after:font-normal",
        className
      )}
      {...props}
    >
      {children}
    </Label>
  );
};
