import type { ButtonConfig as BaseButtonConfig } from "../../shared/types";

export type ButtonConfig = BaseButtonConfig & {
  index?: number;
};

export type { WebviewMessage as VSCodeMessage } from "../../shared/types";
