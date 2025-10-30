import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { ConfigReader } from "./adapters";
import { ConfigurationTargetType } from "./config-constants";
import { ConfigManager } from "./config-manager";
import { ButtonConfig } from "./types";

export const generateFallbackHtml = (): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Configuration UI</title>
    </head>
    <body>
        <div style="padding: 20px; text-align: center;">
            <h2>Configuration UI Not Available</h2>
            <p>Please build the web-view first:</p>
            <pre>cd src/web-view && npm run build</pre>
        </div>
    </body>
    </html>
  `;
};

export const replaceAssetPaths = (html: string, assetsUri: vscode.Uri): string => {
  return html.replace(/\/assets\//g, `${assetsUri}/`);
};

export const injectSecurityAndVSCodeApi = (html: string, webview: vscode.Webview): string => {
  return html.replace(
    "<head>",
    `<head>
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline'; img-src ${webview.cspSource} https: data:;">
      <script>
        const vscode = acquireVsCodeApi();
      </script>`
  );
};

export const checkWebviewFilesExist = (webviewPath: string): boolean => {
  const indexPath = path.join(webviewPath, "index.html");
  return fs.existsSync(indexPath);
};

export const buildWebviewHtml = (extensionUri: vscode.Uri, webview: vscode.Webview): string => {
  const webviewPath = path.join(extensionUri.fsPath, "src", "extension", "web-view-dist");

  if (!checkWebviewFilesExist(webviewPath)) {
    return generateFallbackHtml();
  }

  const indexPath = path.join(webviewPath, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");

  const assetsPath = vscode.Uri.file(path.join(webviewPath, "assets"));
  const assetsUri = webview.asWebviewUri(assetsPath);

  html = replaceAssetPaths(html, assetsUri);
  html = injectSecurityAndVSCodeApi(html, webview);

  return html;
};

export const updateButtonConfiguration = async (buttons: ButtonConfig[]): Promise<void> => {
  await ConfigManager.updateButtonConfiguration(buttons);
};

const handleWebviewMessage = async (
  data: any,
  webview: vscode.Webview,
  configReader: ConfigReader
): Promise<void> => {
  switch (data.type) {
    case "getConfig":
      webview.postMessage({
        data: ConfigManager.getConfigDataForWebview(configReader),
        type: "configData",
      });
      break;
    case "setConfig":
      await updateButtonConfiguration(data.data);
      break;
    case "setConfigurationTarget":
      await ConfigManager.updateConfigurationTarget(data.target as ConfigurationTargetType);
      break;
  }
};

export class ConfigWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "quickCommandsConfig";
  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri, private configReader: ConfigReader) {}

  public static createWebviewCommand(extensionUri: vscode.Uri, configReader: ConfigReader) {
    return () => {
      const panel = vscode.window.createWebviewPanel(
        "quickCommandsConfig",
        "Quick Commands Configuration",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [extensionUri],
        }
      );

      panel.webview.html = buildWebviewHtml(extensionUri, panel.webview);

      panel.webview.onDidReceiveMessage(async (data) => {
        await handleWebviewMessage(data, panel.webview, configReader);
      }, undefined);

      // Send initial config
      panel.webview.postMessage({
        data: ConfigManager.getConfigDataForWebview(configReader),
        type: "configData",
      });
    };
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      await handleWebviewMessage(data, webviewView.webview, this.configReader);
    }, undefined);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return buildWebviewHtml(this._extensionUri, webview);
  }
}
