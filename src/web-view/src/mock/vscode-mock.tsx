import { type ButtonConfig, type VSCodeMessage } from "../types";
import { mockCommands } from "./mock-data.tsx";

class VSCodeMock {
  private currentData = mockCommands;

  postMessage(message: VSCodeMessage): void {
    console.log("Mock VSCode received message:", message);

    if (message.type === "getConfig") {
      setTimeout(() => {
        const mockMessage = {
          type: "configData",
          data: this.currentData,
        };
        window.dispatchEvent(
          new MessageEvent("message", { data: mockMessage })
        );
      }, 100);
    } else if (message.type === "setConfig" && message.data) {
      this.currentData = message.data as ButtonConfig[];
      console.log("Mock VSCode saved config:", this.currentData);
    }
  }

  getCurrentData(): ButtonConfig[] {
    return [...this.currentData];
  }

  setCurrentData(data: ButtonConfig[]): void {
    this.currentData = [...data];
  }
}

export const vscodeMock = new VSCodeMock();
