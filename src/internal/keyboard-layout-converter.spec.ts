import {
  generateKeyVariants,
  findMatchingShortcut,
  exactMatcher,
  caseInsensitiveMatcher,
  layoutAwareMatcher,
} from "./keyboard-layout-converter";

describe("generateKeyVariants", () => {
  it("should return input key with case variations for single character", async () => {
    const variants = await generateKeyVariants("q");
    expect(variants).toContain("q");
    expect(variants).toContain("Q");
  });

  it("should include Korean conversion for q key", async () => {
    const variants = await generateKeyVariants("q");
    expect(variants).toContain("ㅂ");
  });

  it("should include English conversion for Korean key", async () => {
    const variants = await generateKeyVariants("ㅂ");
    expect(variants).toContain("q");
  });

  it("should return original input for non-single character input", async () => {
    const variants = await generateKeyVariants("abc");
    expect(variants).toEqual(["abc"]);
  });

  it("should return original input for empty string", async () => {
    const variants = await generateKeyVariants("");
    expect(variants).toEqual([""]);
  });

  it("should handle Russian characters", async () => {
    const variants = await generateKeyVariants("й");
    expect(variants).toContain("q");
  });

  it("should handle Arabic characters", async () => {
    const variants = await generateKeyVariants("ض");
    expect(variants).toContain("z");
  });

  it("should handle Hebrew characters", async () => {
    const variants = await generateKeyVariants("ק");
    expect(variants).toContain("e");
  });

  it("should handle German characters", async () => {
    const variants = await generateKeyVariants("ü");
    expect(variants).toContain("[");
  });

  it("should handle Spanish characters", async () => {
    const variants = await generateKeyVariants("ñ");
    expect(variants).toContain(";");
  });

  it("should handle Greek characters", async () => {
    const variants = await generateKeyVariants("θ");
    expect(variants).toContain("u");
  });

  it("should handle Japanese hiragana characters", async () => {
    const variants = await generateKeyVariants("あ");
    expect(variants).toContain("a");
  });

  it("should handle Japanese katakana characters", async () => {
    const variants = await generateKeyVariants("ア");
    expect(variants).toContain("a");
  });

  it("should handle Chinese characters", async () => {
    const variants = await generateKeyVariants("你");
    expect(variants).toContain("你");
  });

  it("should handle Hindi Devanagari characters", async () => {
    const variants = await generateKeyVariants("अ");
    expect(variants).toContain("a");
  });

  it("should handle numbers and special characters", async () => {
    const variants = await generateKeyVariants("1");
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

  it("should match Korean ㅂ to q using variants", async () => {
    const variants = await generateKeyVariants("ㅂ");
    const inputVariants = new Set(variants.map((v) => v.toLowerCase()));
    const result = await layoutAwareMatcher("ㅂ", shortcuts, inputVariants);
    expect(result).toBe("q");
  });

  it("should match Russian й to q using variants", async () => {
    const variants = await generateKeyVariants("й");
    const inputVariants = new Set(variants.map((v) => v.toLowerCase()));
    const result = await layoutAwareMatcher("й", shortcuts, inputVariants);
    expect(result).toBe("q");
  });

  it("should match Korean ㅅ to t using variants", async () => {
    const variants = await generateKeyVariants("ㅅ");
    const inputVariants = new Set(variants.map((v) => v.toLowerCase()));
    const result = await layoutAwareMatcher("ㅅ", shortcuts, inputVariants);
    expect(result).toBe("t");
  });

  it("should return undefined when inputVariants is not provided", async () => {
    const result = await layoutAwareMatcher("q", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should return undefined when no layout match found", async () => {
    const inputVariants = new Set(["x", "X"]);
    const result = await layoutAwareMatcher("x", shortcuts, inputVariants);
    expect(result).toBeUndefined();
  });

  it("should handle undefined shortcuts gracefully", async () => {
    const variants = await generateKeyVariants("ㅂ");
    const inputVariants = new Set(variants.map((v) => v.toLowerCase()));
    const result = await layoutAwareMatcher("ㅂ", [undefined as any, "q", "t"], inputVariants);
    expect(result).toBe("q");
  });
});

describe("findMatchingShortcut", () => {
  const shortcuts = ["q", "t", "g", "n"];

  it("should find exact match for English character", async () => {
    const result = await findMatchingShortcut("q", shortcuts);
    expect(result).toBe("q");
  });

  it("should find match for Korean character mapping to English", async () => {
    const result = await findMatchingShortcut("ㅂ", shortcuts);
    expect(result).toBe("q");
  });

  it("should find match for Russian character mapping to English", async () => {
    const result = await findMatchingShortcut("й", shortcuts);
    expect(result).toBe("q");
  });

  it("should return undefined for non-matching character", async () => {
    const result = await findMatchingShortcut("x", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should return undefined for multi-character input", async () => {
    const result = await findMatchingShortcut("qt", shortcuts);
    expect(result).toBeUndefined();
  });

  it("should handle case insensitive matching", async () => {
    const result = await findMatchingShortcut("Q", shortcuts);
    expect(result).toBe("q");
  });

  it("should handle empty shortcuts array", async () => {
    const result = await findMatchingShortcut("q", []);
    expect(result).toBeUndefined();
  });

  it("should handle shortcuts with undefined values", async () => {
    const result = await findMatchingShortcut("q", ["q", undefined as any, "t"]);
    expect(result).toBe("q");
  });

  it("should match Korean ㅅ with t shortcut", async () => {
    const shortcutsWithT = ["s", "t", "g"];
    const result = await findMatchingShortcut("ㅅ", shortcutsWithT);
    expect(result).toBe("t");
  });

  it("should match Korean ㄴ with s shortcut", async () => {
    const shortcutsWithS = ["s", "t", "g"];
    const result = await findMatchingShortcut("ㄴ", shortcutsWithS);
    expect(result).toBe("s");
  });

  it("should prioritize exact match over case-insensitive match", async () => {
    const mixedShortcuts = ["Q", "q", "t"];
    const result = await findMatchingShortcut("q", mixedShortcuts);
    expect(result).toBe("q");
  });

  it("should prioritize case-insensitive match over layout-aware match", async () => {
    const shortcuts = ["t", "q"];
    const result = await findMatchingShortcut("Q", shortcuts);
    expect(result).toBe("q");
  });
});
