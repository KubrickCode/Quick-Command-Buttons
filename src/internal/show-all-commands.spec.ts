import * as vscode from "vscode";
import { CONFIGURATION_TARGETS } from "../pkg/config-constants";
import { ButtonConfig } from "../pkg/types";
import { ConfigReader, QuickPickCreator, TerminalExecutor } from "./adapters";
import { ButtonSetManager } from "./managers/button-set-manager";
import { ConfigManager } from "./managers/config-manager";
import { createShowAllCommandsCommand } from "./show-all-commands";
import { createQuickPickItems } from "./utils/ui-items";

describe("show-all-commands", () => {
  describe("createShowAllCommandsCommand", () => {
    const createMockConfigReader = (): ConfigReader => ({
      getButtons: vi.fn().mockReturnValue([]),
      getButtonsFromScope: vi.fn().mockReturnValue([]),
      getRawButtonsFromScope: vi.fn().mockReturnValue([]),
      getRefreshConfig: vi
        .fn()
        .mockReturnValue({ color: "#00BCD4", enabled: true, icon: "$(refresh)" }),
      onConfigChange: vi.fn().mockReturnValue({ dispose: vi.fn() }),
      validateButtons: vi.fn().mockReturnValue({ errors: [], hasErrors: false }),
    });

    const createMockTerminalExecutor = (): TerminalExecutor => ({
      executeCommand: vi.fn(),
    });

    const createMockQuickPick = () => ({
      dispose: vi.fn(),
      hide: vi.fn(),
      items: [] as vscode.QuickPickItem[],
      onDidAccept: vi.fn(),
      onDidChangeValue: vi.fn(),
      onDidHide: vi.fn(),
      placeholder: "",
      selectedItems: [] as vscode.QuickPickItem[],
      show: vi.fn(),
      title: "",
      value: "",
    });

    const createMockQuickPickCreator = (): QuickPickCreator => {
      const mockQuickPick = createMockQuickPick();
      const creator = vi.fn().mockReturnValue(mockQuickPick) as unknown as QuickPickCreator;
      return creator;
    };

    const createMockConfigManager = (): ConfigManager => {
      const mockConfigWriter = {
        writeButtons: vi.fn(),
        writeConfigurationTarget: vi.fn(),
      };
      return ConfigManager.create({ configWriter: mockConfigWriter });
    };

    const createMockButtonSetManager = (): ButtonSetManager => {
      const mockConfigManager = createMockConfigManager();
      const mockConfigReader = createMockConfigReader();
      const mockButtonSetWriter = {
        writeActiveSet: vi.fn(),
        writeButtonSets: vi.fn(),
      };
      return ButtonSetManager.create({
        buttonSetWriter: mockButtonSetWriter,
        configManager: mockConfigManager,
        configReader: mockConfigReader,
      });
    };

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("should show info message when no buttons configured", () => {
      const showInfoSpy = vi.spyOn(vscode.window, "showInformationMessage");

      const configReader = createMockConfigReader();
      const terminalExecutor = createMockTerminalExecutor();
      const quickPickCreator = createMockQuickPickCreator();
      const configManager = createMockConfigManager();
      vi.spyOn(configManager, "getButtonsWithFallback").mockReturnValue({
        buttons: [],
        scope: CONFIGURATION_TARGETS.WORKSPACE,
      });
      const buttonSetManager = createMockButtonSetManager();
      vi.spyOn(buttonSetManager, "getButtonsForActiveSet").mockReturnValue(null);

      const command = createShowAllCommandsCommand(
        configReader,
        terminalExecutor,
        quickPickCreator,
        configManager,
        buttonSetManager
      );

      command();

      expect(showInfoSpy).toHaveBeenCalled();
    });

    it("should use buttons from active set when available", () => {
      const activeSetButtons: ButtonConfig[] = [
        { command: "echo active", id: "active-1", name: "Active Button" },
      ];

      const configReader = createMockConfigReader();
      const terminalExecutor = createMockTerminalExecutor();
      const quickPickCreator = createMockQuickPickCreator();
      const configManager = createMockConfigManager();
      const buttonSetManager = createMockButtonSetManager();
      vi.spyOn(buttonSetManager, "getButtonsForActiveSet").mockReturnValue(activeSetButtons);

      const command = createShowAllCommandsCommand(
        configReader,
        terminalExecutor,
        quickPickCreator,
        configManager,
        buttonSetManager
      );

      command();

      expect(buttonSetManager.getButtonsForActiveSet).toHaveBeenCalled();
    });

    it("should fallback to default buttons when no active set", () => {
      const defaultButtons: ButtonConfig[] = [
        { command: "echo default", id: "default-1", name: "Default Button" },
      ];

      const configReader = createMockConfigReader();
      const terminalExecutor = createMockTerminalExecutor();
      const quickPickCreator = createMockQuickPickCreator();
      const configManager = createMockConfigManager();
      vi.spyOn(configManager, "getButtonsWithFallback").mockReturnValue({
        buttons: defaultButtons,
        scope: CONFIGURATION_TARGETS.WORKSPACE,
      });
      const buttonSetManager = createMockButtonSetManager();
      vi.spyOn(buttonSetManager, "getButtonsForActiveSet").mockReturnValue(null);

      const command = createShowAllCommandsCommand(
        configReader,
        terminalExecutor,
        quickPickCreator,
        configManager,
        buttonSetManager
      );

      command();

      expect(configManager.getButtonsWithFallback).toHaveBeenCalledWith(configReader);
    });
  });
  describe("createQuickPickItems with includeCommandCount", () => {
    it("should create QuickPickItems with shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          command: "echo test1",
          id: "test-cmd-1",
          name: "Test Command 1",
          shortcut: "1",
        },
        {
          command: "echo test2",
          id: "test-cmd-2",
          name: "Test Command 2",
          shortcut: "2",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "echo test1",
        label: "Test Command 1 (1)",
      });
      expect(result[1]).toEqual({
        command: buttons[1],
        description: "echo test2",
        label: "Test Command 2 (2)",
      });
    });

    it("should create QuickPickItems without shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          command: "echo test1",
          id: "test-cmd-1",
          name: "Test Command 1",
        },
        {
          command: "echo test2",
          id: "test-cmd-2",
          name: "Test Command 2",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "echo test1",
        label: "Test Command 1",
      });
      expect(result[1]).toEqual({
        command: buttons[1],
        description: "echo test2",
        label: "Test Command 2",
      });
    });

    it("should handle group buttons", () => {
      const buttons: ButtonConfig[] = [
        {
          group: [
            {
              command: "echo nested1",
              id: "nested-cmd-1",
              name: "Nested Command 1",
            },
            {
              command: "echo nested2",
              id: "nested-cmd-2",
              name: "Nested Command 2",
            },
          ],
          id: "test-group",
          name: "Test Group",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "2 commands",
        label: "Test Group",
      });
    });

    it("should handle group buttons with shortcuts", () => {
      const buttons: ButtonConfig[] = [
        {
          group: [
            {
              command: "echo nested",
              id: "nested-cmd",
              name: "Nested Command",
            },
          ],
          id: "test-group",
          name: "Test Group",
          shortcut: "g",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "1 commands",
        label: "Test Group (g)",
      });
    });

    it("should handle buttons with no command (invalid config scenario)", () => {
      // Testing invalid configuration scenario
      const buttons = [
        {
          id: "test-btn",
          name: "Test Button",
        },
      ] as unknown as ButtonConfig[];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "",
        label: "Test Button",
      });
    });

    it("should handle empty array", () => {
      const buttons: ButtonConfig[] = [];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should preserve object references", () => {
      const buttons: ButtonConfig[] = [
        {
          command: "echo test",
          id: "test-preserve",
          name: "Test Command",
        },
      ];

      const result = createQuickPickItems(buttons, true);

      expect(result[0].command).toBe(buttons[0]);
    });

    it("should handle mixed configurations", () => {
      // Testing mixed valid/invalid configurations
      const buttons = [
        {
          command: "echo command",
          id: "cmd-btn",
          name: "Command Button",
          shortcut: "c",
        },
        {
          group: [
            {
              command: "echo nested",
              id: "nested-cmd",
              name: "Nested",
            },
          ],
          id: "group-btn",
          name: "Group Button",
        },
        {
          id: "empty-btn",
          name: "Empty Button",
        },
      ] as unknown as ButtonConfig[];

      const result = createQuickPickItems(buttons, true);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        command: buttons[0],
        description: "echo command",
        label: "Command Button (c)",
      });
      expect(result[1]).toEqual({
        command: buttons[1],
        description: "1 commands",
        label: "Group Button",
      });
      expect(result[2]).toEqual({
        command: buttons[2],
        description: "",
        label: "Empty Button",
      });
    });
  });
});
