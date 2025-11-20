import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  generateFallbackHtml,
  replaceAssetPaths,
  injectSecurityAndVSCodeApi,
  checkWebviewFilesExist,
  buildWebviewHtml,
} from "./webview-provider";

// Mock fs module
jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  promises: {
    access: jest.fn(),
    readFile: jest.fn(),
  },
}));

describe("webview-provider", () => {
  describe("generateFallbackHtml", () => {
    it("should return HTML with configuration UI not available message", () => {
      const result = generateFallbackHtml();

      expect(result).toContain("<!DOCTYPE html>");
      expect(result).toContain("<title>Configuration UI</title>");
      expect(result).toContain("Configuration UI Not Available");
      expect(result).toContain("cd src/view && npm run build");
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

      expect(result).toContain(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
      );
    });
  });

  describe("replaceAssetPaths", () => {
    it("should replace /assets/ with provided assetsUri", () => {
      const html = '<img src="/assets/icon.png"> <link href="/assets/style.css">';
      const mockUri = {
        toString: () => "vscode-webview://assets-uri",
      } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe(
        '<img src="vscode-webview://assets-uri/icon.png"> <link href="vscode-webview://assets-uri/style.css">'
      );
    });

    it("should replace multiple occurrences of /assets/", () => {
      const html =
        '<script src="/assets/script.js"></script><img src="/assets/logo.png"><link href="/assets/main.css">';
      const mockUri = {
        toString: () => "vscode-webview://test-uri",
      } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe(
        '<script src="vscode-webview://test-uri/script.js"></script><img src="vscode-webview://test-uri/logo.png"><link href="vscode-webview://test-uri/main.css">'
      );
    });

    it("should handle HTML without /assets/ paths", () => {
      const html = "<div>No assets here</div><p>Just regular content</p>";
      const mockUri = {
        toString: () => "vscode-webview://unused-uri",
      } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe("<div>No assets here</div><p>Just regular content</p>");
    });

    it("should handle empty HTML string", () => {
      const html = "";
      const mockUri = {
        toString: () => "vscode-webview://empty-uri",
      } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe("");
    });

    it("should handle HTML with only /assets/ without following path", () => {
      const html = "<div>/assets/</div><span>text /assets/ more text</span>";
      const mockUri = {
        toString: () => "vscode-webview://edge-case-uri",
      } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toBe(
        "<div>vscode-webview://edge-case-uri/</div><span>text vscode-webview://edge-case-uri/ more text</span>"
      );
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
      const mockUri = {
        toString: () => "vscode-webview://complex-uri",
      } as vscode.Uri;

      const result = replaceAssetPaths(html, mockUri);

      expect(result).toContain('href="vscode-webview://complex-uri/styles/main.css"');
      expect(result).toContain('href="vscode-webview://complex-uri/favicon.ico"');
      expect(result).toContain('src="vscode-webview://complex-uri/images/logo.png"');
      expect(result).toContain('src="vscode-webview://complex-uri/js/main.js"');
    });
  });

  describe("injectSecurityAndVSCodeApi", () => {
    const mockWebview = {
      cspSource: "vscode-webview://test-source",
    } as vscode.Webview;

    it("should inject CSP meta tag and vscode API script into head section", () => {
      const html = "<html><head><title>Test</title></head><body></body></html>";

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain("default-src 'none'");
      expect(result).toContain(`style-src ${mockWebview.cspSource} 'unsafe-inline'`);
      expect(result).toContain(`script-src ${mockWebview.cspSource} 'unsafe-inline'`);
      expect(result).toContain(`img-src ${mockWebview.cspSource} https: data:`);
      expect(result).toContain("const vscode = acquireVsCodeApi();");
    });

    it("should place injected content after opening head tag", () => {
      const html = "<html><head><title>Test Title</title></head><body></body></html>";

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      const headIndex = result.indexOf("<head>");
      const metaIndex = result.indexOf('<meta http-equiv="Content-Security-Policy"');
      const scriptIndex = result.indexOf("<script>");
      const titleIndex = result.indexOf("<title>Test Title</title>");

      expect(metaIndex).toBeGreaterThan(headIndex);
      expect(scriptIndex).toBeGreaterThan(metaIndex);
      expect(titleIndex).toBeGreaterThan(scriptIndex);
    });

    it("should handle HTML without head tag", () => {
      const html = "<html><body><div>No head tag</div></body></html>";

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toBe("<html><body><div>No head tag</div></body></html>");
    });

    it("should handle empty HTML string", () => {
      const html = "";

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toBe("");
    });

    it("should handle HTML with multiple head tags", () => {
      const html =
        "<html><head><title>First</title></head><body><head>Second head</head></body></html>";

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      const firstHeadIndex = result.indexOf("<head>");
      const metaIndex = result.indexOf('<meta http-equiv="Content-Security-Policy"');
      const secondHeadIndex = result.indexOf("<head>", firstHeadIndex + 1);

      expect(metaIndex).toBeGreaterThan(firstHeadIndex);
      expect(metaIndex).toBeLessThan(secondHeadIndex);
      expect(result.indexOf('<meta http-equiv="Content-Security-Policy"', metaIndex + 1)).toBe(-1);
    });

    it("should preserve existing head content", () => {
      const html =
        '<html><head><meta charset="UTF-8"><title>Test</title><link rel="stylesheet" href="style.css"></head><body></body></html>';

      const result = injectSecurityAndVSCodeApi(html, mockWebview);

      expect(result).toContain('<meta charset="UTF-8">');
      expect(result).toContain("<title>Test</title>");
      expect(result).toContain('<link rel="stylesheet" href="style.css">');
      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain("const vscode = acquireVsCodeApi();");
    });

    it("should use correct webview cspSource in CSP directive", () => {
      const customWebview = {
        cspSource: "vscode-webview://custom-source-123",
      } as vscode.Webview;
      const html = "<html><head></head><body></body></html>";

      const result = injectSecurityAndVSCodeApi(html, customWebview);

      expect(result).toContain("style-src vscode-webview://custom-source-123 'unsafe-inline'");
      expect(result).toContain("script-src vscode-webview://custom-source-123 'unsafe-inline'");
      expect(result).toContain("img-src vscode-webview://custom-source-123 https: data:");
    });
  });

  describe("checkWebviewFilesExist", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return true when index.html exists in webview path", async () => {
      const webviewPath = "/test/webview/path";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);

      const result = await checkWebviewFilesExist(webviewPath);

      expect(result).toBe(true);
      expect(accessSpy).toHaveBeenCalledWith(expectedIndexPath);
      accessSpy.mockRestore();
    });

    it("should return false when index.html does not exist in webview path", async () => {
      const webviewPath = "/test/missing/path";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      const accessSpy = jest.spyOn(fs.promises, "access").mockRejectedValue(new Error("File not found"));

      const result = await checkWebviewFilesExist(webviewPath);

      expect(result).toBe(false);
      expect(accessSpy).toHaveBeenCalledWith(expectedIndexPath);
      accessSpy.mockRestore();
    });

    it("should handle empty webview path", async () => {
      const webviewPath = "";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      const accessSpy = jest.spyOn(fs.promises, "access").mockRejectedValue(new Error("File not found"));

      const result = await checkWebviewFilesExist(webviewPath);

      expect(result).toBe(false);
      expect(accessSpy).toHaveBeenCalledWith(expectedIndexPath);
      accessSpy.mockRestore();
    });

    it("should handle relative webview path", async () => {
      const webviewPath = "./relative/path";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);

      const result = await checkWebviewFilesExist(webviewPath);

      expect(result).toBe(true);
      expect(accessSpy).toHaveBeenCalledWith(expectedIndexPath);
      accessSpy.mockRestore();
    });

    it("should handle path with special characters", async () => {
      const webviewPath = "/test/path with spaces/and-special_chars";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);

      const result = await checkWebviewFilesExist(webviewPath);

      expect(result).toBe(true);
      expect(accessSpy).toHaveBeenCalledWith(expectedIndexPath);
      accessSpy.mockRestore();
    });
  });

  describe("buildWebviewHtml", () => {
    let mockExtensionUri: vscode.Uri;
    let mockWebview: vscode.Webview;
    let mockAssetsUri: vscode.Uri;

    beforeEach(() => {
      jest.clearAllMocks();

      mockExtensionUri = {
        fsPath: "/test/extension/path",
      } as vscode.Uri;

      mockWebview = {
        asWebviewUri: jest.fn(),
        cspSource: "vscode-webview://test-source",
      } as unknown as vscode.Webview;

      mockAssetsUri = {
        toString: () => "vscode-webview://assets-uri",
      } as vscode.Uri;

      (mockWebview.asWebviewUri as jest.Mock).mockReturnValue(mockAssetsUri);
      (vscode.Uri.file as jest.Mock).mockReturnValue(mockAssetsUri);
    });

    it("should return fallback HTML when webview files do not exist", async () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "src", "extension", "view-dist");
      const indexPath = path.join(webviewPath, "index.html");

      const accessSpy = jest.spyOn(fs.promises, "access").mockRejectedValue(new Error("File not found"));

      const result = await buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toContain("Configuration UI Not Available");
      expect(result).toContain("cd src/view && npm run build");
      expect(accessSpy).toHaveBeenCalledWith(indexPath);
      accessSpy.mockRestore();
    });

    it("should process HTML file when webview files exist", async () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "src", "extension", "view-dist");
      const indexPath = path.join(webviewPath, "index.html");
      const mockHtml =
        '<html><head><title>Test</title></head><body><img src="/assets/icon.png"></body></html>';

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);
      const readFileSpy = jest.spyOn(fs.promises, "readFile").mockResolvedValue(mockHtml);

      const result = await buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toBeDefined();
      expect(accessSpy).toHaveBeenCalledWith(indexPath);
      expect(readFileSpy).toHaveBeenCalledWith(indexPath, "utf8");
      expect(vscode.Uri.file).toHaveBeenCalledWith(path.join(webviewPath, "assets"));
      expect(mockWebview.asWebviewUri).toHaveBeenCalledWith(mockAssetsUri);

      accessSpy.mockRestore();
      readFileSpy.mockRestore();
    });

    it("should replace asset paths and inject security content", async () => {
      const mockHtml =
        '<html><head><title>Test</title></head><body><img src="/assets/icon.png"><script src="/assets/script.js"></script></body></html>';

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);
      const readFileSpy = jest.spyOn(fs.promises, "readFile").mockResolvedValue(mockHtml);

      const result = await buildWebviewHtml(mockExtensionUri, mockWebview);

      // Check asset path replacement
      expect(result).toContain('src="vscode-webview://assets-uri/icon.png"');
      expect(result).toContain('src="vscode-webview://assets-uri/script.js"');

      // Check security injection
      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain("const vscode = acquireVsCodeApi();");
      expect(result).toContain(`style-src ${mockWebview.cspSource} 'unsafe-inline'`);

      accessSpy.mockRestore();
      readFileSpy.mockRestore();
    });

    it("should handle complex HTML with multiple asset references", async () => {
      const mockHtml = `
        <html>
          <head>
            <title>Complex Test</title>
            <link rel="stylesheet" href="/assets/styles/main.css">
            <link rel="icon" href="/assets/favicon.ico">
          </head>
          <body>
            <img src="/assets/images/logo.png" alt="logo">
            <script src="/assets/js/main.js"></script>
            <script src="/assets/js/utils.js"></script>
          </body>
        </html>
      `;

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);
      const readFileSpy = jest.spyOn(fs.promises, "readFile").mockResolvedValue(mockHtml);

      const result = await buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toContain('href="vscode-webview://assets-uri/styles/main.css"');
      expect(result).toContain('href="vscode-webview://assets-uri/favicon.ico"');
      expect(result).toContain('src="vscode-webview://assets-uri/images/logo.png"');
      expect(result).toContain('src="vscode-webview://assets-uri/js/main.js"');
      expect(result).toContain('src="vscode-webview://assets-uri/js/utils.js"');

      accessSpy.mockRestore();
      readFileSpy.mockRestore();
    });

    it("should handle empty HTML file", async () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "src", "extension", "view-dist");
      const indexPath = path.join(webviewPath, "index.html");
      const mockHtml = "";

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);
      const readFileSpy = jest.spyOn(fs.promises, "readFile").mockResolvedValue(mockHtml);

      const result = await buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toBe("");
      expect(readFileSpy).toHaveBeenCalledWith(indexPath, "utf8");

      accessSpy.mockRestore();
      readFileSpy.mockRestore();
    });

    it("should handle HTML without assets paths", async () => {
      const mockHtml =
        "<html><head><title>No Assets</title></head><body><div>Simple content</div></body></html>";

      const accessSpy = jest.spyOn(fs.promises, "access").mockResolvedValue(undefined);
      const readFileSpy = jest.spyOn(fs.promises, "readFile").mockResolvedValue(mockHtml);

      const result = await buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toContain("<div>Simple content</div>");
      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain("const vscode = acquireVsCodeApi();");
      expect(result).not.toContain("vscode-webview://assets-uri/");

      accessSpy.mockRestore();
      readFileSpy.mockRestore();
    });
  });
});
