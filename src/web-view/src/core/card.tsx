import { type ComponentProps } from "react";
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardFooter as ShadcnCardFooter,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle
} from "./shadcn/card";

type CardProps = ComponentProps<typeof ShadcnCard>;
type CardContentProps = ComponentProps<typeof ShadcnCardContent>;
type CardDescriptionProps = ComponentProps<typeof ShadcnCardDescription>;
type CardFooterProps = ComponentProps<typeof ShadcnCardFooter>;
type CardHeaderProps = ComponentProps<typeof ShadcnCardHeader>;
type CardTitleProps = ComponentProps<typeof ShadcnCardTitle>;

export const Card = (props: CardProps) => <ShadcnCard {...props} />;
export const CardContent = (props: CardContentProps) => <ShadcnCardContent {...props} />;
export const CardDescription = (props: CardDescriptionProps) => <ShadcnCardDescription {...props} />;
export const CardFooter = (props: CardFooterProps) => <ShadcnCardFooter {...props} />;
export const CardHeader = (props: CardHeaderProps) => <ShadcnCardHeader {...props} />;
export const CardTitle = (props: CardTitleProps) => <ShadcnCardTitle {...props} />;