import { FolderOpen, Globe, Moon, Plus, Sun } from "lucide-react";

import { Button } from "~/core";
import { cn } from "~/core/shadcn/utils";

import { CONFIGURATION_TARGET } from "../../../shared/constants";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useDarkMode } from "../hooks/use-dark-mode.tsx";

export const Header = () => {
  const { configurationTarget, saveConfig, setConfigurationTarget } = useVscodeCommand();
  const { openForm } = useCommandForm();
  const { isDark, toggleTheme } = useDarkMode();

  const isWorkspace = configurationTarget === CONFIGURATION_TARGET.WORKSPACE;

  const toggleConfigurationTarget = () => {
    const newTarget = isWorkspace ? CONFIGURATION_TARGET.GLOBAL : CONFIGURATION_TARGET.WORKSPACE;
    setConfigurationTarget(newTarget);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
        <h1 className="text-2xl font-bold text-foreground">Commands Configuration</h1>
        <div className="flex gap-2">
          <Button
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
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
          <Button aria-label="Add new command" onClick={openForm} variant="outline">
            <Plus aria-hidden="true" className="h-4 w-4" />
            Add
          </Button>
          <Button aria-label="Apply configuration changes" onClick={saveConfig} variant="success">
            Apply changes
          </Button>
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 py-3 pl-4 pr-4",
          "border-l-[3px]",
          isWorkspace ? "border-l-amber-500" : "border-l-blue-500"
        )}
      >
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-foreground">Configuration Scope</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isWorkspace ? (
              <FolderOpen aria-hidden="true" className="h-4 w-4 shrink-0 text-amber-500" />
            ) : (
              <Globe aria-hidden="true" className="h-4 w-4 shrink-0 text-blue-500" />
            )}
            <span>
              {isWorkspace
                ? "Workspace: Project-specific commands shared with team"
                : "Global: Personal commands across all projects"}
            </span>
          </div>
          <span className="text-xs text-muted-foreground/70">
            {isWorkspace ? "Saved to .vscode/settings.json" : "Saved to user settings"}
          </span>
        </div>
        <Button
          aria-label={
            isWorkspace
              ? "Switch to Global settings (personal commands)"
              : "Switch to Workspace settings (team commands)"
          }
          onClick={toggleConfigurationTarget}
          title={
            isWorkspace
              ? "Switch to Global settings (personal commands)"
              : "Switch to Workspace settings (team commands)"
          }
          variant="outline"
        >
          {isWorkspace ? (
            <>
              <FolderOpen aria-hidden="true" className="h-4 w-4 text-amber-500" />
              Workspace
            </>
          ) : (
            <>
              <Globe aria-hidden="true" className="h-4 w-4 text-blue-500" />
              Global
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
