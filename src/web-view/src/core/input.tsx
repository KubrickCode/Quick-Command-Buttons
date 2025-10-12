import { type ComponentProps } from "react";

import { Input as ShadcnInput } from "./shadcn/input";
import { Label } from "./shadcn/label";

type InputProps = ComponentProps<typeof ShadcnInput> & {
  label?: string;
};

export const Input = ({ label, ...props }: InputProps) => {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <ShadcnInput {...props} />
    </div>
  );
};
