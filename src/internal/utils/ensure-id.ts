import { randomUUID } from "crypto";
import { ButtonConfig } from "../../pkg/types";

export type ButtonConfigWithOptionalId = Omit<ButtonConfig, "id" | "group"> & {
  group?: ButtonConfigWithOptionalId[];
  id?: string;
};

export const ensureId = (config: ButtonConfigWithOptionalId): ButtonConfig => {
  const { group, id, ...restConfig } = config;

  return {
    ...restConfig,
    id: id ?? randomUUID(),
    ...(group !== undefined && { group: group.map(ensureId) }),
  };
};

export const ensureIdsInArray = (configs: ButtonConfigWithOptionalId[]): ButtonConfig[] =>
  configs.map((config) => ensureId(config));
