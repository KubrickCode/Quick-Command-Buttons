import { generateKeyVariants, findMatchingShortcut } from "./keyboard-layout-converter";

describe("generateKeyVariants", () => {
  it("should return input key with case variations for single character", () => {
    const variants = generateKeyVariants("q");
    expect(variants).toContain("q");
    expect(variants).toContain("Q");
  });

  it("should include Korean conversion for q key", () => {
    const variants = generateKeyVariants("q");
    expect(variants).toContain("ㅂ");
  });

  it("should include English conversion for Korean key", () => {
    const variants = generateKeyVariants("ㅂ");
    expect(variants).toContain("q");
  });

  it("should return original input for non-single character input", () => {
    const variants = generateKeyVariants("abc");
    expect(variants).toEqual(["abc"]);
  });

  it("should return original input for empty string", () => {
    const variants = generateKeyVariants("");
    expect(variants).toEqual([""]);
  });

  it("should handle Russian characters", () => {
    const variants = generateKeyVariants("й");
    expect(variants).toContain("q");
  });

  it("should handle Arabic characters", () => {
    const variants = generateKeyVariants("ض");
    expect(variants).toContain("z");
  });

  it("should handle Hebrew characters", () => {
    const variants = generateKeyVariants("ק");
    expect(variants).toContain("e");
  });

  it("should handle German characters", () => {
    const variants = generateKeyVariants("ü");
    expect(variants).toContain("[");
  });

  it("should handle Spanish characters", () => {
    const variants = generateKeyVariants("ñ");
    expect(variants).toContain(";");
  });

  it("should handle Greek characters", () => {
    const variants = generateKeyVariants("θ");
    expect(variants).toContain("u");
  });

  it("should handle Japanese hiragana characters", () => {
    const variants = generateKeyVariants("あ");
    expect(variants).toContain("a");
  });

  it("should handle Japanese katakana characters", () => {
    const variants = generateKeyVariants("ア");
    expect(variants).toContain("a");
  });

  it("should handle Chinese characters", () => {
    const variants = generateKeyVariants("你");
    expect(variants).toContain("你");
  });

  it("should handle Hindi Devanagari characters", () => {
    const variants = generateKeyVariants("अ");
    expect(variants).toContain("a");
  });

  it("should handle numbers and special characters", () => {
    const variants = generateKeyVariants("1");
    expect(variants).toContain("1");
  });
});

describe("findMatchingShortcut", () => {
  const shortcuts = ["q", "t", "g", "n"];

  it("should find exact match for English character", () => {
    const result = findMatchingShortcut("q", shortcuts);
    expect(result).toBe("q");
  });

  it("should find match for Korean character mapping to English", () => {
    const result = findMatchingShortcut("ㅂ", shortcuts);
    expect(result).toBe("q");
  });

  it("should find match for Russian character mapping to English", () => {
    const result = findMatchingShortcut("й", shortcuts);
    expect(result).toBe("q");
  });

  it("should return undefined for non-matching character", () => {
    const result = findMatchingShortcut("x", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should return undefined for multi-character input", () => {
    const result = findMatchingShortcut("qt", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should handle case insensitive matching", () => {
    const result = findMatchingShortcut("Q", shortcuts);
    expect(result).toBe("q");
  });

  it("should handle empty shortcuts array", () => {
    const result = findMatchingShortcut("q", []);
    expect(result).toBeUndefined();
  });

  it("should handle shortcuts with undefined values", () => {
    const result = findMatchingShortcut("q", ["q", undefined as any, "t"]);
    expect(result).toBe("q");
  });

  it("should match Korean ㅅ with t shortcut", () => {
    const shortcutsWithT = ["s", "t", "g"];
    const result = findMatchingShortcut("ㅅ", shortcutsWithT);
    expect(result).toBe("t");
  });

  it("should match Korean ㄴ with s shortcut", () => {
    const shortcutsWithS = ["s", "t", "g"];
    const result = findMatchingShortcut("ㄴ", shortcutsWithS);
    expect(result).toBe("s");
  });
});
