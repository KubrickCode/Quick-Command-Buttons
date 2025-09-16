import * as vscode from "vscode";
import { ButtonConfig } from "./types";
import {
  CONFIG_SECTION,
  CONFIG_KEYS,
  CONFIGURATION_TARGETS,
  VS_CODE_CONFIGURATION_TARGETS,
  ConfigurationTargetType,
} from "./config-constants";

export class ConfigManager {
  static getCurrentConfigurationTarget(): ConfigurationTargetType {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return config.get<ConfigurationTargetType>(
      CONFIG_KEYS.CONFIGURATION_TARGET,
      CONFIGURATION_TARGETS.WORKSPACE
    );
  }

  static getVSCodeConfigurationTarget(): vscode.ConfigurationTarget {
    const currentTarget = this.getCurrentConfigurationTarget();
    return VS_CODE_CONFIGURATION_TARGETS[currentTarget];
  }

  static async updateConfigurationTarget(
    target: ConfigurationTargetType
  ): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      await config.update(
        CONFIG_KEYS.CONFIGURATION_TARGET,
        target,
        vscode.ConfigurationTarget.Global // Configuration target setting itself should always be global
      );

      const targetMessage =
        target === CONFIGURATION_TARGETS.GLOBAL
          ? "user settings (shared across all projects)"
          : "workspace settings (project-specific)";

      vscode.window.showInformationMessage(
        `Configuration target changed to: ${targetMessage}`
      );
    } catch (error) {
      console.error("Failed to update configuration target:", error);
      vscode.window.showErrorMessage(
        "Failed to update configuration target. Please try again."
      );
    }
  }

  static async updateButtonConfiguration(
    buttons: ButtonConfig[]
  ): Promise<void> {
    try {
      const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
      const target = this.getVSCodeConfigurationTarget();

      await config.update(CONFIG_KEYS.BUTTONS, buttons, target);

      const currentTarget = this.getCurrentConfigurationTarget();
      const targetMessage =
        currentTarget === CONFIGURATION_TARGETS.GLOBAL
          ? "user settings"
          : "workspace settings";

      vscode.window.showInformationMessage(
        `Configuration updated successfully in ${targetMessage}!`
      );
    } catch (error) {
      console.error("Failed to update configuration:", error);
      vscode.window.showErrorMessage(
        "Failed to update configuration. Please try again."
      );
    }
  }

  static getConfigDataForWebview(configReader: {
    getButtons(): ButtonConfig[];
  }): {
    buttons: ButtonConfig[];
    configurationTarget: ConfigurationTargetType;
  } {
    return {
      buttons: configReader.getButtons(),
      configurationTarget: this.getCurrentConfigurationTarget(),
    };
  }
}
