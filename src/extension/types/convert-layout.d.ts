type LayoutConverter = {
  fromEn(text: string): string;
  toEn(text: string): string;
};

declare module "convert-layout/kr" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/ru" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/ar" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/he" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/de" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/es" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/cs" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/gr" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/fa" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/by" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/uk" {
  const converter: LayoutConverter;
  export default converter;
}

declare module "convert-layout/kk" {
  const converter: LayoutConverter;
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
