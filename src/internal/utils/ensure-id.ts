import { randomUUID } from "crypto";
import {
  ButtonConfig,
  ButtonConfigWithOptionalId,
  CommandButton,
  GroupButton,
} from "../../pkg/types";

export type { ButtonConfigWithOptionalId };

const isGroupButtonInput = (
  config: ButtonConfigWithOptionalId
): config is ButtonConfigWithOptionalId & { group: ButtonConfigWithOptionalId[] } =>
  "group" in config && Array.isArray(config.group);

export const ensureId = (config: ButtonConfigWithOptionalId): ButtonConfig => {
  const id = config.id ?? randomUUID();

  if (isGroupButtonInput(config)) {
    const groupButton: GroupButton = {
      color: config.color,
      executeAll: config.executeAll,
      group: config.group.map(ensureId),
      id,
      name: config.name,
      shortcut: config.shortcut,
    };
    return groupButton;
  }

  const commandButton: CommandButton = {
    color: config.color,
    command: config.command,
    id,
    insertOnly: config.insertOnly,
    name: config.name,
    shortcut: config.shortcut,
    terminalName: config.terminalName,
    useVsCodeApi: config.useVsCodeApi,
  };
  return commandButton;
};

export const ensureIdsInArray = (configs: ButtonConfigWithOptionalId[]): ButtonConfig[] =>
  configs.map((config) => ensureId(config));

const hasGroupProperty = (
  config: ButtonConfig | ButtonConfigWithOptionalId
): config is (ButtonConfig | ButtonConfigWithOptionalId) & {
  group: (ButtonConfig | ButtonConfigWithOptionalId)[];
} => "group" in config && Array.isArray(config.group);

export const stripId = (
  config: ButtonConfig | ButtonConfigWithOptionalId
): ButtonConfigWithOptionalId => {
  if (hasGroupProperty(config)) {
    const { group, id: _id, ...restConfig } = config;
    return {
      ...restConfig,
      group: group.map((c) => stripId(c)),
    };
  }

  const { id: _id, ...restConfig } = config;
  return restConfig;
};

export const stripIdsInArray = (configs: ButtonConfig[]): ButtonConfigWithOptionalId[] =>
  configs.map((config) => stripId(config));
