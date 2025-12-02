import * as vscode from "vscode";
import { CONFIGURATION_TARGETS, ConfigurationTargetType } from "../../pkg/config-constants";
import { ButtonConfig } from "../../shared/types";

type ButtonsReader = {
  getButtonsFromScope: (target: vscode.ConfigurationTarget) => ButtonConfig[];
};

type ButtonsStorage = {
  getButtons: () => ButtonConfig[];
};

export const resolveButtonsWithFallback = ({
  configReader,
  currentTarget,
  localStorage,
}: {
  configReader: ButtonsReader;
  currentTarget: ConfigurationTargetType;
  localStorage?: ButtonsStorage;
}): { buttons: ButtonConfig[]; scope: ConfigurationTargetType } => {
  if (currentTarget === CONFIGURATION_TARGETS.LOCAL && localStorage) {
    const localButtons = localStorage.getButtons();
    if (localButtons.length > 0) {
      return { buttons: localButtons, scope: CONFIGURATION_TARGETS.LOCAL };
    }
  }

  if (
    currentTarget === CONFIGURATION_TARGETS.LOCAL ||
    currentTarget === CONFIGURATION_TARGETS.WORKSPACE
  ) {
    const workspaceButtons = configReader.getButtonsFromScope(vscode.ConfigurationTarget.Workspace);
    if (workspaceButtons.length > 0) {
      return { buttons: workspaceButtons, scope: CONFIGURATION_TARGETS.WORKSPACE };
    }
  }

  const globalButtons = configReader.getButtonsFromScope(vscode.ConfigurationTarget.Global);
  return { buttons: globalButtons, scope: CONFIGURATION_TARGETS.GLOBAL };
};
