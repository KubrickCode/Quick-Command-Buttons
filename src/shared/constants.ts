export const CONFIG = {
  SECTION: "quickCommandButtons",
  KEYS: {
    BUTTONS: "buttons",
    CONFIGURATION_TARGET: "configurationTarget",
    REFRESH_BUTTON: "refreshButton",
  },
} as const;

export const CONFIGURATION_TARGET = {
  GLOBAL: "global",
  WORKSPACE: "workspace",
} as const;

export const MESSAGE_TYPE = {
  GET_CONFIG: "getConfig",
  SET_CONFIG: "setConfig",
  SET_CONFIGURATION_TARGET: "setConfigurationTarget",
  CONFIG_DATA: "configData",
  CONFIGURATION_TARGET_CHANGED: "configurationTargetChanged",
} as const;

export const MESSAGES = {
  ERROR: {
    contextRequired: (hookName: string) =>
      `${hookName} must be used within a VscodeCommandProvider`,
    duplicateShortcuts: (shortcuts: string[]) =>
      `Duplicate shortcuts detected: ${shortcuts.join(", ")}. Please ensure each shortcut is unique.`,
    noCommands: "No commands found",
  },
  INFO: {
    selectCommand: "Select a command to execute",
    selectCommandOrGroup: "Select a command/group to execute (or type shortcut key)",
    quickCommands: "Quick Commands",
    groupCommands: (buttonName: string) => `${buttonName} Commands`,
    commandsCount: (count: number) => `${count} commands`,
  },
} as const;
