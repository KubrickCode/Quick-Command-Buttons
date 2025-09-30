declare module "tiny-pinyin" {
  export const isSupported: (text: string) => boolean;
  export const convertToPinyin: (
    text: string,
    separator?: string,
    lowerCase?: boolean
  ) => string;
  export const parse: (text: string) => Array<{ target: string; origin: string }>;
  export const patchDict: (dict: Record<string, string>) => void;
  export const genToken: (ch: string) => string;
}
