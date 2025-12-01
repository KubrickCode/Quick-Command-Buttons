import { CONFIGURATION_TARGET, MESSAGE_TYPE } from "../../../shared/constants";
import type {
  ButtonConfigWithOptionalId,
  ButtonSet,
  ConfigurationTarget,
  ImportPreviewData,
  ImportPreviewResult,
  ImportResult,
  ImportStrategy,
  ShortcutConflict,
} from "../../../shared/types";
import { type ButtonConfig, type VSCodeMessage } from "../types";
import { mockCommands } from "./mock-data.tsx";

const MOCK_IMPORT_BUTTONS: ButtonConfigWithOptionalId[] = [
  { command: "npm run new-cmd", name: "New Import Command", shortcut: "t" }, // Conflicts with "$(pass) Test"
  { command: "npm run updated", name: "Build Project", shortcut: "b" },
];

class VSCodeMock {
  private activeSet: string | null = null;
  private buttonSets: ButtonSet[] = [];
  private configurationTarget: string = CONFIGURATION_TARGET.WORKSPACE;
  private globalData: ButtonConfig[] = [];
  private localData: ButtonConfig[] = [];
  private workspaceData: ButtonConfig[] = mockCommands;

  private get currentData(): ButtonConfig[] {
    if (this.configurationTarget === CONFIGURATION_TARGET.LOCAL) {
      return this.localData;
    }
    return this.configurationTarget === CONFIGURATION_TARGET.WORKSPACE
      ? this.workspaceData
      : this.globalData;
  }

  private set currentData(data: ButtonConfig[]) {
    if (this.configurationTarget === CONFIGURATION_TARGET.LOCAL) {
      this.localData = data;
    } else if (this.configurationTarget === CONFIGURATION_TARGET.WORKSPACE) {
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
            activeSet: this.activeSet,
            buttons: this.currentData,
            buttonSets: this.buttonSets,
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
    } else if (message.type === "setConfigurationTarget") {
      const target = message.target ?? (message.data as { target?: string } | undefined)?.target;
      if (!target) return;
      this.configurationTarget = target;
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
    } else if (message.type === MESSAGE_TYPE.PREVIEW_IMPORT) {
      console.log("Mock VSCode received previewImport");
      setTimeout(() => {
        const preview = this.createMockPreview();
        const result: ImportPreviewResult = { preview, success: true };
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              data: result,
              requestId: message.requestId,
              type: MESSAGE_TYPE.IMPORT_PREVIEW_RESULT,
            },
          })
        );
      }, 100);
    } else if (message.type === MESSAGE_TYPE.CONFIRM_IMPORT) {
      console.log("Mock VSCode received confirmImport", message.data);
      const data = message.data as { preview: ImportPreviewData; strategy: ImportStrategy };
      setTimeout(() => {
        this.applyMockImport(data.preview.buttons, data.strategy);
        const result: ImportResult = {
          backupPath: "/mock/backup/path.json",
          conflictsResolved: data.preview.analysis.modified.length,
          importedCount: data.preview.buttons.length,
          success: true,
        };
        window.dispatchEvent(
          new MessageEvent("message", {
            data: {
              data: result,
              requestId: message.requestId,
              type: "success",
            },
          })
        );
      }, 100);
    } else if (message.type === MESSAGE_TYPE.CREATE_BUTTON_SET) {
      const data = message.data as { name: string } | undefined;
      const name = data?.name;
      console.log("Mock VSCode received createButtonSet:", name);
      setTimeout(() => {
        if (!name) {
          window.dispatchEvent(
            new MessageEvent("message", {
              data: {
                data: { error: "setNameRequired", success: false },
                requestId: message.requestId,
                type: "success",
              },
            })
          );
          return;
        }
        const isDuplicate = this.buttonSets.some(
          (s) => s.name.toLowerCase() === name.toLowerCase()
        );
        if (isDuplicate) {
          window.dispatchEvent(
            new MessageEvent("message", {
              data: {
                data: { error: "duplicateSetName", success: false },
                requestId: message.requestId,
                type: "success",
              },
            })
          );
          return;
        }
        const newSet: ButtonSet = {
          buttons: [],
          id: `set-${Date.now()}`,
          name,
        };
        this.buttonSets.push(newSet);
        this.activeSet = name;
        this.sendConfigData(message.requestId);
      }, 100);
    } else if (message.type === MESSAGE_TYPE.DELETE_BUTTON_SET) {
      const data = message.data as { name: string } | undefined;
      const name = data?.name;
      console.log("Mock VSCode received deleteButtonSet:", name);
      setTimeout(() => {
        if (name) {
          this.buttonSets = this.buttonSets.filter((s) => s.name !== name);
          if (this.activeSet === name) {
            this.activeSet = null;
          }
        }
        this.sendConfigData(message.requestId);
      }, 100);
    } else if (message.type === MESSAGE_TYPE.RENAME_BUTTON_SET) {
      const data = message.data as { currentName: string; newName: string } | undefined;
      console.log("Mock VSCode received renameButtonSet:", data);
      setTimeout(() => {
        if (!data?.currentName || !data?.newName) {
          window.dispatchEvent(
            new MessageEvent("message", {
              data: {
                data: { error: "setNameRequired", success: false },
                requestId: message.requestId,
                type: "success",
              },
            })
          );
          return;
        }
        const isDuplicate = this.buttonSets.some(
          (s) =>
            s.name.toLowerCase() === data.newName.toLowerCase() &&
            s.name.toLowerCase() !== data.currentName.toLowerCase()
        );
        if (isDuplicate) {
          window.dispatchEvent(
            new MessageEvent("message", {
              data: {
                data: { error: "duplicateSetName", success: false },
                requestId: message.requestId,
                type: "success",
              },
            })
          );
          return;
        }
        const set = this.buttonSets.find((s) => s.name === data.currentName);
        if (set) {
          set.name = data.newName;
          if (this.activeSet === data.currentName) {
            this.activeSet = data.newName;
          }
        }
        this.sendConfigData(message.requestId);
      }, 100);
    } else if (message.type === MESSAGE_TYPE.SET_ACTIVE_SET) {
      const data = message.data as { setName?: string | null } | undefined;
      const setName = data?.setName ?? null;
      console.log("Mock VSCode received setActiveSet:", setName);
      setTimeout(() => {
        this.activeSet = setName;
        this.sendConfigData(message.requestId);
      }, 100);
    }
  }

  setCurrentData(data: ButtonConfig[]): void {
    this.currentData = [...data];
  }

  private applyMockImport(buttons: ButtonConfigWithOptionalId[], strategy: ImportStrategy): void {
    if (strategy === "replace") {
      this.currentData = buttons.map((btn, idx) => ({
        ...btn,
        id: btn.id ?? `imported-${idx}`,
      })) as ButtonConfig[];
    } else {
      const existingByName = new Map(this.currentData.map((btn) => [btn.name, btn]));
      for (const btn of buttons) {
        existingByName.set(btn.name, {
          ...btn,
          id: btn.id ?? existingByName.get(btn.name)?.id ?? `imported-${Date.now()}`,
        } as ButtonConfig);
      }
      this.currentData = Array.from(existingByName.values());
    }
  }

  private createMockPreview(): ImportPreviewData {
    const existingByName = new Map(this.currentData.map((btn) => [btn.name, btn]));
    const added: ButtonConfigWithOptionalId[] = [];
    const modified: Array<{ existingButton: ButtonConfig; importedButton: ButtonConfig }> = [];
    const unchanged: ButtonConfigWithOptionalId[] = [];

    for (const btn of MOCK_IMPORT_BUTTONS) {
      const existing = existingByName.get(btn.name);
      if (!existing) {
        added.push(btn);
      } else if (existing.command !== btn.command) {
        modified.push({
          existingButton: existing,
          importedButton: { ...btn, id: existing.id } as ButtonConfig,
        });
      } else {
        unchanged.push(btn);
      }
    }

    // Hardcoded mock shortcut conflicts for testing UI
    // "New Import Command" has shortcut "t" which conflicts with existing "$(pass) Test"
    const shortcutConflicts: ShortcutConflict[] = [
      {
        buttons: [
          { id: "mock-existing-1", name: "$(pass) Test", source: "existing" },
          { id: "mock-imported-1", name: "New Import Command", source: "imported" },
        ],
        shortcut: "t",
      },
    ];

    return {
      analysis: { added, modified, shortcutConflicts, unchanged },
      buttons: MOCK_IMPORT_BUTTONS,
      fileUri: "/mock/import/config.json",
      targetScope: this.configurationTarget as ConfigurationTarget,
      timestamp: Date.now(),
    };
  }

  private sendConfigData(requestId?: string): void {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: {
          data: {
            activeSet: this.activeSet,
            buttons: this.currentData,
            buttonSets: this.buttonSets,
            configurationTarget: this.configurationTarget,
          },
          requestId,
          type: "configData",
        },
      })
    );
  }
}

export const vscodeMock = new VSCodeMock();
