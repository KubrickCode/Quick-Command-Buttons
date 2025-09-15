import { generateFallbackHtml, replaceAssetPaths, injectSecurityAndVSCodeApi, checkWebviewFilesExist, buildWebviewHtml, updateButtonConfiguration } from "./webview-provider";
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// Mock fs module
jest.mock("fs");

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

  describe("checkWebviewFilesExist", () => {
    const mockedFs = fs as jest.Mocked<typeof fs>;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return true when index.html exists in webview path", () => {
      const webviewPath = "/test/webview/path";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      mockedFs.existsSync.mockImplementation((filePath) => {
        return filePath === expectedIndexPath;
      });

      const result = checkWebviewFilesExist(webviewPath);

      expect(result).toBe(true);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedIndexPath);
    });

    it("should return false when index.html does not exist in webview path", () => {
      const webviewPath = "/test/missing/path";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      mockedFs.existsSync.mockReturnValue(false);

      const result = checkWebviewFilesExist(webviewPath);

      expect(result).toBe(false);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedIndexPath);
    });

    it("should handle empty webview path", () => {
      const webviewPath = "";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      mockedFs.existsSync.mockReturnValue(false);

      const result = checkWebviewFilesExist(webviewPath);

      expect(result).toBe(false);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedIndexPath);
    });

    it("should handle relative webview path", () => {
      const webviewPath = "./relative/path";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      mockedFs.existsSync.mockImplementation((filePath) => {
        return filePath === expectedIndexPath;
      });

      const result = checkWebviewFilesExist(webviewPath);

      expect(result).toBe(true);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedIndexPath);
    });

    it("should handle path with special characters", () => {
      const webviewPath = "/test/path with spaces/and-special_chars";
      const expectedIndexPath = path.join(webviewPath, "index.html");

      mockedFs.existsSync.mockImplementation((filePath) => {
        return filePath === expectedIndexPath;
      });

      const result = checkWebviewFilesExist(webviewPath);

      expect(result).toBe(true);
      expect(mockedFs.existsSync).toHaveBeenCalledWith(expectedIndexPath);
    });
  });

  describe("buildWebviewHtml", () => {
    const mockedFs = fs as jest.Mocked<typeof fs>;

    let mockExtensionUri: vscode.Uri;
    let mockWebview: vscode.Webview;
    let mockAssetsUri: vscode.Uri;

    beforeEach(() => {
      jest.clearAllMocks();

      mockExtensionUri = {
        fsPath: "/test/extension/path"
      } as vscode.Uri;

      mockWebview = {
        cspSource: "vscode-webview://test-source",
        asWebviewUri: jest.fn()
      } as unknown as vscode.Webview;

      mockAssetsUri = {
        toString: () => "vscode-webview://assets-uri"
      } as vscode.Uri;

      (mockWebview.asWebviewUri as jest.Mock).mockReturnValue(mockAssetsUri);
      (vscode.Uri.file as jest.Mock).mockReturnValue(mockAssetsUri);
    });

    it("should return fallback HTML when webview files do not exist", () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "web-view-dist");
      const indexPath = path.join(webviewPath, "index.html");

      mockedFs.existsSync.mockImplementation((filePath) => filePath !== indexPath);

      const result = buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toContain("Configuration UI Not Available");
      expect(result).toContain("cd src/web-view && npm run build");
      expect(mockedFs.existsSync).toHaveBeenCalledWith(indexPath);
    });

    it("should process HTML file when webview files exist", () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "web-view-dist");
      const indexPath = path.join(webviewPath, "index.html");
      const mockHtml = '<html><head><title>Test</title></head><body><img src="/assets/icon.png"></body></html>';

      mockedFs.existsSync.mockImplementation((filePath) => filePath === indexPath);
      mockedFs.readFileSync.mockReturnValue(mockHtml);

      const result = buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toBeDefined();
      expect(mockedFs.existsSync).toHaveBeenCalledWith(indexPath);
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(indexPath, "utf8");
      expect(vscode.Uri.file).toHaveBeenCalledWith(path.join(webviewPath, "assets"));
      expect(mockWebview.asWebviewUri).toHaveBeenCalledWith(mockAssetsUri);
    });

    it("should replace asset paths and inject security content", () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "web-view-dist");
      const indexPath = path.join(webviewPath, "index.html");
      const mockHtml = '<html><head><title>Test</title></head><body><img src="/assets/icon.png"><script src="/assets/script.js"></script></body></html>';

      mockedFs.existsSync.mockImplementation((filePath) => filePath === indexPath);
      mockedFs.readFileSync.mockReturnValue(mockHtml);

      const result = buildWebviewHtml(mockExtensionUri, mockWebview);

      // Check asset path replacement
      expect(result).toContain('src="vscode-webview://assets-uri/icon.png"');
      expect(result).toContain('src="vscode-webview://assets-uri/script.js"');

      // Check security injection
      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain('const vscode = acquireVsCodeApi();');
      expect(result).toContain(`style-src ${mockWebview.cspSource} 'unsafe-inline'`);
    });

    it("should handle complex HTML with multiple asset references", () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "web-view-dist");
      const indexPath = path.join(webviewPath, "index.html");
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

      mockedFs.existsSync.mockImplementation((filePath) => filePath === indexPath);
      mockedFs.readFileSync.mockReturnValue(mockHtml);

      const result = buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toContain('href="vscode-webview://assets-uri/styles/main.css"');
      expect(result).toContain('href="vscode-webview://assets-uri/favicon.ico"');
      expect(result).toContain('src="vscode-webview://assets-uri/images/logo.png"');
      expect(result).toContain('src="vscode-webview://assets-uri/js/main.js"');
      expect(result).toContain('src="vscode-webview://assets-uri/js/utils.js"');
    });

    it("should handle empty HTML file", () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "web-view-dist");
      const indexPath = path.join(webviewPath, "index.html");
      const mockHtml = "";

      mockedFs.existsSync.mockImplementation((filePath) => filePath === indexPath);
      mockedFs.readFileSync.mockReturnValue(mockHtml);

      const result = buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toBe("");
      expect(mockedFs.readFileSync).toHaveBeenCalledWith(indexPath, "utf8");
    });

    it("should handle HTML without assets paths", () => {
      const webviewPath = path.join(mockExtensionUri.fsPath, "web-view-dist");
      const indexPath = path.join(webviewPath, "index.html");
      const mockHtml = '<html><head><title>No Assets</title></head><body><div>Simple content</div></body></html>';

      mockedFs.existsSync.mockImplementation((filePath) => filePath === indexPath);
      mockedFs.readFileSync.mockReturnValue(mockHtml);

      const result = buildWebviewHtml(mockExtensionUri, mockWebview);

      expect(result).toContain('<div>Simple content</div>');
      expect(result).toContain('<meta http-equiv="Content-Security-Policy"');
      expect(result).toContain('const vscode = acquireVsCodeApi();');
      expect(result).not.toContain('vscode-webview://assets-uri/');
    });
  });

  describe("updateButtonConfiguration", () => {
    const mockConfig = {
      update: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);
      mockConfig.update.mockResolvedValue(undefined);
    });

    it("should successfully update button configuration and show success message", async () => {
      const buttons = [
        { name: "Test Button", command: "echo test" },
        { name: "Group Button", group: [{ name: "Sub Button", command: "echo sub" }] }
      ];

      await updateButtonConfiguration(buttons);

      expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("quickCommandButtons");
      expect(mockConfig.update).toHaveBeenCalledWith(
        "buttons",
        buttons,
        vscode.ConfigurationTarget.Workspace
      );
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("Configuration updated successfully!");
      expect(vscode.window.showErrorMessage).not.toHaveBeenCalled();
    });

    it("should handle empty button array", async () => {
      const buttons: any[] = [];

      await updateButtonConfiguration(buttons);

      expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("quickCommandButtons");
      expect(mockConfig.update).toHaveBeenCalledWith(
        "buttons",
        buttons,
        vscode.ConfigurationTarget.Workspace
      );
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("Configuration updated successfully!");
    });

    it("should handle button configuration with all properties", async () => {
      const buttons = [
        {
          name: "Complex Button",
          command: "echo complex",
          useVsCodeApi: true,
          color: "#FF0000",
          terminalName: "custom-terminal",
          shortcut: "c",
          executeAll: false
        }
      ];

      await updateButtonConfiguration(buttons);

      expect(mockConfig.update).toHaveBeenCalledWith(
        "buttons",
        buttons,
        vscode.ConfigurationTarget.Workspace
      );
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("Configuration updated successfully!");
    });

    it("should handle nested group configurations", async () => {
      const buttons = [
        {
          name: "Parent Group",
          group: [
            { name: "Child 1", command: "echo child1" },
            {
              name: "Nested Group",
              group: [
                { name: "Deep Child", command: "echo deep" }
              ]
            }
          ]
        }
      ];

      await updateButtonConfiguration(buttons);

      expect(mockConfig.update).toHaveBeenCalledWith(
        "buttons",
        buttons,
        vscode.ConfigurationTarget.Workspace
      );
      expect(vscode.window.showInformationMessage).toHaveBeenCalledWith("Configuration updated successfully!");
    });

    it("should show error message when configuration update fails", async () => {
      const buttons = [{ name: "Test Button", command: "echo test" }];
      const error = new Error("Configuration update failed");
      mockConfig.update.mockRejectedValue(error);

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateButtonConfiguration(buttons);

      expect(vscode.workspace.getConfiguration).toHaveBeenCalledWith("quickCommandButtons");
      expect(mockConfig.update).toHaveBeenCalledWith(
        "buttons",
        buttons,
        vscode.ConfigurationTarget.Workspace
      );
      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "Failed to update configuration. Please try again."
      );
      expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Failed to update configuration:", error);

      consoleSpy.mockRestore();
    });

    it("should handle workspace configuration service error", async () => {
      const buttons = [{ name: "Test Button", command: "echo test" }];
      const error = new Error("Workspace service unavailable");
      (vscode.workspace.getConfiguration as jest.Mock).mockImplementation(() => {
        throw error;
      });

      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await updateButtonConfiguration(buttons);

      expect(vscode.window.showErrorMessage).toHaveBeenCalledWith(
        "Failed to update configuration. Please try again."
      );
      expect(vscode.window.showInformationMessage).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith("Failed to update configuration:", error);

      consoleSpy.mockRestore();
    });
  });
});