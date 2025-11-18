import type { ComponentProps } from "react";

import { Label } from "./label";

export const FormLabel = ({ children, ...props }: ComponentProps<typeof Label>) => {
  return (
    <Label className="text-muted-foreground" {...props}>
      {children}
    </Label>
  );
};
