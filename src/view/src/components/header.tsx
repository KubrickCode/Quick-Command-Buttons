import { Check, Languages, Moon, Plus, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/core";

import type { SupportedLanguage } from "../i18n";
import { ImportExportMenu } from "./import-export-menu";
import { ScopeToggleGroup } from "./scope-toggle-group";
import { useCommandForm } from "../context/command-form-context.tsx";
import { useVscodeCommand } from "../context/vscode-command-context.tsx";
import { useDarkMode } from "../hooks/use-dark-mode.tsx";
import { useLanguage } from "../hooks/use-language.tsx";

export const Header = () => {
  const { t } = useTranslation();
  const { configurationTarget, isSwitchingScope, saveConfig, setConfigurationTarget } =
    useVscodeCommand();
  const { openForm } = useCommandForm();
  const { isDark, toggleTheme } = useDarkMode();
  const { language, selectLanguage, supportedLanguages } = useLanguage();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 0);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      aria-label={t("header.title")}
      className={`
        sticky top-0 z-10
        bg-background/95 dark:bg-background/90
        backdrop-blur-md
        border-b border-border/50
        -mx-6 px-6 py-4 mb-6
        transition-shadow duration-200 ease-out
        ${isScrolled ? "shadow-md" : ""}
      `}
      role="banner"
    >
      {/* Two-row layout for better UX */}
      <div className="flex flex-col gap-3">
        {/* Row 1: Title + Action buttons */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("header.title")}</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu onOpenChange={setIsLanguageMenuOpen} open={isLanguageMenuOpen}>
              <Tooltip open={isLanguageMenuOpen ? false : undefined}>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      aria-label={t("header.languageToggle")}
                      className="btn-interactive"
                      size="icon"
                      variant="outline"
                    >
                      <Languages aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {t("header.currentLanguage", { language: t(`header.languages.${language}`) })}
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang}
                    onClick={() => selectLanguage(lang as SupportedLanguage)}
                  >
                    <Check
                      aria-hidden="true"
                      className={`h-4 w-4 mr-2 ${language === lang ? "opacity-100" : "opacity-0"}`}
                    />
                    {t(`header.languages.${lang}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
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
              variant="default"
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              {t("header.add")}
            </Button>
            <Button
              aria-label="Apply configuration changes"
              className="btn-interactive"
              onClick={saveConfig}
              variant="secondary"
            >
              {t("header.applyChanges")}
            </Button>
          </div>
        </div>

        {/* Row 2: Scope toggle + Backup */}
        <div className="flex items-center justify-between gap-3">
          <ScopeToggleGroup
            disabled={isSwitchingScope}
            onValueChange={setConfigurationTarget}
            value={configurationTarget}
          />
          <ImportExportMenu configurationTarget={configurationTarget} />
        </div>
      </div>

      {/* Screen reader announcement for scope changes */}
      <div aria-atomic="true" aria-live="polite" className="sr-only">
        {isSwitchingScope
          ? t("header.switchingScope")
          : `${t("header.configurationScope")} ${configurationTarget}`}
      </div>
    </header>
  );
};
