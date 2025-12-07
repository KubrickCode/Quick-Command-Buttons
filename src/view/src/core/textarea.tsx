import { type ComponentProps } from "react";

import { FormField, useFormFieldContext } from "./form-field";
import { FormLabel } from "./form-label";
import { Textarea as ShadcnTextarea } from "./shadcn/textarea";

type TextareaProps = ComponentProps<typeof ShadcnTextarea> & {
  error?: boolean;
  errorMessage?: string;
  label?: string;
};

const TextareaWithAria = (props: ComponentProps<typeof ShadcnTextarea> & { hasError: boolean }) => {
  const { hasError, ...rest } = props;
  const context = useFormFieldContext();

  return (
    <ShadcnTextarea
      aria-describedby={context?.errorId}
      aria-invalid={hasError || undefined}
      {...rest}
    />
  );
};

export const Textarea = ({ error, errorMessage, label, ...props }: TextareaProps) => {
  const hasError = error ?? !!errorMessage;

  return (
    <FormField error={error} errorMessage={errorMessage} id={props.id}>
      {label && <FormLabel htmlFor={props.id}>{label}</FormLabel>}
      <TextareaWithAria hasError={hasError} {...props} />
    </FormField>
  );
};
