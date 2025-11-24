import { Moon, Plus, Sun } from "lucide-react";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "~/core";

import { ScopeToggleGroup } from "./scope-toggle-group";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useDarkMode } from "../hooks/use-dark-mode.tsx";

export const Header = () => {
  const { configurationTarget, isSwitchingScope, saveConfig, setConfigurationTarget } =
    useVscodeCommand();
  const { openForm } = useCommandForm();
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Commands Configuration</h1>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                className="btn-interactive"
                onClick={toggleTheme}
                size="icon"
                variant="outline"
              >
                {isDark ? (
                  <Sun aria-hidden="true" className="h-4 w-4 text-amber-400" />
                ) : (
                  <Moon aria-hidden="true" className="h-4 w-4 text-blue-400" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isDark ? "Switch to light mode" : "Switch to dark mode"}
            </TooltipContent>
          </Tooltip>
          <Button
            aria-label="Add new command"
            className="btn-interactive"
            onClick={openForm}
            variant="outline"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add
          </Button>
          <Button
            aria-label="Apply configuration changes"
            className="btn-interactive"
            onClick={saveConfig}
            variant="success"
          >
            Apply changes
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-sm text-muted-foreground shrink-0">Configuration scope:</span>
        <ScopeToggleGroup
          disabled={isSwitchingScope}
          onValueChange={setConfigurationTarget}
          value={configurationTarget}
        />
      </div>

      {/* Screen reader announcement for scope changes */}
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {isSwitchingScope
          ? "Switching configuration scope..."
          : `Configuration scope: ${configurationTarget}`}
      </div>
    </div>
  );
};
