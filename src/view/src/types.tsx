import type {
  ButtonConfig as BaseButtonConfig,
  ButtonSet as BaseButtonSet,
  CommandButton as BaseCommandButton,
  GroupButton as BaseGroupButton,
} from "../../shared/types";

export type CommandButton = BaseCommandButton & { index?: number };
export type GroupButton = BaseGroupButton & { index?: number };
export type ButtonConfig = BaseButtonConfig & { index?: number };

export type ButtonConfigDraft = {
  color?: string;
  command?: string;
  executeAll?: boolean;
  group?: ButtonConfig[];
  id: string;
  index?: number;
  insertOnly?: boolean;
  name: string;
  newTerminal?: boolean;
  shortcut?: string;
  terminalName?: string;
  useVsCodeApi?: boolean;
};

export const toCommandButton = (draft: ButtonConfigDraft): CommandButton => ({
  color: draft.color,
  command: draft.command ?? "",
  id: draft.id,
  index: draft.index,
  insertOnly: draft.insertOnly,
  name: draft.name,
  newTerminal: draft.newTerminal,
  shortcut: draft.shortcut,
  terminalName: draft.terminalName,
  useVsCodeApi: draft.useVsCodeApi,
});

export const toGroupButton = (draft: ButtonConfigDraft): GroupButton => ({
  color: draft.color,
  executeAll: draft.executeAll,
  group: draft.group ?? [],
  id: draft.id,
  index: draft.index,
  name: draft.name,
  shortcut: draft.shortcut,
});

export const toDraft = (config: ButtonConfig): ButtonConfigDraft => ({
  color: config.color,
  command: "command" in config ? config.command : undefined,
  executeAll: "executeAll" in config ? config.executeAll : undefined,
  group: "group" in config ? config.group : undefined,
  id: config.id,
  index: config.index,
  insertOnly: "insertOnly" in config ? config.insertOnly : undefined,
  name: config.name,
  newTerminal: "newTerminal" in config ? config.newTerminal : undefined,
  shortcut: config.shortcut,
  terminalName: "terminalName" in config ? config.terminalName : undefined,
  useVsCodeApi: "useVsCodeApi" in config ? config.useVsCodeApi : undefined,
});

export { isCommandButton, isGroupButton } from "../../shared/types";

export type { WebviewMessage as VSCodeMessage } from "../../shared/types";

export type ButtonSet = BaseButtonSet;
