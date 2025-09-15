import { generateFallbackHtml, replaceAssetPaths, injectSecurityAndVSCodeApi } from "./webview-provider";
import * as vscode from "vscode";

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

  describe("replaceAssetPaths", () => {
    it("should replace /assets/ with provided assetsUri", () => {
      const html = '<img src="/assets/icon.png"> <link href="/assets/style.css">';
      const mockUri = { toString: () => "vscode-webview://assets-uri" } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe('<img src="vscode-webview://assets-uri/icon.png"> <link href="vscode-webview://assets-uri/style.css">');
    });

    it("should replace multiple occurrences of /assets/", () => {
      const html = '<script src="/assets/script.js"></script><img src="/assets/logo.png"><link href="/assets/main.css">';
      const mockUri = { toString: () => "vscode-webview://test-uri" } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe('<script src="vscode-webview://test-uri/script.js"></script><img src="vscode-webview://test-uri/logo.png"><link href="vscode-webview://test-uri/main.css">');
    });

    it("should handle HTML without /assets/ paths", () => {
      const html = '<div>No assets here</div><p>Just regular content</p>';
      const mockUri = { toString: () => "vscode-webview://unused-uri" } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe('<div>No assets here</div><p>Just regular content</p>');
    });

    it("should handle empty HTML string", () => {
      const html = "";
      const mockUri = { toString: () => "vscode-webview://empty-uri" } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe("");
    });

    it("should handle HTML with only /assets/ without following path", () => {
      const html = '<div>/assets/</div><span>text /assets/ more text</span>';
      const mockUri = { toString: () => "vscode-webview://edge-case-uri" } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe('<div>vscode-webview://edge-case-uri/</div><span>text vscode-webview://edge-case-uri/ more text</span>');
    });

    it("should handle complex HTML structure with nested assets", () => {
      const html = `
        <html>
          <head>
            <link rel="stylesheet" href="/assets/styles/main.css">
            <link rel="icon" href="/assets/favicon.ico">
          </head>
          <body>
            <img src="/assets/images/logo.png" alt="logo">
            <script src="/assets/js/main.js"></script>
          </body>
        </html>
      `;
      const mockUri = { toString: () => "vscode-webview://complex-uri" } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toContain('href="vscode-webview://complex-uri/styles/main.css"');
      expect(result).toContain('href="vscode-webview://complex-uri/favicon.ico"');
      expect(result).toContain('src="vscode-webview://complex-uri/images/logo.png"');
      expect(result).toContain('src="vscode-webview://complex-uri/js/main.js"');
    });
  });

  describe("injectSecurityAndVSCodeApi", () => {
    const mockWebview = {
      cspSource: "vscode-webview://test-source"
    } as vscode.Webview;

    it("should inject CSP meta tag and vscode API script into head section", () => {
      const html = '<html><head><title>Test</title></head><body></body></html>';

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain('default-src \'none\'');
      expect(result).toContain(`style-src ${mockWebview.cspSource} 'unsafe-inline'`);
      expect(result).toContain(`script-src ${mockWebview.cspSource} 'unsafe-inline'`);
      expect(result).toContain(`img-src ${mockWebview.cspSource} https: data:`);
      expect(result).toContain('const vscode = acquireVsCodeApi();');
    });

    it("should place injected content after opening head tag", () => {
      const html = '<html><head><title>Test Title</title></head><body></body></html>';

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      const headIndex = result.indexOf('<head>');
      const metaIndex = result.indexOf('<meta http-equiv="Content-Security-Policy"');
      const scriptIndex = result.indexOf('<script>');
      const titleIndex = result.indexOf('<title>Test Title</title>');

      expect(metaIndex).toBeGreaterThan(headIndex);
      expect(scriptIndex).toBeGreaterThan(metaIndex);
      expect(titleIndex).toBeGreaterThan(scriptIndex);
    });

    it("should handle HTML without head tag", () => {
      const html = '<html><body><div>No head tag</div></body></html>';

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toBe('<html><body><div>No head tag</div></body></html>');
    });

    it("should handle empty HTML string", () => {
      const html = '';

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toBe('');
    });

    it("should handle HTML with multiple head tags", () => {
      const html = '<html><head><title>First</title></head><body><head>Second head</head></body></html>';

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      const firstHeadIndex = result.indexOf('<head>');
      const metaIndex = result.indexOf('<meta http-equiv="Content-Security-Policy"');
      const secondHeadIndex = result.indexOf('<head>', firstHeadIndex + 1);

      expect(metaIndex).toBeGreaterThan(firstHeadIndex);
      expect(metaIndex).toBeLessThan(secondHeadIndex);
      expect(result.indexOf('<meta http-equiv="Content-Security-Policy"', metaIndex + 1)).toBe(-1);
    });

    it("should preserve existing head content", () => {
      const html = '<html><head><meta charset="UTF-8"><title>Test</title><link rel="stylesheet" href="style.css"></head><body></body></html>';

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain('<title>Test</title>');
      expect(result).toContain('<link rel="stylesheet" href="style.css">');
      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain('const vscode = acquireVsCodeApi();');
    });

    it("should use correct webview cspSource in CSP directive", () => {
      const customWebview = {
        cspSource: "vscode-webview://custom-source-123"
      } as vscode.Webview;
      const html = '<html><head></head><body></body></html>';

      const result = injectSecurityAndVSCodeApi(html, customWebview);

      expect(result).toContain('style-src vscode-webview://custom-source-123 \'unsafe-inline\'');
      expect(result).toContain('script-src vscode-webview://custom-source-123 \'unsafe-inline\'');
      expect(result).toContain('img-src vscode-webview://custom-source-123 https: data:');
    });
  });
});