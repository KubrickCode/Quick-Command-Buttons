import { subscribeWithSelector } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { AppStore } from "./types";

const DEFAULT_CONFIG_TARGET = "workspace" as const;

export const createAppStore = () =>
  createStore<AppStore>()(
    subscribeWithSelector((set) => ({
      activeSet: null,
      buttons: [],
      buttonSets: [],
      configTarget: DEFAULT_CONFIG_TARGET,

      setActiveSet: (activeSet) => set({ activeSet }),
      setButtons: (buttons) => set({ buttons }),
      setButtonSets: (buttonSets) => set({ buttonSets }),
      setConfigTarget: (configTarget) => set({ configTarget }),
    }))
  );

export type AppStoreInstance = ReturnType<typeof createAppStore>;

let appStoreInstance: AppStoreInstance | null = null;

export const getAppStore = (): AppStoreInstance => {
  if (!appStoreInstance) {
    appStoreInstance = createAppStore();
  }
  return appStoreInstance;
};

export const resetAppStore = (): void => {
  appStoreInstance = null;
};
