import {
  generateKeyVariants,
  findMatchingShortcut,
  exactMatcher,
  caseInsensitiveMatcher,
  layoutAwareMatcher,
} from "../internal/keyboard-layout-converter";

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

describe("exactMatcher", () => {
  const shortcuts = ["q", "Q", "t", "g"];

  it("should find exact case-sensitive match", () => {
    const result = exactMatcher("q", shortcuts);
    expect(result).toBe("q");
  });

  it("should not match different case", () => {
    const result = exactMatcher("q", ["Q", "t"]);
    expect(result).toBeUndefined();
  });

  it("should return undefined for no match", () => {
    const result = exactMatcher("x", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty shortcuts", () => {
    const result = exactMatcher("q", []);
    expect(result).toBeUndefined();
  });
});

describe("caseInsensitiveMatcher", () => {
  const shortcuts = ["q", "T", "g", "N"];

  it("should match lowercase to lowercase", () => {
    const result = caseInsensitiveMatcher("q", shortcuts);
    expect(result).toBe("q");
  });

  it("should match lowercase to uppercase", () => {
    const result = caseInsensitiveMatcher("t", shortcuts);
    expect(result).toBe("T");
  });

  it("should match uppercase to lowercase", () => {
    const result = caseInsensitiveMatcher("Q", shortcuts);
    expect(result).toBe("q");
  });

  it("should match uppercase to uppercase", () => {
    const result = caseInsensitiveMatcher("N", shortcuts);
    expect(result).toBe("N");
  });

  it("should return undefined for no match", () => {
    const result = caseInsensitiveMatcher("x", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should handle undefined shortcuts gracefully", () => {
    const result = caseInsensitiveMatcher("q", [undefined as any, "q", "t"]);
    expect(result).toBe("q");
  });
});

describe("layoutAwareMatcher", () => {
  const shortcuts = ["q", "t", "s"];

  it("should match Korean ㅂ to q using variants", () => {
    const inputVariants = new Set(generateKeyVariants("ㅂ").map((v) => v.toLowerCase()));
    const result = layoutAwareMatcher("ㅂ", shortcuts, inputVariants);
    expect(result).toBe("q");
  });

  it("should match Russian й to q using variants", () => {
    const inputVariants = new Set(generateKeyVariants("й").map((v) => v.toLowerCase()));
    const result = layoutAwareMatcher("й", shortcuts, inputVariants);
    expect(result).toBe("q");
  });

  it("should match Korean ㅅ to t using variants", () => {
    const inputVariants = new Set(generateKeyVariants("ㅅ").map((v) => v.toLowerCase()));
    const result = layoutAwareMatcher("ㅅ", shortcuts, inputVariants);
    expect(result).toBe("t");
  });

  it("should return undefined when inputVariants is not provided", () => {
    const result = layoutAwareMatcher("q", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should return undefined when no layout match found", () => {
    const inputVariants = new Set(["x", "X"]);
    const result = layoutAwareMatcher("x", shortcuts, inputVariants);
    expect(result).toBeUndefined();
  });

  it("should handle undefined shortcuts gracefully", () => {
    const inputVariants = new Set(generateKeyVariants("ㅂ").map((v) => v.toLowerCase()));
    const result = layoutAwareMatcher("ㅂ", [undefined as any, "q", "t"], inputVariants);
    expect(result).toBe("q");
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

  it("should prioritize exact match over case-insensitive match", () => {
    const mixedShortcuts = ["Q", "q", "t"];
    const result = findMatchingShortcut("q", mixedShortcuts);
    expect(result).toBe("q");
  });

  it("should prioritize case-insensitive match over layout-aware match", () => {
    const shortcuts = ["t", "q"];
    const result = findMatchingShortcut("Q", shortcuts);
    expect(result).toBe("q");
  });
});
