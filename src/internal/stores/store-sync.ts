import * as vscode from "vscode";
import {
  CONFIG_KEYS,
  CONFIG_SECTION,
  CONFIGURATION_TARGETS,
  ConfigurationTargetType,
  VS_CODE_CONFIGURATION_TARGETS,
} from "../../pkg/config-constants";
import { ButtonConfig, ButtonSet } from "../../shared/types";
import { ConfigReader, ConfigWriter, ProjectLocalStorage } from "../adapters";
import { resolveButtonsWithFallback } from "../utils/config-fallback";
import { ensureSetIdsInArray, stripSetIdsInArray } from "../utils/ensure-id";
import type { AppStoreInstance } from "./app-store";

type ButtonSetLocalStorage = {
  getActiveSet: () => string | null;
  getButtonSets: () => ButtonSet[];
  setActiveSet: (name: string | null) => Promise<void>;
  setButtonSets: (sets: ButtonSet[]) => Promise<void>;
};

type StoreSyncDeps = {
  buttonSetLocalStorage?: ButtonSetLocalStorage;
  configReader: ConfigReader;
  configWriter?: ConfigWriter;
  localStorage?: ProjectLocalStorage;
  store: AppStoreInstance;
};

export class StoreSync implements vscode.Disposable {
  private readonly buttonSetLocalStorage?: ButtonSetLocalStorage;
  private configChangeListener?: vscode.Disposable;
  private readonly configReader: ConfigReader;
  private readonly configWriter?: ConfigWriter;
  private isSyncingFromSettings = false;
  private isSyncingToSettings = false;
  private readonly localStorage?: ProjectLocalStorage;
  private pendingSaves = new Map<string, Promise<void>>();
  private readonly store: AppStoreInstance;
  private storeUnsubscribes: (() => void)[] = [];

  private constructor(deps: StoreSyncDeps) {
    this.buttonSetLocalStorage = deps.buttonSetLocalStorage;
    this.configReader = deps.configReader;
    this.configWriter = deps.configWriter;
    this.localStorage = deps.localStorage;
    this.store = deps.store;
  }

  static create(deps: StoreSyncDeps): StoreSync {
    return new StoreSync(deps);
  }

  dispose(): void {
    this.configChangeListener?.dispose();
    this.storeUnsubscribes.forEach((unsubscribe) => unsubscribe());
    this.storeUnsubscribes = [];
  }

  initializeFromSettings(): void {
    this.syncFromSettings();
  }

  startBidirectionalSync(): void {
    this.startSettingsChangeListener();
    this.startStoreChangeListener();
  }

  startSettingsChangeListener(): void {
    this.configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
      if (!event.affectsConfiguration(CONFIG_SECTION)) {
        return;
      }
      this.onSettingsChange();
    });
  }

  startStoreChangeListener(): void {
    const unsubscribeButtons = this.store.subscribe(
      (state) => state.buttons,
      (buttons) => this.onStoreButtonsChange(buttons)
    );

    const unsubscribeButtonSets = this.store.subscribe(
      (state) => state.buttonSets,
      (buttonSets) => this.onStoreButtonSetsChange(buttonSets)
    );

    const unsubscribeActiveSet = this.store.subscribe(
      (state) => state.activeSet,
      (activeSet) => this.onStoreActiveSetChange(activeSet)
    );

    this.storeUnsubscribes.push(unsubscribeButtons, unsubscribeButtonSets, unsubscribeActiveSet);
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

  private onStoreActiveSetChange(activeSet: string | null): void {
    if (this.isSyncingFromSettings) {
      return;
    }
    this.queueSave(CONFIG_KEYS.ACTIVE_SET, () => this.saveActiveSetToSettings(activeSet));
  }

  private onStoreButtonsChange(buttons: ButtonConfig[]): void {
    if (this.isSyncingFromSettings) {
      return;
    }
    this.queueSave(CONFIG_KEYS.BUTTONS, () => this.saveButtonsToSettings(buttons));
  }

  private onStoreButtonSetsChange(buttonSets: ButtonSet[]): void {
    if (this.isSyncingFromSettings) {
      return;
    }
    this.queueSave(CONFIG_KEYS.BUTTON_SETS, () => this.saveButtonSetsToSettings(buttonSets));
  }

  private queueSave(key: string, saveFn: () => Promise<void>): void {
    const previousSave = this.pendingSaves.get(key) ?? Promise.resolve();

    const currentSave = previousSave
      .then(() => {
        this.isSyncingToSettings = true;
        return saveFn();
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(`[StoreSync] Failed to save ${key}:`, error);
        vscode.window.showErrorMessage(`Failed to save ${key}: ${message}`);
      })
      .finally(() => {
        if (this.pendingSaves.get(key) === currentSave) {
          this.pendingSaves.delete(key);
        }
        if (this.pendingSaves.size === 0) {
          this.isSyncingToSettings = false;
        }
      });

    this.pendingSaves.set(key, currentSave);
  }

  private async saveActiveSetToSettings(activeSet: string | null): Promise<void> {
    const configTarget = this.store.getState().configTarget;

    if (configTarget === CONFIGURATION_TARGETS.LOCAL) {
      if (!this.buttonSetLocalStorage) {
        throw new Error("ButtonSetLocalStorage is required for local scope");
      }
      await this.buttonSetLocalStorage.setActiveSet(activeSet);
      return;
    }

    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const vsCodeTarget = VS_CODE_CONFIGURATION_TARGETS[configTarget];
    await config.update(CONFIG_KEYS.ACTIVE_SET, activeSet, vsCodeTarget);
  }

  private async saveButtonSetsToSettings(buttonSets: ButtonSet[]): Promise<void> {
    const configTarget = this.store.getState().configTarget;

    if (configTarget === CONFIGURATION_TARGETS.LOCAL) {
      if (!this.buttonSetLocalStorage) {
        throw new Error("ButtonSetLocalStorage is required for local scope");
      }
      await this.buttonSetLocalStorage.setButtonSets(buttonSets);
      return;
    }

    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const vsCodeTarget = VS_CODE_CONFIGURATION_TARGETS[configTarget];
    const setsWithoutIds = stripSetIdsInArray(buttonSets);
    await config.update(CONFIG_KEYS.BUTTON_SETS, setsWithoutIds, vsCodeTarget);
  }

  private async saveButtonsToSettings(buttons: ButtonConfig[]): Promise<void> {
    const configTarget = this.store.getState().configTarget;

    if (configTarget === CONFIGURATION_TARGETS.LOCAL) {
      if (!this.localStorage) {
        throw new Error("ProjectLocalStorage is required for local scope");
      }
      await this.localStorage.setButtons(buttons);
      return;
    }

    if (!this.configWriter) {
      throw new Error("ConfigWriter is required for workspace/global scope");
    }

    const vsCodeTarget = VS_CODE_CONFIGURATION_TARGETS[configTarget];
    await this.configWriter.writeButtons(buttons, vsCodeTarget);
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
