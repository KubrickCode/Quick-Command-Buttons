import { useEffect, useState } from "react";

import {
  changeLanguage,
  getCurrentLanguage,
  getVSCodeLanguage,
  LANGUAGE_MANUAL_SELECTION_KEY,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "../i18n";

const applyLanguage = (lang: SupportedLanguage, isManual: boolean): void => {
  changeLanguage(lang);
  if (isManual) {
    localStorage.setItem(LANGUAGE_MANUAL_SELECTION_KEY, "true");
  } else {
    localStorage.removeItem(LANGUAGE_MANUAL_SELECTION_KEY);
  }
};

export const useLanguage = () => {
  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    const isManuallySelected = localStorage.getItem(LANGUAGE_MANUAL_SELECTION_KEY) === "true";
    if (isManuallySelected) {
      return getCurrentLanguage();
    }
    return getVSCodeLanguage() || "en";
  });

  useEffect(() => {
    const isManuallySelected = localStorage.getItem(LANGUAGE_MANUAL_SELECTION_KEY) === "true";
    if (!isManuallySelected) {
      const vscodeLanguage = getVSCodeLanguage();
      if (vscodeLanguage) {
        changeLanguage(vscodeLanguage);
      }
    }

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "languageChanged" && message.data?.language) {
        const isManuallySelected = localStorage.getItem(LANGUAGE_MANUAL_SELECTION_KEY) === "true";
        if (!isManuallySelected) {
          const newLanguage = message.data.language === "ko" ? "ko" : "en";
          setLanguage(newLanguage);
          changeLanguage(newLanguage);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const selectLanguage = (lang: SupportedLanguage) => {
    setLanguage(lang);
    applyLanguage(lang, true);
  };

  return { language, selectLanguage, supportedLanguages: SUPPORTED_LANGUAGES };
};
