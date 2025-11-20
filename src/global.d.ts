declare module "convert-layout/*" {
  const converter: {
    fromEn: (text: string) => string;
    toEn: (text: string) => string;
  };
  export default converter;
}

declare module "wanakana" {
  export const isJapanese: (text: string) => boolean;
  export const isRomaji: (text: string) => boolean;
  export const toRomaji: (text: string) => string;
  export const toHiragana: (text: string) => string;
}

declare module "tiny-pinyin" {
  export const convertToPinyin: (text: string, separator?: string, lowerCase?: boolean) => string;
}

declare module "@indic-transliteration/sanscript" {
  export const t: (text: string, from: string, to: string) => string;
}
