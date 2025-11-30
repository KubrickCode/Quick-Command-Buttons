import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ko from "./locales/ko.json";

const DEFAULT_LANGUAGE = "en";
const LANGUAGE_MANUAL_SELECTION_KEY = "language-manual-selection";
const LANGUAGE_STORAGE_KEY = "language";
const PREVIOUS_VSCODE_LANGUAGE_KEY = "previous-vscode-language";
const SUPPORTED_LANGUAGES = ["en", "ko"] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

const getVSCodeLanguage = (): SupportedLanguage | null => {
  const vscodeLanguage = (window as unknown as { __VSCODE_LANGUAGE__?: string })
    .__VSCODE_LANGUAGE__;
  if (!vscodeLanguage) {
    return null;
  }
  const baseLang = vscodeLanguage.split("-")[0];
  return isSupportedLanguage(baseLang) ? baseLang : null;
};

const getInitialLanguage = (): SupportedLanguage => {
  try {
    const currentVSCodeLang = getVSCodeLanguage();
    const previousVSCodeLang = localStorage.getItem(PREVIOUS_VSCODE_LANGUAGE_KEY);

    if (currentVSCodeLang && currentVSCodeLang !== previousVSCodeLang) {
      localStorage.removeItem(LANGUAGE_MANUAL_SELECTION_KEY);
      localStorage.setItem(PREVIOUS_VSCODE_LANGUAGE_KEY, currentVSCodeLang);
      return currentVSCodeLang;
    }

    const isManuallySelected = localStorage.getItem(LANGUAGE_MANUAL_SELECTION_KEY) === "true";
    if (isManuallySelected) {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved && isSupportedLanguage(saved)) {
        return saved;
      }
    }

    if (currentVSCodeLang && !previousVSCodeLang) {
      localStorage.setItem(PREVIOUS_VSCODE_LANGUAGE_KEY, currentVSCodeLang);
    }

    return currentVSCodeLang ?? DEFAULT_LANGUAGE;
  } catch {
    return getVSCodeLanguage() ?? DEFAULT_LANGUAGE;
  }
};

i18n.use(initReactI18next).init({
  debug: false,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: {
    escapeValue: false,
  },
  lng: getInitialLanguage(),
  resources: {
    en: { translation: en },
    ko: { translation: ko },
  },
});

export const changeLanguage = (lang: SupportedLanguage): void => {
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  const lang = i18n.language;
  return isSupportedLanguage(lang) ? lang : DEFAULT_LANGUAGE;
};

export {
  getVSCodeLanguage,
  i18n,
  LANGUAGE_MANUAL_SELECTION_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
};
