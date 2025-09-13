import { type ComponentProps } from "react";
import { Badge as ShadcnBadge } from "./shadcn/badge";

type BadgeProps = ComponentProps<typeof ShadcnBadge>;

export const Badge = (props: BadgeProps) => {
  return <ShadcnBadge {...props} />;
};
