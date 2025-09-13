import { type ComponentProps } from "react";
import { Textarea as ShadcnTextarea } from "./shadcn/textarea";
import { Label } from "./shadcn/label";

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