import type { ButtonConfig, ButtonSet, ConfigurationTarget } from "../../shared/types";

export type AppState = {
  activeSet: string | null;
  buttons: ButtonConfig[];
  buttonSets: ButtonSet[];
  configTarget: ConfigurationTarget;
};

export type AppActions = {
  setActiveSet: (name: string | null) => void;
  setButtons: (buttons: ButtonConfig[]) => void;
  setButtonSets: (sets: ButtonSet[]) => void;
  setConfigTarget: (target: ConfigurationTarget) => void;
};

export type AppStore = AppActions & AppState;
