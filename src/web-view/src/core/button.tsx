import { type ComponentProps } from "react";
import { Button as ShadcnButton } from "./shadcn/button";

type ButtonProps = ComponentProps<typeof ShadcnButton>;

export const Button = ({ children, ...props }: ButtonProps) => {
  return (
    <ShadcnButton {...props}>
      {children}
    </ShadcnButton>
  );
};