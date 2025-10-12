import { vscodeMock } from "../mock/vscode-mock.tsx";
import { type VSCodeMessage, type ButtonConfig } from "../types";

export type VSCodeWebviewAPI = {
  getState(): unknown;
  postMessage(message: VSCodeMessage): void;
  setState(state: unknown): void;
};

declare global {
  function acquireVsCodeApi(): VSCodeWebviewAPI;
  const vscode: VSCodeWebviewAPI;
}

export const isDevelopment = import.meta.env.MODE === "development";

export type VSCodeAPI = {
  addMessageListener?(listener: (event: MessageEvent) => void): void;
  getCurrentData?(): ButtonConfig[];
  postMessage(message: VSCodeMessage): void;
  removeMessageListener?(listener: (event: MessageEvent) => void): void;
  setCurrentData?(data: ButtonConfig[]): void;
};

const getVSCodeAPI = (): VSCodeAPI => {
  if (typeof vscode !== "undefined") {
    return vscode;
  }
  if (typeof acquireVsCodeApi === "function") {
    return acquireVsCodeApi();
  }
  throw new Error("Could not acquire VS Code API.");
};

export const vscodeApi: VSCodeAPI = isDevelopment ? vscodeMock : getVSCodeAPI();
