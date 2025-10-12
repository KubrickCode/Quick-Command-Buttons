import { type ButtonConfig, type VSCodeMessage } from "../types";
import { mockCommands } from "./mock-data.tsx";

class VSCodeMock {
  private currentData = mockCommands;

  getCurrentData(): ButtonConfig[] {
    return [...this.currentData];
  }

  postMessage(message: VSCodeMessage): void {
    console.log("Mock VSCode received message:", message);

    if (message.type === "getConfig") {
      setTimeout(() => {
        const mockMessage = {
          data: this.currentData,
          type: "configData",
        };
        window.dispatchEvent(new MessageEvent("message", { data: mockMessage }));
      }, 100);
    } else if (message.type === "setConfig" && message.data) {
      this.currentData = message.data as ButtonConfig[];
      console.log("Mock VSCode saved config:", this.currentData);
    }
  }

  setCurrentData(data: ButtonConfig[]): void {
    this.currentData = [...data];
  }
}

export const vscodeMock = new VSCodeMock();
