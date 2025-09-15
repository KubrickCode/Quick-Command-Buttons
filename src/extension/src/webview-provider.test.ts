import { generateFallbackHtml } from "./webview-provider";

describe("webview-provider", () => {
  describe("generateFallbackHtml", () => {
    it("should return HTML with configuration UI not available message", () => {
      const result = generateFallbackHtml();

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<title>Configuration UI</title>");
      expect(result).toContain("Configuration UI Not Available");
      expect(result).toContain("cd src/web-view && npm run build");
    });

    it("should return valid HTML structure", () => {
      const result = generateFallbackHtml();

      expect(result).toContain("<html>");
      expect(result).toContain("</html>");
      expect(result).toContain("<head>");
      expect(result).toContain("</head>");
      expect(result).toContain("<body>");
      expect(result).toContain("</body>");
    });

    it("should include viewport meta tag", () => {
      const result = generateFallbackHtml();

      expect(result).toContain('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    });
  });
});