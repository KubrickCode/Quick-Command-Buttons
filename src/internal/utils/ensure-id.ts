import { randomUUID } from "crypto";
import { ButtonConfig, ButtonConfigWithOptionalId } from "../../pkg/types";

export type { ButtonConfigWithOptionalId };

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

export type ButtonConfigWithoutId = Omit<ButtonConfig, "id" | "group"> & {
  group?: ButtonConfigWithoutId[];
};

export const stripId = (
  config: ButtonConfig | ButtonConfigWithOptionalId
): ButtonConfigWithoutId => {
  const { group, id: _id, ...restConfig } = config;

  return {
    ...restConfig,
    ...(group !== undefined && { group: group.map(stripId) }),
  };
};

export const stripIdsInArray = (configs: ButtonConfig[]): ButtonConfigWithoutId[] =>
  configs.map((config) => stripId(config));
