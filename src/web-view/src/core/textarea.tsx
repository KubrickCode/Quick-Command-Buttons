import { type ComponentProps } from "react";

import { Label } from "./shadcn/label";
import { Textarea as ShadcnTextarea } from "./shadcn/textarea";

type TextareaProps = ComponentProps<typeof ShadcnTextarea> & {
  label?: string;
};

export const Textarea = ({ label, ...props }: TextareaProps) => {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={props.id}>{label}</Label>}
      <ShadcnTextarea {...props} />
    </div>
  );
};
