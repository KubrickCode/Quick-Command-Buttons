import { randomUUID } from "crypto";
import {
  ButtonConfig,
  ButtonConfigWithOptionalId,
  ButtonSet,
  ButtonSetWithOptionalId,
  ButtonSetWithoutId,
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
    command: config.command ?? "",
    id,
    insertOnly: config.insertOnly,
    name: config.name,
    newTerminal: config.newTerminal,
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

// Button Set ID utilities
export const ensureSetId = (set: ButtonSetWithOptionalId): ButtonSet => ({
  buttons: ensureIdsInArray(set.buttons),
  id: set.id ?? randomUUID(),
  name: set.name,
});

export const ensureSetIdsInArray = (sets: ButtonSetWithOptionalId[]): ButtonSet[] =>
  sets.map(ensureSetId);

export const stripSetId = (set: ButtonSet): ButtonSetWithoutId => ({
  buttons: stripIdsInArray(set.buttons),
  name: set.name,
});

export const stripSetIdsInArray = (sets: ButtonSet[]): ButtonSetWithoutId[] => sets.map(stripSetId);

// Button Set name validation
export const validateUniqueSetName = (name: string, existingSets: ButtonSet[]): boolean =>
  !existingSets.some((set) => set.name.toLowerCase() === name.toLowerCase());
