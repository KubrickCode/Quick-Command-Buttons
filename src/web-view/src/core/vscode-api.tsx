import { type VSCodeMessage, type ButtonConfig } from "../types";
import { vscodeMock } from "../mock/vscode-mock.tsx";

export type VSCodeWebviewAPI = {
  postMessage(message: VSCodeMessage): void;
  getState(): unknown;
  setState(state: unknown): void;
};

declare global {
  function acquireVsCodeApi(): VSCodeWebviewAPI;
  const vscode: VSCodeWebviewAPI;
}

export const isDevelopment = import.meta.env.MODE === "development";

export type VSCodeAPI = {
  postMessage(message: VSCodeMessage): void;
  getCurrentData?(): ButtonConfig[];
  setCurrentData?(data: ButtonConfig[]): void;
  addMessageListener?(listener: (event: MessageEvent) => void): void;
  removeMessageListener?(listener: (event: MessageEvent) => void): void;
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
