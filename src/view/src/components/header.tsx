import { Moon, Plus, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Tooltip, TooltipContent, TooltipTrigger } from "~/core";

import { ImportExportMenu } from "./import-export-menu";
import { ScopeToggleGroup } from "./scope-toggle-group";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useDarkMode } from "../hooks/use-dark-mode.tsx";

export const Header = () => {
  const { t } = useTranslation();
  const { configurationTarget, isSwitchingScope, saveConfig, setConfigurationTarget } =
    useVscodeCommand();
  const { openForm } = useCommandForm();
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-2xl font-semibold text-foreground">{t("header.title")}</h1>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={isDark ? t("header.switchToLightMode") : t("header.switchToDarkMode")}
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
              {isDark ? t("header.switchToLightMode") : t("header.switchToDarkMode")}
            </TooltipContent>
          </Tooltip>
          <Button
            aria-label="Add new command"
            className="btn-interactive"
            onClick={openForm}
            variant="outline"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            {t("header.add")}
          </Button>
          <Button
            aria-label="Apply configuration changes"
            className="btn-interactive"
            onClick={saveConfig}
            variant="success"
          >
            {t("header.applyChanges")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-sm text-muted-foreground shrink-0">
            {t("header.configurationScope")}
          </span>
          <ScopeToggleGroup
            disabled={isSwitchingScope}
            onValueChange={setConfigurationTarget}
            value={configurationTarget}
          />
        </div>
        <ImportExportMenu configurationTarget={configurationTarget} />
      </div>

      {/* Screen reader announcement for scope changes */}
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {isSwitchingScope
          ? t("header.switchingScope")
          : `${t("header.configurationScope")} ${configurationTarget}`}
      </div>
    </div>
  );
};
