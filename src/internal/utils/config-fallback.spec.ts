import * as vscode from "vscode";
import { CONFIGURATION_TARGETS } from "../../pkg/config-constants";
import { ButtonConfig } from "../../shared/types";
import { resolveButtonsWithFallback } from "./config-fallback";

const createMockConfigReader = (
  workspaceButtons: ButtonConfig[],
  globalButtons: ButtonConfig[]
) => ({
  getButtonsFromScope: vi.fn((target: vscode.ConfigurationTarget) => {
    if (target === vscode.ConfigurationTarget.Workspace) {
      return workspaceButtons;
    }
    return globalButtons;
  }),
});

const createMockLocalStorage = (buttons: ButtonConfig[]) => ({
  getButtons: vi.fn(() => buttons),
});

const sampleButton: ButtonConfig = {
  command: "echo test",
  id: "test-id",
  name: "Test Button",
};

describe("resolveButtonsWithFallback", () => {
  describe("LOCAL scope", () => {
    it("should return LOCAL buttons when localStorage has buttons", () => {
      const localButtons = [{ ...sampleButton, name: "Local Button" }];
      const configReader = createMockConfigReader([], []);
      const localStorage = createMockLocalStorage(localButtons);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.LOCAL,
        localStorage,
      });

      expect(result.buttons).toEqual(localButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.LOCAL);
      expect(localStorage.getButtons).toHaveBeenCalled();
    });

    it("should fallback to WORKSPACE when localStorage is empty", () => {
      const workspaceButtons = [{ ...sampleButton, name: "Workspace Button" }];
      const configReader = createMockConfigReader(workspaceButtons, []);
      const localStorage = createMockLocalStorage([]);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.LOCAL,
        localStorage,
      });

      expect(result.buttons).toEqual(workspaceButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.WORKSPACE);
    });

    it("should fallback to GLOBAL when localStorage and workspace are empty", () => {
      const globalButtons = [{ ...sampleButton, name: "Global Button" }];
      const configReader = createMockConfigReader([], globalButtons);
      const localStorage = createMockLocalStorage([]);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.LOCAL,
        localStorage,
      });

      expect(result.buttons).toEqual(globalButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.GLOBAL);
    });

    it("should fallback to WORKSPACE when localStorage is undefined", () => {
      const workspaceButtons = [{ ...sampleButton, name: "Workspace Button" }];
      const configReader = createMockConfigReader(workspaceButtons, []);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.LOCAL,
        localStorage: undefined,
      });

      expect(result.buttons).toEqual(workspaceButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.WORKSPACE);
    });
  });

  describe("WORKSPACE scope", () => {
    it("should return WORKSPACE buttons when workspace has buttons", () => {
      const workspaceButtons = [{ ...sampleButton, name: "Workspace Button" }];
      const configReader = createMockConfigReader(workspaceButtons, []);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.WORKSPACE,
      });

      expect(result.buttons).toEqual(workspaceButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.WORKSPACE);
    });

    it("should fallback to GLOBAL when workspace is empty", () => {
      const globalButtons = [{ ...sampleButton, name: "Global Button" }];
      const configReader = createMockConfigReader([], globalButtons);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.WORKSPACE,
      });

      expect(result.buttons).toEqual(globalButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.GLOBAL);
    });

    it("should not check localStorage even if provided", () => {
      const localButtons = [{ ...sampleButton, name: "Local Button" }];
      const workspaceButtons = [{ ...sampleButton, name: "Workspace Button" }];
      const configReader = createMockConfigReader(workspaceButtons, []);
      const localStorage = createMockLocalStorage(localButtons);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.WORKSPACE,
        localStorage,
      });

      expect(result.buttons).toEqual(workspaceButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.WORKSPACE);
      expect(localStorage.getButtons).not.toHaveBeenCalled();
    });
  });

  describe("GLOBAL scope", () => {
    it("should always return GLOBAL buttons", () => {
      const globalButtons = [{ ...sampleButton, name: "Global Button" }];
      const workspaceButtons = [{ ...sampleButton, name: "Workspace Button" }];
      const configReader = createMockConfigReader(workspaceButtons, globalButtons);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.GLOBAL,
      });

      expect(result.buttons).toEqual(globalButtons);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.GLOBAL);
    });

    it("should return empty array when GLOBAL has no buttons", () => {
      const configReader = createMockConfigReader([], []);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.GLOBAL,
      });

      expect(result.buttons).toEqual([]);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.GLOBAL);
    });

    it("should not check localStorage or workspace", () => {
      const localButtons = [{ ...sampleButton, name: "Local Button" }];
      const workspaceButtons = [{ ...sampleButton, name: "Workspace Button" }];
      const configReader = createMockConfigReader(workspaceButtons, []);
      const localStorage = createMockLocalStorage(localButtons);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.GLOBAL,
        localStorage,
      });

      expect(result.buttons).toEqual([]);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.GLOBAL);
      expect(localStorage.getButtons).not.toHaveBeenCalled();
      expect(configReader.getButtonsFromScope).toHaveBeenCalledTimes(1);
      expect(configReader.getButtonsFromScope).toHaveBeenCalledWith(
        vscode.ConfigurationTarget.Global
      );
    });
  });

  describe("edge cases", () => {
    it("should return empty GLOBAL when all scopes are empty", () => {
      const configReader = createMockConfigReader([], []);
      const localStorage = createMockLocalStorage([]);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.LOCAL,
        localStorage,
      });

      expect(result.buttons).toEqual([]);
      expect(result.scope).toBe(CONFIGURATION_TARGETS.GLOBAL);
    });

    it("should handle multiple buttons in returned scope", () => {
      const localButtons = [
        { ...sampleButton, id: "1", name: "Button 1" },
        { ...sampleButton, id: "2", name: "Button 2" },
        { ...sampleButton, id: "3", name: "Button 3" },
      ];
      const configReader = createMockConfigReader([], []);
      const localStorage = createMockLocalStorage(localButtons);

      const result = resolveButtonsWithFallback({
        configReader,
        currentTarget: CONFIGURATION_TARGETS.LOCAL,
        localStorage,
      });

      expect(result.buttons).toHaveLength(3);
      expect(result.buttons).toEqual(localButtons);
    });
  });
});
