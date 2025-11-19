import * as vscode from "vscode";
import {
  CONFIG_SECTION,
  CONFIG_KEYS,
  CONFIGURATION_TARGETS,
  VS_CODE_CONFIGURATION_TARGETS,
  ConfigurationTargetType,
} from "../../pkg/config-constants";
import { ButtonConfig } from "../../pkg/types";

type ConfigReader = { getButtons(): ButtonConfig[] };

export class ConfigManager {
  private constructor() {}

  static create(): ConfigManager {
    return new ConfigManager();
  }

  getConfigDataForWebview(configReader: ConfigReader): {
    buttons: ButtonConfig[];
    configurationTarget: ConfigurationTargetType;
  } {
    return {
      buttons: configReader.getButtons(),
      configurationTarget: this.getCurrentConfigurationTarget(),
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
    return VS_CODE_CONFIGURATION_TARGETS[currentTarget];
  }

  async updateButtonConfiguration(buttons: ButtonConfig[]): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const target = this.getVSCodeConfigurationTarget();

    await config.update(CONFIG_KEYS.BUTTONS, buttons, target);
  }

  async updateConfigurationTarget(target: ConfigurationTargetType): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    await config.update(
      CONFIG_KEYS.CONFIGURATION_TARGET,
      target,
      vscode.ConfigurationTarget.Global // Configuration target setting itself should always be global
    );
  }
}
