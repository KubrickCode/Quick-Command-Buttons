import * as vscode from "vscode";
import {
  CONFIG_SECTION,
  CONFIG_KEYS,
  CONFIGURATION_TARGETS,
  ConfigurationTargetType,
} from "../../pkg/config-constants";
import {
  ButtonConfig,
  ButtonConfigWithOptionalId,
  ButtonSet,
  ButtonSetWithoutId,
} from "../../pkg/types";
import { ConfigReader } from "../adapters";
import { EventBus } from "../event-bus";
import {
  ensureIdsInArray,
  ensureSetId,
  ensureSetIdsInArray,
  stripSetIdsInArray,
  validateUniqueSetName,
} from "../utils/ensure-id";
import { ConfigManager } from "./config-manager";

const LOCAL_BUTTON_SETS_STORAGE_KEY = "quickCommandButtons.localButtonSets";
const LOCAL_ACTIVE_SET_STORAGE_KEY = "quickCommandButtons.localActiveSet";

type ButtonSetOperationResult =
  | { error: "duplicateSetName" | "setNameRequired" | "setNotFound"; success: false }
  | { success: true };

type ButtonSetLocalStorage = {
  getActiveSet: () => string | null;
  getButtonSets: () => ButtonSet[];
  setActiveSet: (setName: string | null) => Promise<void>;
  setButtonSets: (sets: ButtonSet[]) => Promise<void>;
};

type ButtonSetWriter = {
  writeActiveSet: (setName: string | null, target: vscode.ConfigurationTarget) => Promise<void>;
  writeButtonSets: (sets: ButtonSet[], target: vscode.ConfigurationTarget) => Promise<void>;
};

export const createButtonSetLocalStorage = (
  context: vscode.ExtensionContext
): ButtonSetLocalStorage => ({
  getActiveSet: () =>
    context.workspaceState.get<string | null>(LOCAL_ACTIVE_SET_STORAGE_KEY) ?? null,
  getButtonSets: () => {
    const sets = context.workspaceState.get<ButtonSetWithoutId[]>(LOCAL_BUTTON_SETS_STORAGE_KEY);
    return sets ? ensureSetIdsInArray(sets) : [];
  },
  setActiveSet: async (setName: string | null) => {
    await context.workspaceState.update(LOCAL_ACTIVE_SET_STORAGE_KEY, setName);
  },
  setButtonSets: async (sets: ButtonSet[]) => {
    const setsWithoutIds = stripSetIdsInArray(sets);
    await context.workspaceState.update(LOCAL_BUTTON_SETS_STORAGE_KEY, setsWithoutIds);
  },
});

export const createButtonSetWriter = (): ButtonSetWriter => ({
  writeActiveSet: async (setName: string | null, target: vscode.ConfigurationTarget) => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    await config.update(CONFIG_KEYS.ACTIVE_SET, setName, target);
  },
  writeButtonSets: async (sets: ButtonSet[], target: vscode.ConfigurationTarget) => {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const setsWithoutIds = stripSetIdsInArray(sets);
    await config.update(CONFIG_KEYS.BUTTON_SETS, setsWithoutIds, target);
  },
});

export class ButtonSetManager {
  private constructor(
    private readonly configManager: ConfigManager,
    private readonly configReader: ConfigReader,
    private readonly buttonSetWriter: ButtonSetWriter,
    private readonly buttonSetLocalStorage?: ButtonSetLocalStorage,
    private readonly eventBus?: EventBus
  ) {}

  static create({
    buttonSetLocalStorage,
    buttonSetWriter,
    configManager,
    configReader,
    eventBus,
  }: {
    buttonSetLocalStorage?: ButtonSetLocalStorage;
    buttonSetWriter: ButtonSetWriter;
    configManager: ConfigManager;
    configReader: ConfigReader;
    eventBus?: EventBus;
  }): ButtonSetManager {
    return new ButtonSetManager(
      configManager,
      configReader,
      buttonSetWriter,
      buttonSetLocalStorage,
      eventBus
    );
  }

  async createButtonSet(
    name: string,
    buttons: ButtonConfigWithOptionalId[] = [],
    sourceSetId?: string
  ): Promise<ButtonSetOperationResult> {
    const validation = this.validateSetName(name);
    if (validation.error) {
      return { error: validation.error, success: false };
    }

    const sets = this.getButtonSets();
    let buttonsToUse: ButtonConfigWithOptionalId[] = buttons;
    if (sourceSetId) {
      const sourceSet = sets.find((set) => set.id === sourceSetId);
      if (sourceSet) {
        buttonsToUse = sourceSet.buttons;
      }
    }

    const currentTarget = this.configManager.getCurrentConfigurationTarget();
    const newSet = ensureSetId({
      buttons: buttonsToUse,
      name: validation.trimmedName,
    });

    const updatedSets = [...sets, newSet];
    await this.writeButtonSets(updatedSets, currentTarget);

    this.eventBus?.emit("buttonSet:created", { setName: validation.trimmedName });

    return { success: true };
  }

  async deleteButtonSet(name: string): Promise<void> {
    const currentTarget = this.configManager.getCurrentConfigurationTarget();
    const sets = this.getButtonSets();
    const lowerCaseName = name.toLowerCase();
    const filteredSets = sets.filter((set) => set.name.toLowerCase() !== lowerCaseName);

    if (filteredSets.length === sets.length) {
      return;
    }

    await this.writeButtonSets(filteredSets, currentTarget);

    const activeSet = this.getActiveSet();
    if (activeSet?.toLowerCase() === lowerCaseName) {
      await this.setActiveSet(null);
    }

    this.eventBus?.emit("buttonSet:deleted", { setName: name });
  }

  getActiveSet(): string | null {
    const currentTarget = this.configManager.getCurrentConfigurationTarget();

    if (currentTarget === CONFIGURATION_TARGETS.LOCAL && this.buttonSetLocalStorage) {
      return this.buttonSetLocalStorage.getActiveSet();
    }

    return this.getConfigValueForScope<string | null>(CONFIG_KEYS.ACTIVE_SET, null);
  }

  getButtonSets(): ButtonSet[] {
    const currentTarget = this.configManager.getCurrentConfigurationTarget();

    if (currentTarget === CONFIGURATION_TARGETS.LOCAL && this.buttonSetLocalStorage) {
      return this.buttonSetLocalStorage.getButtonSets();
    }

    const sets = this.getConfigValueForScope<ButtonSetWithoutId[]>(CONFIG_KEYS.BUTTON_SETS, []);
    return ensureSetIdsInArray(sets);
  }

  getButtonsForActiveSet(): ButtonConfig[] | null {
    const activeSet = this.getActiveSet();
    if (!activeSet) {
      return null;
    }

    const sets = this.getButtonSets();
    const matchingSet = sets.find((set) => set.name === activeSet);

    return matchingSet?.buttons ?? null;
  }

  async renameButtonSet(currentName: string, newName: string): Promise<ButtonSetOperationResult> {
    const sets = this.getButtonSets();
    const setIndex = sets.findIndex((set) => set.name.toLowerCase() === currentName.toLowerCase());

    if (setIndex === -1) {
      return { error: "setNotFound", success: false };
    }

    const validation = this.validateSetName(newName, currentName);
    if (validation.error) {
      return { error: validation.error, success: false };
    }

    const existingSet = sets[setIndex];
    const updatedSet: ButtonSet = {
      ...existingSet,
      name: validation.trimmedName,
    };

    const updatedSets = [...sets];
    updatedSets[setIndex] = updatedSet;

    const currentTarget = this.configManager.getCurrentConfigurationTarget();
    const activeSet = this.getActiveSet();
    const needsActiveSetUpdate = activeSet?.toLowerCase() === currentName.toLowerCase();

    await this.writeButtonSets(updatedSets, currentTarget);

    if (needsActiveSetUpdate) {
      await this.setActiveSet(validation.trimmedName);
    }

    this.eventBus?.emit("buttonSet:renamed", {
      newName: validation.trimmedName,
      oldName: currentName,
    });

    return { success: true };
  }

  async saveAsButtonSet(name: string): Promise<ButtonSetOperationResult> {
    const validation = this.validateSetName(name);
    if (validation.error) {
      return { error: validation.error, success: false };
    }

    const sets = this.getButtonSets();
    const currentTarget = this.configManager.getCurrentConfigurationTarget();

    const activeButtons = this.getButtonsForActiveSet();
    const { buttons: defaultButtons } = this.configManager.getButtonsWithFallback(
      this.configReader
    );
    const buttons = activeButtons ?? defaultButtons;

    const newSet = ensureSetId({
      buttons: buttons,
      name: validation.trimmedName,
    });

    const updatedSets = [...sets, newSet];
    await this.writeButtonSets(updatedSets, currentTarget);

    return { success: true };
  }

  async setActiveSet(name: string | null): Promise<void> {
    const currentTarget = this.configManager.getCurrentConfigurationTarget();

    if (currentTarget === CONFIGURATION_TARGETS.LOCAL && this.buttonSetLocalStorage) {
      await this.buttonSetLocalStorage.setActiveSet(name);
      this.eventBus?.emit("buttonSet:switched", { setName: name });
      return;
    }

    const target =
      currentTarget === CONFIGURATION_TARGETS.WORKSPACE
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;
    await this.buttonSetWriter.writeActiveSet(name, target);
    this.eventBus?.emit("buttonSet:switched", { setName: name });
  }

  async updateActiveSetButtons(buttons: ButtonConfigWithOptionalId[]): Promise<boolean> {
    const activeSetName = this.getActiveSet();
    if (!activeSetName) {
      return false; // No active set, save to default buttons
    }

    const sets = this.getButtonSets();
    const setIndex = sets.findIndex((set) => set.name === activeSetName);

    if (setIndex === -1) {
      return false; // Active set not found
    }

    const updatedSet: ButtonSet = {
      ...sets[setIndex],
      buttons: ensureIdsInArray(buttons),
    };

    const updatedSets = [...sets];
    updatedSets[setIndex] = updatedSet;

    const currentTarget = this.configManager.getCurrentConfigurationTarget();
    await this.writeButtonSets(updatedSets, currentTarget);

    return true;
  }

  validateUniqueName(name: string): boolean {
    const sets = this.getButtonSets();
    return validateUniqueSetName(name, sets);
  }

  private getConfigValueForScope<T>(key: string, defaultValue: T): T {
    const currentTarget = this.configManager.getCurrentConfigurationTarget();
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const inspection = config.inspect<T>(key);

    if (currentTarget === CONFIGURATION_TARGETS.WORKSPACE) {
      return inspection?.workspaceValue ?? defaultValue;
    }
    return inspection?.globalValue ?? defaultValue;
  }

  private validateSetName(
    name: string,
    existingName?: string
  ): { error?: "duplicateSetName" | "setNameRequired"; trimmedName: string } {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return { error: "setNameRequired", trimmedName };
    }

    const sets = this.getButtonSets();
    const isDuplicate = sets.some(
      (set) =>
        set.name.toLowerCase() === trimmedName.toLowerCase() &&
        set.name.toLowerCase() !== existingName?.toLowerCase()
    );
    if (isDuplicate) {
      return { error: "duplicateSetName", trimmedName };
    }

    return { trimmedName };
  }

  private async writeButtonSets(
    sets: ButtonSet[],
    currentTarget: ConfigurationTargetType
  ): Promise<void> {
    if (currentTarget === CONFIGURATION_TARGETS.LOCAL && this.buttonSetLocalStorage) {
      await this.buttonSetLocalStorage.setButtonSets(sets);
      return;
    }

    const target =
      currentTarget === CONFIGURATION_TARGETS.WORKSPACE
        ? vscode.ConfigurationTarget.Workspace
        : vscode.ConfigurationTarget.Global;
    await this.buttonSetWriter.writeButtonSets(sets, target);
  }
}
