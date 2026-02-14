export const CONFIG = {
  KEYS: {
    ACTIVE_SET: "activeSet",
    BUTTON_SETS: "buttonSets",
    BUTTONS: "buttons",
    CONFIGURATION_TARGET: "configurationTarget",
    REFRESH_BUTTON: "refreshButton",
    SET_INDICATOR: "setIndicator",
  },
  SECTION: "quickCommandButtons",
} as const;

export const CONFIGURATION_TARGET = {
  GLOBAL: "global",
  LOCAL: "local",
  WORKSPACE: "workspace",
} as const;

export const MESSAGE_TYPE = {
  CONFIG_DATA: "configData",
  CONFIGURATION_TARGET_CHANGED: "configurationTargetChanged",
  CONFIRM_IMPORT: "confirmImport",
  CREATE_BUTTON_SET: "createButtonSet",
  DELETE_BUTTON_SET: "deleteButtonSet",
  ERROR: "error",
  EXPORT_CONFIGURATION: "exportConfiguration",
  GET_CONFIG: "getConfig",
  IMPORT_CONFIGURATION: "importConfiguration",
  IMPORT_PREVIEW_RESULT: "importPreviewResult",
  PREVIEW_IMPORT: "previewImport",
  RENAME_BUTTON_SET: "renameButtonSet",
  SAVE_AS_BUTTON_SET: "saveAsButtonSet",
  SET_ACTIVE_SET: "setActiveSet",
  SET_CONFIG: "setConfig",
  SET_CONFIGURATION_TARGET: "setConfigurationTarget",
  SET_SET_INDICATOR_ENABLED: "setSetIndicatorEnabled",
  THEME_CHANGED: "themeChanged",
} as const;

export const MESSAGES = {
  ERROR: {
    backupFailedAndImportCancelled: (error: string) =>
      `Failed to create backup: ${error}. Import cancelled for safety.`,
    buttonSetManagerNotAvailable: "Button set manager not available",
    communicationTimeout: "Communication with extension timed out. Please try again.",
    configSaveFailed: "Failed to save configuration",
    configScopeChangedSincePreview:
      "Configuration scope has changed since preview. Please re-preview the import.",
    contextRequired: (hookName: string) =>
      `${hookName} must be used within a VscodeCommandProvider`,
    duplicateShortcuts: (shortcuts: string[]) =>
      `Duplicate shortcuts detected: ${shortcuts.join(", ")}. Please ensure each shortcut is unique.`,
    extensionError: (error: string) => `Extension error: ${error}`,
    importExportManagerNotAvailable: "Import/Export manager not available",
    importPreviewExpired: "Preview has expired. Please re-select the file to import.",
    invalidConfigurationTarget: (target: string) =>
      `Invalid target for setConfigurationTarget: ${target}`,
    invalidImportConfirmationData:
      "Invalid import confirmation data. Please restart the import process from the preview dialog.",
    invalidSetConfigData: "Invalid data for setConfig: data is not an array.",
    noCommands: "No commands found",
    renameButtonSetFailed: "Failed to rename button set",
    renameRequiresBothNames: "Both current name and new name are required for rename",
    unknownError: "Unknown error occurred",
  },
  INFO: {
    commandsCount: (count: number) => `${count} commands`,
    groupCommands: (buttonName: string) => `${buttonName} Commands`,
    quickCommands: "Quick Commands",
    selectCommand: "Select a command to execute",
    selectCommandOrGroup: "Select a command/group to execute (or type shortcut key)",
  },
  SUCCESS: {
    configSaved: "Configuration saved successfully",
  },
} as const;

export const TOAST_DURATION = {
  ERROR: 4000,
  SUCCESS: 2000,
  TIMEOUT: 5000,
} as const;

export const COMMANDS = {
  DELETE_BUTTON_SET: "quickCommandButtons.deleteButtonSet",
  OPEN_CONFIG: "quickCommandButtons.openConfig",
  REFRESH: "quickCommandButtons.refresh",
  SAVE_AS_BUTTON_SET: "quickCommandButtons.saveAsButtonSet",
  SWITCH_BUTTON_SET: "quickCommandButtons.switchButtonSet",
} as const;

export const DEFAULT_IMPORT_STRATEGY = "merge" as const;

export const DEFAULT_TERMINAL_BASE_NAME = "Terminal" as const;

export const TERMINAL_NAME_PREFIX = "[QCB]" as const;

/**
 * VS Code ColorThemeKind enum values
 * @see https://code.visualstudio.com/api/references/vscode-api#ColorThemeKind
 * @see https://github.com/microsoft/vscode/blob/main/src/vscode-dts/vscode.d.ts
 */
export const COLOR_THEME_KIND = {
  Dark: 2,
  HighContrast: 3,
  HighContrastLight: 4,
  Light: 1,
} as const;

export type ColorThemeKind = (typeof COLOR_THEME_KIND)[keyof typeof COLOR_THEME_KIND];
