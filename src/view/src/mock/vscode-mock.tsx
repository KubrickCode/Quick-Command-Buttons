import { CONFIGURATION_TARGET } from "../../../shared/constants";
import { type ButtonConfig, type VSCodeMessage } from "../types";
import { mockCommands } from "./mock-data.tsx";

class VSCodeMock {
  private configurationTarget: string = CONFIGURATION_TARGET.WORKSPACE;
  private globalData: ButtonConfig[] = [];
  private workspaceData: ButtonConfig[] = mockCommands;

  private get currentData(): ButtonConfig[] {
    return this.configurationTarget === CONFIGURATION_TARGET.WORKSPACE
      ? this.workspaceData
      : this.globalData;
  }

  private set currentData(data: ButtonConfig[]) {
    if (this.configurationTarget === CONFIGURATION_TARGET.WORKSPACE) {
      this.workspaceData = data;
    } else {
      this.globalData = data;
    }
  }

  getCurrentData(): ButtonConfig[] {
    return [...this.currentData];
  }

  postMessage(message: VSCodeMessage): void {
    console.log("Mock VSCode received message:", message);

    if (message.type === "getConfig") {
      setTimeout(() => {
        const mockMessage = {
          data: {
            buttons: this.currentData,
            configurationTarget: this.configurationTarget,
          },
          requestId: message.requestId,
          type: "configData",
        };
        window.dispatchEvent(new MessageEvent("message", { data: mockMessage }));
      }, 100);
    } else if (message.type === "setConfig" && message.data) {
      this.currentData = message.data as ButtonConfig[];
      console.log("Mock VSCode saved config:", this.currentData);
      setTimeout(() => {
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              requestId: message.requestId,
              type: "success",
            },
          })
        );
      }, 50);
    } else if (message.type === "setConfigurationTarget" && message.target) {
      this.configurationTarget = message.target;
      console.log("Mock VSCode changed configuration target:", this.configurationTarget);
      setTimeout(() => {
        const mockMessage = {
          data: {
            buttons: this.currentData,
            configurationTarget: this.configurationTarget,
          },
          requestId: message.requestId,
          type: "configData",
        };
        window.dispatchEvent(new MessageEvent("message", { data: mockMessage }));
      }, 100);
    }
  }

  setCurrentData(data: ButtonConfig[]): void {
    this.currentData = [...data];
  }
}

export const vscodeMock = new VSCodeMock();
