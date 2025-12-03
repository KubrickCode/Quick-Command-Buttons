import { temporal, type TemporalState } from "zundo";
import { create, useStore } from "zustand";

import type { ButtonConfig } from "../types";

type CommandState = {
  commands: ButtonConfig[];
};

type CommandActions = {
  setCommands: (commands: ButtonConfig[]) => void;
};

type CommandStore = CommandActions & CommandState;

const HISTORY_LIMIT = 50;

export const commandStore = create<CommandStore>()(
  temporal(
    (set) => ({
      commands: [],
      setCommands: (commands) => set({ commands }),
    }),
    { limit: HISTORY_LIMIT }
  )
);

export const useCommandStore = <T>(selector: (state: CommandStore) => T): T =>
  useStore(commandStore, selector);

export const useTemporalStore = <T>(selector: (state: TemporalState<CommandState>) => T): T =>
  useStore(commandStore.temporal, selector);
