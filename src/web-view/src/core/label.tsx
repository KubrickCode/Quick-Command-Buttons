import { type ComponentProps } from "react";

import { Label as ShadcnLabel } from "./shadcn/label";

export const Label = ({ children, ...props }: ComponentProps<typeof ShadcnLabel>) => {
  return <ShadcnLabel {...props}>{children}</ShadcnLabel>;
};
