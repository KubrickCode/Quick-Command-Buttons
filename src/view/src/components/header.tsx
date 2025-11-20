import { Button } from "~/core";

import { CONFIGURATION_TARGET } from "../../../shared/constants";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useDarkMode } from "../hooks/use-dark-mode.tsx";

export const Header = () => {
  const { configurationTarget, saveConfig, setConfigurationTarget } = useVscodeCommand();
  const { openForm } = useCommandForm();
  const { isDark, toggleTheme } = useDarkMode();

  const toggleConfigurationTarget = () => {
    const newTarget =
      configurationTarget === CONFIGURATION_TARGET.WORKSPACE
        ? CONFIGURATION_TARGET.GLOBAL
        : CONFIGURATION_TARGET.WORKSPACE;
    setConfigurationTarget(newTarget);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-foreground">Commands Configuration</h1>
        <div className="flex gap-2">
          <Button
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="border-border hover:bg-accent px-2"
            onClick={toggleTheme}
            variant="outline"
          >
            <span aria-hidden="true">{isDark ? "☀️" : "🌙"}</span>
          </Button>
          <Button aria-label="Add new command" onClick={openForm}>
            Add
          </Button>
          <Button aria-label="Apply configuration changes" onClick={saveConfig} variant="success">
            Apply changes
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-accent/20 rounded-lg border">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Configuration Scope</span>
          <span className="text-xs text-muted-foreground">
            {configurationTarget === CONFIGURATION_TARGET.WORKSPACE
              ? "📁 Workspace: Project-specific commands shared with team"
              : "🌐 Global: Personal commands across all projects"}
          </span>
          <div className="text-xs text-muted-foreground/70 mt-1">
            {configurationTarget === CONFIGURATION_TARGET.WORKSPACE
              ? "Saved to .vscode/settings.json • Best for team collaboration"
              : "Saved to user settings • Best for personal workflow"}
          </div>
        </div>
        <Button
          aria-label={
            configurationTarget === CONFIGURATION_TARGET.WORKSPACE
              ? "Switch to Global settings (personal commands)"
              : "Switch to Workspace settings (team commands)"
          }
          className="border-border hover:bg-accent"
          onClick={toggleConfigurationTarget}
          title={
            configurationTarget === CONFIGURATION_TARGET.WORKSPACE
              ? "Switch to Global settings (personal commands)"
              : "Switch to Workspace settings (team commands)"
          }
          variant="outline"
        >
          <span aria-hidden="true">
            {configurationTarget === CONFIGURATION_TARGET.WORKSPACE ? "📁 Workspace" : "🌐 Global"}
          </span>
        </Button>
      </div>
    </div>
  );
};
