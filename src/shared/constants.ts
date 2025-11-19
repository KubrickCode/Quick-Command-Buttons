export const CONFIG = {
  KEYS: {
    BUTTONS: "buttons",
    CONFIGURATION_TARGET: "configurationTarget",
    REFRESH_BUTTON: "refreshButton",
  },
  SECTION: "quickCommandButtons",
} as const;

export const CONFIGURATION_TARGET = {
  GLOBAL: "global",
  WORKSPACE: "workspace",
} as const;

export const MESSAGE_TYPE = {
  CONFIG_DATA: "configData",
  CONFIGURATION_TARGET_CHANGED: "configurationTargetChanged",
  ERROR: "error",
  GET_CONFIG: "getConfig",
  SET_CONFIG: "setConfig",
  SET_CONFIGURATION_TARGET: "setConfigurationTarget",
} as const;

export const MESSAGES = {
  ERROR: {
    communicationTimeout: "Communication with extension timed out. Please try again.",
    contextRequired: (hookName: string) =>
      `${hookName} must be used within a VscodeCommandProvider`,
    duplicateShortcuts: (shortcuts: string[]) =>
      `Duplicate shortcuts detected: ${shortcuts.join(", ")}. Please ensure each shortcut is unique.`,
    extensionError: (error: string) => `Extension error: ${error}`,
    invalidConfigurationTarget: (target: string) =>
      `Invalid target for setConfigurationTarget: ${target}`,
    invalidSetConfigData: "Invalid data for setConfig: data is not an array.",
    noCommands: "No commands found",
    unknownError: "Unknown error occurred",
  },
  INFO: {
    commandsCount: (count: number) => `${count} commands`,
    groupCommands: (buttonName: string) => `${buttonName} Commands`,
    quickCommands: "Quick Commands",
    selectCommand: "Select a command to execute",
    selectCommandOrGroup: "Select a command/group to execute (or type shortcut key)",
  },
} as const;
