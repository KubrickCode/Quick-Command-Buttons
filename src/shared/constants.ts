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
  GET_CONFIG: "getConfig",
  SET_CONFIG: "setConfig",
  SET_CONFIGURATION_TARGET: "setConfigurationTarget",
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
    commandsCount: (count: number) => `${count} commands`,
    groupCommands: (buttonName: string) => `${buttonName} Commands`,
    quickCommands: "Quick Commands",
    selectCommand: "Select a command to execute",
    selectCommandOrGroup: "Select a command/group to execute (or type shortcut key)",
  },
} as const;
