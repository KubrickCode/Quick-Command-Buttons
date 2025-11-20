import { useState, useEffect } from "react";

import { COLOR_THEME_KIND, MESSAGE_TYPE } from "../../../shared/constants";

const THEME_STORAGE_KEY = "theme";

const applyTheme = (isDark: boolean): void => {
  document.documentElement.classList.toggle("dark", isDark);
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
};

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved) {
      const shouldBeDark = saved === "dark";
      document.documentElement.classList.toggle("dark", shouldBeDark);
    }

    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === MESSAGE_TYPE.THEME_CHANGED && message.data?.kind !== undefined) {
        const themeKind = message.data.kind;
        const shouldBeDark =
          themeKind === COLOR_THEME_KIND.Dark || themeKind === COLOR_THEME_KIND.HighContrast;

        setIsDark(shouldBeDark);
        applyTheme(shouldBeDark);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    applyTheme(newIsDark);
  };

  return { isDark, toggleTheme };
};
