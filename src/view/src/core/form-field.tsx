import { type ReactNode, createContext, useContext, useMemo } from "react";

import { cn } from "./shadcn/utils";

type FormFieldContextValue = {
  errorId?: string;
  hasError: boolean;
  inputId?: string;
};

const FormFieldContext = createContext<FormFieldContextValue | undefined>(undefined);

export const useFormFieldContext = () => {
  return useContext(FormFieldContext);
};

type FormFieldProps = {
  children: ReactNode;
  className?: string;
  error?: boolean;
  errorMessage?: string;
  id?: string;
};

export const FormField = ({ children, className, error, errorMessage, id }: FormFieldProps) => {
  const hasError = error ?? !!errorMessage;
  const inputId = id;
  const errorId = hasError && inputId ? `${inputId}-error` : undefined;

  if (process.env.NODE_ENV !== "production" && hasError && errorMessage && !id) {
    console.warn("FormField: id prop is required when errorMessage is provided for accessibility");
  }

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({
      errorId,
      hasError,
      inputId,
    }),
    [errorId, hasError, inputId]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className={cn("space-y-2", className)}>
        {children}
        <FormError>{errorMessage}</FormError>
      </div>
    </FormFieldContext.Provider>
  );
};

type FormErrorProps = {
  children?: ReactNode;
  className?: string;
};

export const FormError = ({ children, className }: FormErrorProps) => {
  const context = useFormFieldContext();

  if (!context?.hasError || !children) {
    return null;
  }

  return (
    <p className={cn("text-sm text-destructive", className)} id={context.errorId} role="alert">
      {children}
    </p>
  );
};
