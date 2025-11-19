import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { z } from "zod";
import { CONFIGURATION_TARGETS } from "../../pkg/config-constants";
import { WebviewMessage } from "../../pkg/types";
import { MESSAGES } from "../../shared/constants";
import { ConfigReader } from "../adapters";
import { ConfigManager } from "../managers/config-manager";
import { ButtonConfigWithOptionalId } from "../utils/ensure-id";

const VIEW_DIST_PATH_SEGMENTS = ["src", "extension", "view-dist"];

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
            <p>Please build the view first:</p>
            <pre>cd src/view && npm run build</pre>
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
  const webviewPath = path.join(extensionUri.fsPath, ...VIEW_DIST_PATH_SEGMENTS);

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

const buttonConfigWithOptionalIdSchema: z.ZodType<ButtonConfigWithOptionalId> = z.lazy(() =>
  z.object({
    color: z.string().optional(),
    command: z.string().optional(),
    executeAll: z.boolean().optional(),
    group: z.array(buttonConfigWithOptionalIdSchema).optional(),
    id: z.string().optional(),
    name: z.string(),
    shortcut: z.string().optional(),
    terminalName: z.string().optional(),
    useVsCodeApi: z.boolean().optional(),
  })
);

const buttonConfigArraySchema = z.array(buttonConfigWithOptionalIdSchema);

const isButtonConfigArray = (data: unknown): data is ButtonConfigWithOptionalId[] => {
  const result = buttonConfigArraySchema.safeParse(data);
  return result.success;
};

const handleWebviewMessage = async (
  message: WebviewMessage,
  webview: vscode.Webview,
  configReader: ConfigReader,
  configManager: ConfigManager
): Promise<void> => {
  try {
    switch (message.type) {
      case "getConfig":
        webview.postMessage({
          data: configManager.getConfigDataForWebview(configReader),
          requestId: message.requestId,
          type: "configData",
        });
        break;
      case "setConfig":
        if (isButtonConfigArray(message.data)) {
          await configManager.updateButtonConfiguration(message.data);
          webview.postMessage({
            requestId: message.requestId,
            type: "success",
          });
        } else {
          throw new Error(MESSAGES.ERROR.invalidSetConfigData);
        }
        break;
      case "setConfigurationTarget":
        if (
          message.target === CONFIGURATION_TARGETS.GLOBAL ||
          message.target === CONFIGURATION_TARGETS.WORKSPACE
        ) {
          await configManager.updateConfigurationTarget(message.target);
          webview.postMessage({
            requestId: message.requestId,
            type: "success",
          });
        } else {
          throw new Error(MESSAGES.ERROR.invalidConfigurationTarget(message.target ?? "undefined"));
        }
        break;
    }
  } catch (error) {
    webview.postMessage({
      error: error instanceof Error ? error.message : MESSAGES.ERROR.unknownError,
      requestId: message.requestId,
      type: "error",
    });
  }
};

export class ConfigWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "quickCommandsConfig";

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private configReader: ConfigReader,
    private configManager: ConfigManager
  ) {}

  public static createWebviewCommand(
    extensionUri: vscode.Uri,
    configReader: ConfigReader,
    configManager: ConfigManager
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

      panel.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
        await handleWebviewMessage(data, panel.webview, configReader, configManager);
      }, undefined);

      // Send initial config
      panel.webview.postMessage({
        data: configManager.getConfigDataForWebview(configReader),
        type: "configData",
      });
    };
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = buildWebviewHtml(this._extensionUri, webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data: WebviewMessage) => {
      await handleWebviewMessage(data, webviewView.webview, this.configReader, this.configManager);
    }, undefined);
  }
}
