import * as vscode from "vscode";
import {
  CONFIG_SECTION,
  CONFIG_KEYS,
  CONFIGURATION_TARGETS,
  VS_CODE_CONFIGURATION_TARGETS,
  ConfigurationTargetType,
} from "../../pkg/config-constants";
import { ButtonConfig } from "../../pkg/types";
import { ConfigWriter, ProjectLocalStorage } from "../adapters";

type ConfigReader = {
  getButtons(): ButtonConfig[];
  getButtonsFromScope(target: vscode.ConfigurationTarget): ButtonConfig[];
};

export class ConfigManager {
  private constructor(
    private readonly configWriter: ConfigWriter,
    private readonly localStorage?: ProjectLocalStorage
  ) {}

  static create(configWriter: ConfigWriter, localStorage?: ProjectLocalStorage): ConfigManager {
    return new ConfigManager(configWriter, localStorage);
  }

  getButtonsForTarget(target: ConfigurationTargetType, configReader: ConfigReader): ButtonConfig[] {
    switch (target) {
      case CONFIGURATION_TARGETS.LOCAL:
        return this.localStorage?.getButtons() ?? [];
      case CONFIGURATION_TARGETS.WORKSPACE:
        return configReader.getButtonsFromScope(vscode.ConfigurationTarget.Workspace);
      case CONFIGURATION_TARGETS.GLOBAL:
        return configReader.getButtonsFromScope(vscode.ConfigurationTarget.Global);
      default:
        return [];
    }
  }

  getButtonsWithFallback(configReader: ConfigReader): {
    buttons: ButtonConfig[];
    scope: ConfigurationTargetType;
  } {
    const currentTarget = this.getCurrentConfigurationTarget();

    if (currentTarget === CONFIGURATION_TARGETS.LOCAL && this.localStorage) {
      const localButtons = this.localStorage.getButtons();
      if (localButtons.length > 0) {
        return { buttons: localButtons, scope: CONFIGURATION_TARGETS.LOCAL };
      }
    }

    if (
      currentTarget === CONFIGURATION_TARGETS.LOCAL ||
      currentTarget === CONFIGURATION_TARGETS.WORKSPACE
    ) {
      const workspaceButtons = configReader.getButtonsFromScope(
        vscode.ConfigurationTarget.Workspace
      );
      if (workspaceButtons.length > 0) {
        return { buttons: workspaceButtons, scope: CONFIGURATION_TARGETS.WORKSPACE };
      }
    }

    const globalButtons = configReader.getButtonsFromScope(vscode.ConfigurationTarget.Global);
    return { buttons: globalButtons, scope: CONFIGURATION_TARGETS.GLOBAL };
  }

  getConfigDataForWebview(
    configReader: ConfigReader,
    overrideTarget?: ConfigurationTargetType
  ): {
    buttons: ButtonConfig[];
    configurationTarget: ConfigurationTargetType;
  } {
    const currentTarget = overrideTarget ?? this.getCurrentConfigurationTarget();
    const buttons = this.getButtonsForTarget(currentTarget, configReader);

    return {
      buttons,
      configurationTarget: currentTarget,
    };
  }

  getCurrentConfigurationTarget(): ConfigurationTargetType {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return config.get<ConfigurationTargetType>(
      CONFIG_KEYS.CONFIGURATION_TARGET,
      CONFIGURATION_TARGETS.WORKSPACE
    );
  }

  getVSCodeConfigurationTarget(): vscode.ConfigurationTarget {
    const currentTarget = this.getCurrentConfigurationTarget();
    if (currentTarget === CONFIGURATION_TARGETS.LOCAL) {
      throw new Error("LOCAL scope uses workspaceState, not VS Code ConfigurationTarget");
    }
    return VS_CODE_CONFIGURATION_TARGETS[currentTarget];
  }

  async updateButtonConfiguration(buttons: ButtonConfig[]): Promise<void> {
    const currentTarget = this.getCurrentConfigurationTarget();

    if (currentTarget === CONFIGURATION_TARGETS.LOCAL && this.localStorage) {
      await this.localStorage.setButtons(buttons);
      return;
    }

    const target = this.getVSCodeConfigurationTarget();
    await this.configWriter.writeButtons(buttons, target);
  }

  async updateConfigurationTarget(target: ConfigurationTargetType): Promise<void> {
    await this.configWriter.writeConfigurationTarget(target);
  }
}
