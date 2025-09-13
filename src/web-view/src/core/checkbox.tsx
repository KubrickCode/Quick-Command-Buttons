import { useId, type ComponentProps } from "react";
import { Checkbox as ShadcnCheckbox } from "./shadcn/checkbox";
import { Label } from "./shadcn/label";

type CheckboxProps = ComponentProps<typeof ShadcnCheckbox> & {
  label: string;
};

export const Checkbox = ({ label, id, ...props }: CheckboxProps) => {
  const generatedId = useId();
  const checkboxId = id || generatedId;

  return (
    <div className="flex items-center space-x-2">
      <ShadcnCheckbox id={checkboxId} {...props} />
      <Label htmlFor={checkboxId}>{label}</Label>
    </div>
  );
};
