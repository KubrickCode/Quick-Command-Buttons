import * as vscode from "vscode";
import {
  CONFIG_SECTION,
  CONFIGURATION_TARGETS,
  ConfigurationTargetType,
} from "../../pkg/config-constants";
import { ButtonSet } from "../../shared/types";
import { ConfigReader, ProjectLocalStorage } from "../adapters";
import { resolveButtonsWithFallback } from "../utils/config-fallback";
import { ensureSetIdsInArray } from "../utils/ensure-id";
import type { AppStoreInstance } from "./app-store";

type ButtonSetLocalStorage = {
  getActiveSet: () => string | null;
  getButtonSets: () => ButtonSet[];
};

type StoreSyncDeps = {
  buttonSetLocalStorage?: ButtonSetLocalStorage;
  configReader: ConfigReader;
  localStorage?: ProjectLocalStorage;
  store: AppStoreInstance;
};

export class StoreSync implements vscode.Disposable {
  private readonly buttonSetLocalStorage?: ButtonSetLocalStorage;
  private configChangeListener?: vscode.Disposable;
  private readonly configReader: ConfigReader;
  private isSyncingFromSettings = false;
  private isSyncingToSettings = false;
  private readonly localStorage?: ProjectLocalStorage;
  private readonly store: AppStoreInstance;

  private constructor(deps: StoreSyncDeps) {
    this.buttonSetLocalStorage = deps.buttonSetLocalStorage;
    this.configReader = deps.configReader;
    this.localStorage = deps.localStorage;
    this.store = deps.store;
  }

  static create(deps: StoreSyncDeps): StoreSync {
    return new StoreSync(deps);
  }

  dispose(): void {
    this.configChangeListener?.dispose();
  }

  initializeFromSettings(): void {
    this.syncFromSettings();
  }

  startSettingsChangeListener(): void {
    this.configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration(CONFIG_SECTION)) {
        return;
      }
      this.onSettingsChange();
    });
  }

  private getActiveSetForTarget(target: ConfigurationTargetType): string | null {
    if (target === CONFIGURATION_TARGETS.LOCAL && this.buttonSetLocalStorage) {
      return this.buttonSetLocalStorage.getActiveSet();
    }

    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const inspection = config.inspect<string | null>("activeSet");

    if (target === CONFIGURATION_TARGETS.WORKSPACE) {
      return inspection?.workspaceValue ?? null;
    }
    return inspection?.globalValue ?? null;
  }

  private getButtonSetsForTarget(target: ConfigurationTargetType): ButtonSet[] {
    if (target === CONFIGURATION_TARGETS.LOCAL && this.buttonSetLocalStorage) {
      return this.buttonSetLocalStorage.getButtonSets();
    }

    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const inspection = config.inspect<ButtonSet[]>("buttonSets");

    let rawSets: ButtonSet[] = [];
    if (target === CONFIGURATION_TARGETS.WORKSPACE) {
      rawSets = inspection?.workspaceValue ?? [];
    } else if (target === CONFIGURATION_TARGETS.GLOBAL) {
      rawSets = inspection?.globalValue ?? [];
    }

    return ensureSetIdsInArray(rawSets);
  }

  private getCurrentConfigTarget(): ConfigurationTargetType {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    return config.get<ConfigurationTargetType>(
      "configurationTarget",
      CONFIGURATION_TARGETS.WORKSPACE
    );
  }

  private onSettingsChange(): void {
    if (this.isSyncingFromSettings || this.isSyncingToSettings) {
      return;
    }
    this.isSyncingFromSettings = true;
    try {
      this.syncFromSettings();
    } catch (error) {
      console.error("[StoreSync] Failed to sync from settings:", error);
    } finally {
      this.isSyncingFromSettings = false;
    }
  }

  private syncFromSettings(): void {
    const configTarget = this.getCurrentConfigTarget();
    const activeSet = this.getActiveSetForTarget(configTarget);
    const buttonSets = this.getButtonSetsForTarget(configTarget);

    const { buttons: fallbackButtons } = resolveButtonsWithFallback({
      configReader: this.configReader,
      currentTarget: configTarget,
      localStorage: this.localStorage,
    });

    let buttons = fallbackButtons;
    if (activeSet) {
      const matchingSet = buttonSets.find((set) => set.name === activeSet);
      if (matchingSet) {
        buttons = matchingSet.buttons;
      }
    }

    const state = this.store.getState();
    state.setButtons(buttons);
    state.setConfigTarget(configTarget);
    state.setButtonSets(buttonSets);
    state.setActiveSet(activeSet);
  }
}
