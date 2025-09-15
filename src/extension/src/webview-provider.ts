import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { ButtonConfig } from "./types";
import { ConfigReader } from "./adapters";

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

export const replaceAssetPaths = (
  html: string,
  assetsUri: vscode.Uri
): string => {
  return html.replace(/\/assets\//g, `${assetsUri}/`);
};

export const injectSecurityAndVSCodeApi = (
  html: string,
  webview: vscode.Webview
): string => {
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

export const buildWebviewHtml = (
  extensionUri: vscode.Uri,
  webview: vscode.Webview
): string => {
  const webviewPath = path.join(extensionUri.fsPath, "web-view-dist");

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

export const updateButtonConfiguration = async (
  buttons: ButtonConfig[]
): Promise<void> => {
  try {
    const config = vscode.workspace.getConfiguration("quickCommandButtons");
    await config.update(
      "buttons",
      buttons,
      vscode.ConfigurationTarget.Workspace
    );
    vscode.window.showInformationMessage("Configuration updated successfully!");
  } catch (error) {
    console.error("Failed to update configuration:", error);
    vscode.window.showErrorMessage(
      "Failed to update configuration. Please try again."
    );
  }
};

export class ConfigWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "quickCommandsConfig";
  private _view?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private configReader: ConfigReader
  ) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "getConfig":
          webviewView.webview.postMessage({
            type: "configData",
            data: this.configReader.getButtons(),
          });
          break;
        case "setConfig":
          await this._updateConfiguration(data.data);
          break;
      }
    }, undefined);
  }

  private async _updateConfiguration(buttons: ButtonConfig[]) {
    await updateButtonConfiguration(buttons);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return buildWebviewHtml(this._extensionUri, webview);
  }

  public static createWebviewCommand(
    extensionUri: vscode.Uri,
    configReader: ConfigReader
  ) {
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
        switch (data.type) {
          case "getConfig":
            panel.webview.postMessage({
              type: "configData",
              data: configReader.getButtons(),
            });
            break;
          case "setConfig":
            await updateButtonConfiguration(data.data);
            break;
        }
      }, undefined);

      // Send initial config
      panel.webview.postMessage({
        type: "configData",
        data: configReader.getButtons(),
      });
    };
  }
}
