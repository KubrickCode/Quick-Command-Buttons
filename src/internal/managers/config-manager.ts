import * as vscode from "vscode";
import {
  CONFIG_SECTION,
  CONFIG_KEYS,
  CONFIGURATION_TARGETS,
  VS_CODE_CONFIGURATION_TARGETS,
  ConfigurationTargetType,
} from "../../pkg/config-constants";
import { ButtonConfig } from "../../pkg/types";
import { ConfigWriter } from "../adapters";

type ConfigReader = { getButtons(): ButtonConfig[] };

export class ConfigManager {
  private constructor(private readonly configWriter: ConfigWriter) {}

  static create(configWriter: ConfigWriter): ConfigManager {
    return new ConfigManager(configWriter);
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
    const target = this.getVSCodeConfigurationTarget();
    await this.configWriter.writeButtons(buttons, target);
  }

  async updateConfigurationTarget(target: ConfigurationTargetType): Promise<void> {
    await this.configWriter.writeConfigurationTarget(target);
  }
}
