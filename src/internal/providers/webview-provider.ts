import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { z } from "zod";
import { CONFIGURATION_TARGETS } from "../../pkg/config-constants";
import { WebviewMessage } from "../../pkg/types";
import { MESSAGE_TYPE, MESSAGES, COMMANDS } from "../../shared/constants";
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

export const checkWebviewFilesExist = async (webviewPath: string): Promise<boolean> => {
  const indexPath = path.join(webviewPath, "index.html");
  try {
    await fs.promises.access(indexPath);
    return true;
  } catch {
    return false;
  }
};

export const buildWebviewHtml = async (
  extensionUri: vscode.Uri,
  webview: vscode.Webview
): Promise<string> => {
  const webviewPath = path.join(extensionUri.fsPath, ...VIEW_DIST_PATH_SEGMENTS);

  if (!(await checkWebviewFilesExist(webviewPath))) {
    return generateFallbackHtml();
  }

  const indexPath = path.join(webviewPath, "index.html");
  let html = await fs.promises.readFile(indexPath, "utf8");

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

type VisibilityOptions = {
  isVisible: () => boolean;
  onVisibilityChange: (handler: () => void) => vscode.Disposable;
};

type InitializeWebviewOptions = {
  configManager: ConfigManager;
  configReader: ConfigReader;
  disposables: vscode.Disposable[];
  extensionUri: vscode.Uri;
  visibilityOptions: VisibilityOptions;
  webview: vscode.Webview;
};

const setupThemeSynchronization = (
  webview: vscode.Webview,
  visibilityOptions: VisibilityOptions,
  disposables: vscode.Disposable[]
): void => {
  const sendThemeMessage = () => {
    const theme = vscode.window.activeColorTheme;
    webview.postMessage({
      data: { kind: theme.kind },
      type: MESSAGE_TYPE.THEME_CHANGED,
    });
  };

  // Send initial theme
  sendThemeMessage();

  disposables.push(
    vscode.window.onDidChangeActiveColorTheme(() => {
      sendThemeMessage();
    })
  );

  disposables.push(
    visibilityOptions.onVisibilityChange(() => {
      if (visibilityOptions.isVisible()) {
        sendThemeMessage();
      }
    })
  );
};

const initializeWebview = async (options: InitializeWebviewOptions): Promise<void> => {
  const { configManager, configReader, disposables, extensionUri, visibilityOptions, webview } =
    options;

  webview.options = {
    enableScripts: true,
    localResourceRoots: [extensionUri],
  };

  webview.html = await buildWebviewHtml(extensionUri, webview);

  disposables.push(
    webview.onDidReceiveMessage(async (data: WebviewMessage) => {
      await handleWebviewMessage(data, webview, configReader, configManager);
    }, undefined)
  );

  webview.postMessage({
    data: configManager.getConfigDataForWebview(configReader),
    type: "configData",
  });

  setupThemeSynchronization(webview, visibilityOptions, disposables);
};

export const handleWebviewMessage = async (
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
          await vscode.commands.executeCommand(COMMANDS.REFRESH);
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
          message.target === CONFIGURATION_TARGETS.WORKSPACE ||
          message.target === CONFIGURATION_TARGETS.LOCAL
        ) {
          await configManager.updateConfigurationTarget(message.target);
          webview.postMessage({
            data: configManager.getConfigDataForWebview(configReader),
            requestId: message.requestId,
            type: "configData",
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
  private static _activePanels: vscode.WebviewPanel[] = [];
  private static _instance: ConfigWebviewProvider | undefined;
  private _viewDisposables: vscode.Disposable[] = [];
  private _webviewView?: vscode.WebviewView;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private configReader: ConfigReader,
    private configManager: ConfigManager
  ) {
    ConfigWebviewProvider._instance = this;
  }

  public static createWebviewCommand(
    extensionUri: vscode.Uri,
    configReader: ConfigReader,
    configManager: ConfigManager
  ) {
    return async () => {
      const panel = vscode.window.createWebviewPanel(
        "quickCommandsConfig",
        "Quick Commands Configuration",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [extensionUri],
        }
      );

      ConfigWebviewProvider.registerPanel(panel);

      const disposables: vscode.Disposable[] = [];

      await initializeWebview({
        configManager,
        configReader,
        disposables,
        extensionUri,
        visibilityOptions: {
          isVisible: () => panel.visible,
          onVisibilityChange: (handler) => panel.onDidChangeViewState(handler),
        },
        webview: panel.webview,
      });

      panel.onDidDispose(() => {
        disposables.forEach((d) => d.dispose());
      });
    };
  }

  public static getInstance(): ConfigWebviewProvider | undefined {
    return ConfigWebviewProvider._instance;
  }

  public static registerPanel(panel: vscode.WebviewPanel): void {
    ConfigWebviewProvider._activePanels.push(panel);
    panel.onDidDispose(() => {
      const index = ConfigWebviewProvider._activePanels.indexOf(panel);
      if (index > -1) {
        ConfigWebviewProvider._activePanels.splice(index, 1);
      }
    });
  }

  public refresh(): void {
    const configData = this.configManager.getConfigDataForWebview(this.configReader);

    if (this._webviewView) {
      this._webviewView.webview.postMessage({
        data: configData,
        type: "configData",
      });
    }

    ConfigWebviewProvider._activePanels.forEach((panel) => {
      panel.webview.postMessage({
        data: configData,
        type: "configData",
      });
    });
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._disposeAndClearViewDisposables();
    this._webviewView = webviewView;

    await initializeWebview({
      configManager: this.configManager,
      configReader: this.configReader,
      disposables: this._viewDisposables,
      extensionUri: this._extensionUri,
      visibilityOptions: {
        isVisible: () => webviewView.visible,
        onVisibilityChange: (handler) => webviewView.onDidChangeVisibility(handler),
      },
      webview: webviewView.webview,
    });

    this._viewDisposables.push(
      webviewView.onDidDispose(() => {
        this._webviewView = undefined;
        this._disposeAndClearViewDisposables();
      })
    );
  }

  private _disposeAndClearViewDisposables(): void {
    this._viewDisposables.forEach((d) => d.dispose());
    this._viewDisposables = [];
  }
}
