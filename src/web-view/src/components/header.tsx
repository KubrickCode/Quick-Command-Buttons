import { Button } from "~/core";

import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useDarkMode } from "../hooks/use-dark-mode.tsx";

export const Header = () => {
  const { configurationTarget, saveConfig, setConfigurationTarget } = useVscodeCommand();
  const { openForm } = useCommandForm();
  const { isDark, toggleTheme } = useDarkMode();

  const toggleConfigurationTarget = () => {
    const newTarget = configurationTarget === "workspace" ? "global" : "workspace";
    setConfigurationTarget(newTarget);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-foreground">Commands Configuration</h1>
        <div className="flex gap-2">
          <Button
            className="border-border hover:bg-accent px-2"
            onClick={toggleTheme}
            variant="outline"
          >
            {isDark ? "☀️" : "🌙"}
          </Button>
          <Button onClick={openForm}>Add</Button>
          <Button className="bg-green-600 hover:bg-green-700" onClick={saveConfig}>
            Apply changes
          </Button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 p-4 bg-accent/20 rounded-lg border">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-foreground">Configuration Scope</span>
          <span className="text-xs text-muted-foreground">
            {configurationTarget === "workspace"
              ? "📁 Workspace: Project-specific commands shared with team"
              : "🌐 Global: Personal commands across all projects"}
          </span>
          <div className="text-xs text-muted-foreground/70 mt-1">
            {configurationTarget === "workspace"
              ? "Saved to .vscode/settings.json • Best for team collaboration"
              : "Saved to user settings • Best for personal workflow"}
          </div>
        </div>
        <Button
          className="border-border hover:bg-accent"
          onClick={toggleConfigurationTarget}
          title={
            configurationTarget === "workspace"
              ? "Switch to Global settings (personal commands)"
              : "Switch to Workspace settings (team commands)"
          }
          variant="outline"
        >
          {configurationTarget === "workspace" ? "📁 Workspace" : "🌐 Global"}
        </Button>
      </div>
    </div>
  );
};
