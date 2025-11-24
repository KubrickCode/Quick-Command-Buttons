import * as sanscript from "@indic-transliteration/sanscript";
import ar from "convert-layout/ar";
import by from "convert-layout/by";
import cs from "convert-layout/cs";
import de from "convert-layout/de";
import es from "convert-layout/es";
import fa from "convert-layout/fa";
import gr from "convert-layout/gr";
import he from "convert-layout/he";
import kk from "convert-layout/kk";
import kr from "convert-layout/kr";
import ru from "convert-layout/ru";
import uk from "convert-layout/uk";
import * as pinyin from "tiny-pinyin";
import * as wanakana from "wanakana";

type LayoutConverter = {
  fromEn: (text: string) => string;
  toEn: (text: string) => string;
};

export type ShortcutMatcher = (
  inputValue: string,
  shortcuts: string[],
  inputVariants?: Set<string>
) => string | undefined;

const LAYOUT_CONVERTERS: Array<{ converter: LayoutConverter; name: string }> = [
  { converter: kr, name: "kr" }, // Korean (한국어)
  { converter: ru, name: "ru" }, // Russian (русский)
  { converter: ar, name: "ar" }, // Arabic (العربية)
  { converter: he, name: "he" }, // Hebrew (עברית)
  { converter: de, name: "de" }, // German (Deutsch)
  { converter: es, name: "es" }, // Spanish (Español)
  { converter: cs, name: "cs" }, // Czech (Čeština)
  { converter: gr, name: "gr" }, // Greek (Ελληνικά)
  { converter: fa, name: "fa" }, // Persian/Farsi (فارسی)
  { converter: by, name: "by" }, // Belarusian (Беларуская)
  { converter: uk, name: "uk" }, // Ukrainian (Українська)
  { converter: kk, name: "kk" }, // Kazakh (Қazақsha)
];

const japaneseConverter: LayoutConverter = {
  fromEn: (text: string): string => {
    if (wanakana.isRomaji(text)) {
      return wanakana.toHiragana(text);
    }
    return text;
  },
  toEn: (text: string): string => {
    if (wanakana.isJapanese(text)) {
      return wanakana.toRomaji(text);
    }
    return text;
  },
};

const chineseConverter: LayoutConverter = {
  fromEn: (text: string): string => {
    return text;
  },
  toEn: (text: string): string => {
    try {
      return pinyin.convertToPinyin(text, "", true);
    } catch {
      return text;
    }
  },
};

const hindiConverter: LayoutConverter = {
  fromEn: (text: string): string => {
    try {
      return sanscript.t(text, "iast", "devanagari");
    } catch {
      return text;
    }
  },
  toEn: (text: string): string => {
    try {
      return sanscript.t(text, "devanagari", "iast");
    } catch {
      return text;
    }
  },
};

const ADVANCED_CONVERTERS: Array<{ converter: LayoutConverter; name: string }> = [
  { converter: japaneseConverter, name: "ja" }, // Japanese (日本語)
  { converter: chineseConverter, name: "zh" }, // Chinese (中文)
  { converter: hindiConverter, name: "hi" }, // Hindi (हिन्दी)
];

const ALL_CONVERTERS = [...LAYOUT_CONVERTERS, ...ADVANCED_CONVERTERS];

const isValidPrintableChar = (char: string): boolean => {
  if (char.length !== 1) {
    return false;
  }

  const code = char.charCodeAt(0);

  // Zero Width characters (U+200B-U+200F) - including Zero Width Joiner
  if (code >= 0x200b && code <= 0x200f) {
    return false;
  }

  // Line/Paragraph separators (U+2028-U+2029)
  if (code >= 0x2028 && code <= 0x2029) {
    return false;
  }

  // Other format characters and control characters (U+0000-U+001F, U+007F-U+009F)
  if (code <= 0x001f || (code >= 0x007f && code <= 0x009f)) {
    return false;
  }

  return true;
};

export const generateKeyVariants = (inputKey: string): string[] => {
  if (!inputKey || inputKey.length !== 1) {
    return [inputKey];
  }

  const variants = new Set<string>();
  variants.add(inputKey.toLowerCase());
  variants.add(inputKey.toUpperCase());

  const processConversion = (conversionFn: (text: string) => string) => {
    const convertedKey = conversionFn(inputKey);
    if (
      convertedKey &&
      convertedKey !== inputKey &&
      convertedKey.length === 1 &&
      isValidPrintableChar(convertedKey)
    ) {
      variants.add(convertedKey.toLowerCase());
      variants.add(convertedKey.toUpperCase());
    }
  };

  for (const layout of ALL_CONVERTERS) {
    try {
      processConversion(layout.converter.toEn);
      processConversion(layout.converter.fromEn);
    } catch (error) {
      console.warn(`Error in layout converter "${layout.name}":`, error);
      continue;
    }
  }

  return Array.from(variants);
};

export const exactMatcher: ShortcutMatcher = (inputValue, shortcuts) => {
  return shortcuts.find((shortcut) => shortcut && shortcut === inputValue);
};

export const caseInsensitiveMatcher: ShortcutMatcher = (inputValue, shortcuts) => {
  const lowerInput = inputValue.toLowerCase();
  return shortcuts.find((shortcut) => shortcut && shortcut.toLowerCase() === lowerInput);
};

export const layoutAwareMatcher: ShortcutMatcher = (_inputValue, shortcuts, inputVariants) => {
  if (!inputVariants) {
    return undefined;
  }

  return shortcuts.find((shortcut) => {
    if (!shortcut) {
      return false;
    }
    const shortcutVariants = generateKeyVariants(shortcut);
    return shortcutVariants.some((variant) => inputVariants.has(variant.toLowerCase()));
  });
};

export const findMatchingShortcut = (
  inputValue: string,
  shortcuts: string[]
): string | undefined => {
  if (inputValue.length !== 1) {
    return undefined;
  }

  try {
    const inputVariants = new Set(generateKeyVariants(inputValue).map((v) => v.toLowerCase()));

    const exactMatch = exactMatcher(inputValue, shortcuts);
    if (exactMatch) {
      return exactMatch;
    }

    const caseMatch = caseInsensitiveMatcher(inputValue, shortcuts);
    if (caseMatch) {
      return caseMatch;
    }

    const layoutMatch = layoutAwareMatcher(inputValue, shortcuts, inputVariants);
    if (layoutMatch) {
      return layoutMatch;
    }

    return undefined;
  } catch (error) {
    console.warn("Error in findMatchingShortcut:", error);
    return caseInsensitiveMatcher(inputValue, shortcuts);
  }
};
