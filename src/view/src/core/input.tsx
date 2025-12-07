import { type ComponentProps } from "react";

import { FormField, useFormFieldContext } from "./form-field";
import { FormLabel } from "./form-label";
import { Input as ShadcnInput } from "./shadcn/input";

type InputProps = ComponentProps<typeof ShadcnInput> & {
  error?: boolean;
  errorMessage?: string;
  label?: string;
};

const InputWithAria = (props: ComponentProps<typeof ShadcnInput> & { hasError: boolean }) => {
  const { hasError, ...rest } = props;
  const context = useFormFieldContext();

  return (
    <ShadcnInput
      aria-describedby={context?.errorId}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  );
};

export const Input = ({ error, errorMessage, label, ...props }: InputProps) => {
  const hasError = error ?? !!errorMessage;

  return (
    <FormField error={error} errorMessage={errorMessage} id={props.id}>
      {label && <FormLabel htmlFor={props.id}>{label}</FormLabel>}
      <InputWithAria hasError={hasError} {...props} />
    </FormField>
  );
};
