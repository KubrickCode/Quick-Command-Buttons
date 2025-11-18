import { type ComponentProps } from "react";

import {
  RadioGroup as ShadcnRadioGroup,
  RadioGroupItem as ShadcnRadioGroupItem,
} from "./shadcn/radio-group";

export const RadioGroup = ({ children, ...props }: ComponentProps<typeof ShadcnRadioGroup>) => {
  return <ShadcnRadioGroup {...props}>{children}</ShadcnRadioGroup>;
};

export const RadioGroupItem = ({ ...props }: ComponentProps<typeof ShadcnRadioGroupItem>) => {
  return <ShadcnRadioGroupItem {...props} />;
};
