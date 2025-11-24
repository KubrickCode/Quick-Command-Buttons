import { FolderOpen, Globe, Laptop } from "lucide-react";

import { CONFIGURATION_TARGET } from "../../../shared/constants";
import type { ConfigurationTarget } from "../../../shared/types";

export const SCOPE_OPTIONS_BASE = [
  {
    description: "Personal commands across all projects",
    icon: Globe,
    label: "Global",
    storage: "Saved to user settings",
    value: CONFIGURATION_TARGET.GLOBAL,
  },
  {
    description: "Project-specific commands shared with team",
    icon: FolderOpen,
    label: "Workspace",
    storage: "Saved to .vscode/settings.json",
    value: CONFIGURATION_TARGET.WORKSPACE,
  },
  {
    description: "Personal project commands (Git-excluded)",
    icon: Laptop,
    label: "Local",
    storage: "Saved to workspace state",
    value: CONFIGURATION_TARGET.LOCAL,
  },
] as const;

export const SCOPE_OPTIONS_WITH_COLOR = SCOPE_OPTIONS_BASE.map((option) => ({
  ...option,
  iconColor:
    option.value === CONFIGURATION_TARGET.GLOBAL
      ? "text-blue-500"
      : option.value === CONFIGURATION_TARGET.WORKSPACE
        ? "text-amber-500"
        : "text-purple-500",
}));

export type ScopeOptionBase = {
  description: string;
  icon: typeof Globe | typeof FolderOpen | typeof Laptop;
  label: string;
  storage: string;
  value: ConfigurationTarget;
};

export type ScopeOptionWithColor = ScopeOptionBase & {
  iconColor: string;
};
