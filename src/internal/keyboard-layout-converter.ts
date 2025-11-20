const TRANSLITERATION_SCHEME_IAST = "iast";
const TRANSLITERATION_SCHEME_DEVANAGARI = "devanagari";

type LayoutConverter = {
  fromEn: (text: string) => string;
  toEn: (text: string) => string;
};

type LazyLayoutConverter = {
  loader: () => Promise<LayoutConverter>;
  name: string;
};

export type ShortcutMatcher = (
  inputValue: string,
  shortcuts: string[],
  inputVariants?: Set<string>
) => string | undefined;

export type AsyncShortcutMatcher = (
  inputValue: string,
  shortcuts: string[],
  inputVariants?: Set<string>
) => Promise<string | undefined>;

const converterCache = new Map<string, LayoutConverter>();

const dynamicImport = <T = unknown>(moduleName: string): Promise<T> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - Dynamic import resolved at runtime, types may not be available at compile time
  return import(moduleName);
};

const createBasicLayoutLoader = (layoutCode: string): (() => Promise<LayoutConverter>) => {
  return async () => {
    const mod = await dynamicImport<{ default: LayoutConverter }>(`convert-layout/${layoutCode}`);
    return mod.default;
  };
};

const LAZY_LAYOUT_CONVERTERS: LazyLayoutConverter[] = [
  { loader: createBasicLayoutLoader("kr"), name: "kr" }, // Korean (한국어)
  { loader: createBasicLayoutLoader("ru"), name: "ru" }, // Russian (русский)
  { loader: createBasicLayoutLoader("ar"), name: "ar" }, // Arabic (العربية)
  { loader: createBasicLayoutLoader("he"), name: "he" }, // Hebrew (עברית)
  { loader: createBasicLayoutLoader("de"), name: "de" }, // German (Deutsch)
  { loader: createBasicLayoutLoader("es"), name: "es" }, // Spanish (Español)
  { loader: createBasicLayoutLoader("cs"), name: "cs" }, // Czech (Čeština)
  { loader: createBasicLayoutLoader("gr"), name: "gr" }, // Greek (Ελληνικά)
  { loader: createBasicLayoutLoader("fa"), name: "fa" }, // Persian/Farsi (فارسی)
  { loader: createBasicLayoutLoader("by"), name: "by" }, // Belarusian (Беларуская)
  { loader: createBasicLayoutLoader("uk"), name: "uk" }, // Ukrainian (Українська)
  { loader: createBasicLayoutLoader("kk"), name: "kk" }, // Kazakh (Қазақша)
];

const LAZY_ADVANCED_CONVERTERS: LazyLayoutConverter[] = [
  {
    loader: async () => {
      const wanakana = await dynamicImport<{
        isJapanese: (text: string) => boolean;
        isRomaji: (text: string) => boolean;
        toHiragana: (text: string) => string;
        toRomaji: (text: string) => string;
      }>("wanakana");
      return {
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
    },
    name: "ja", // Japanese (日本語)
  },
  {
    loader: async () => {
      const pinyin = await dynamicImport<{
        convertToPinyin: (text: string, separator?: string, lowerCase?: boolean) => string;
      }>("tiny-pinyin");
      return {
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
    },
    name: "zh", // Chinese (中文)
  },
  {
    loader: async () => {
      const sanscript = await dynamicImport<{
        t: (text: string, from: string, to: string) => string;
      }>("@indic-transliteration/sanscript");
      return {
        fromEn: (text: string): string => {
          try {
            return sanscript.t(
              text,
              TRANSLITERATION_SCHEME_IAST,
              TRANSLITERATION_SCHEME_DEVANAGARI
            );
          } catch {
            return text;
          }
        },
        toEn: (text: string): string => {
          try {
            return sanscript.t(
              text,
              TRANSLITERATION_SCHEME_DEVANAGARI,
              TRANSLITERATION_SCHEME_IAST
            );
          } catch {
            return text;
          }
        },
      };
    },
    name: "hi", // Hindi (हिन्दी)
  },
];

const ALL_LAZY_CONVERTERS = [...LAZY_LAYOUT_CONVERTERS, ...LAZY_ADVANCED_CONVERTERS];

export const generateKeyVariants = async (inputKey: string): Promise<string[]> => {
  if (!inputKey || inputKey.length !== 1) {
    return [inputKey];
  }

  const variants = new Set<string>();
  variants.add(inputKey.toLowerCase());
  variants.add(inputKey.toUpperCase());

  const processConversion = (conversionFn: (text: string) => string) => {
    const convertedKey = conversionFn(inputKey);
    if (convertedKey && convertedKey !== inputKey && convertedKey.length === 1) {
      variants.add(convertedKey.toLowerCase());
      variants.add(convertedKey.toUpperCase());
    }
  };

  try {
    const allConverters = await loadAllConverters();
    for (const layout of allConverters) {
      try {
        processConversion(layout.converter.toEn);
        processConversion(layout.converter.fromEn);
      } catch (error) {
        console.warn(`Error in layout converter "${layout.name}":`, error);
        continue;
      }
    }
  } catch (error) {
    console.warn("Error generating key variants:", error);
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

export const layoutAwareMatcher: AsyncShortcutMatcher = async (
  _inputValue,
  shortcuts,
  inputVariants
) => {
  if (!inputVariants) {
    return undefined;
  }

  const validShortcuts = shortcuts.filter((s): s is string => Boolean(s));
  const allShortcutVariants = await Promise.all(
    validShortcuts.map((shortcut) => generateKeyVariants(shortcut))
  );

  for (let i = 0; i < validShortcuts.length; i++) {
    const shortcut = validShortcuts[i];
    const shortcutVariants = allShortcutVariants[i];
    if (shortcutVariants.some((variant) => inputVariants.has(variant.toLowerCase()))) {
      return shortcut;
    }
  }

  return undefined;
};

export const findMatchingShortcut = async (
  inputValue: string,
  shortcuts: string[]
): Promise<string | undefined> => {
  if (inputValue.length !== 1) {
    return undefined;
  }

  try {
    const inputVariantsArray = await generateKeyVariants(inputValue);
    const inputVariants = new Set(inputVariantsArray.map((v) => v.toLowerCase()));

    const exactMatch = exactMatcher(inputValue, shortcuts);
    if (exactMatch) {
      return exactMatch;
    }

    const caseMatch = caseInsensitiveMatcher(inputValue, shortcuts);
    if (caseMatch) {
      return caseMatch;
    }

    const layoutMatch = await layoutAwareMatcher(inputValue, shortcuts, inputVariants);
    if (layoutMatch) {
      return layoutMatch;
    }

    return undefined;
  } catch (error) {
    console.warn("Error in findMatchingShortcut:", error);
    return caseInsensitiveMatcher(inputValue, shortcuts);
  }
};

const getConverter = async (name: string): Promise<LayoutConverter | undefined> => {
  if (converterCache.has(name)) {
    return converterCache.get(name);
  }

  const lazyConverter = ALL_LAZY_CONVERTERS.find((c) => c.name === name);
  if (!lazyConverter) {
    return undefined;
  }

  try {
    const converter = await lazyConverter.loader();
    converterCache.set(name, converter);
    return converter;
  } catch (error) {
    console.warn(`Failed to load converter "${name}":`, error);
    return undefined;
  }
};

const loadAllConverters = async (): Promise<
  Array<{ converter: LayoutConverter; name: string }>
> => {
  const results = await Promise.all(
    ALL_LAZY_CONVERTERS.map(async (lazy) => {
      const converter = await getConverter(lazy.name);
      return converter ? { converter, name: lazy.name } : null;
    })
  );
  return results.filter((r): r is { converter: LayoutConverter; name: string } => r !== null);
};
