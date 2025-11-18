import { type ComponentProps } from "react";

import { Button as ShadcnButton } from "./shadcn/button";
import { cn } from "./shadcn/utils";

type ButtonProps = ComponentProps<typeof ShadcnButton>;

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <ShadcnButton className={cn(className, "cursor-pointer")} {...props}>
      {children}
    </ShadcnButton>
  );
};
