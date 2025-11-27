import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import ko from "./locales/ko.json";

const LANGUAGE_STORAGE_KEY = "language";
const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "ko"] as const;

type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

const getInitialLanguage = (): SupportedLanguage => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved && isSupportedLanguage(saved)) {
    return saved;
  }

  const vscodeLanguage = (window as unknown as { __VSCODE_LANGUAGE__?: string })
    .__VSCODE_LANGUAGE__;
  if (!vscodeLanguage) {
    return DEFAULT_LANGUAGE;
  }

  const baseLang = vscodeLanguage.split("-")[0];
  if (isSupportedLanguage(baseLang)) {
    return baseLang;
  }

  return DEFAULT_LANGUAGE;
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

export { i18n, SUPPORTED_LANGUAGES, type SupportedLanguage };
