import * as vscode from "vscode";
import { ButtonConfig, ExportFormat } from "../../shared/types";
import { ConfigReader, ConfigWriter, FileSystemOperations, ProjectLocalStorage } from "../adapters";
import { ConfigManager } from "./config-manager";
import { ImportExportManager } from "./import-export-manager";

const EXPIRED_PREVIEW_OFFSET_MS = 6 * 60 * 1000;

jest.mock("vscode", () => ({
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
  },
  Uri: {
    file: jest.fn((path: string) => ({ fsPath: path, path })),
    joinPath: jest.fn((uri: any, ...paths: string[]) => ({
      fsPath: `${uri.fsPath}/${paths.join("/")}`,
      path: `${uri.path}/${paths.join("/")}`,
    })),
  },
  workspace: {
    getConfiguration: jest.fn(),
  },
}));

describe("ImportExportManager", () => {
  let mockFileSystem: jest.Mocked<FileSystemOperations>;
  let mockConfigReader: jest.Mocked<ConfigReader>;
  let mockConfigWriter: jest.Mocked<ConfigWriter>;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockLocalStorage: jest.Mocked<ProjectLocalStorage>;
  let mockContext: jest.Mocked<vscode.ExtensionContext>;
  let manager: ImportExportManager;

  const sampleButtons: ButtonConfig[] = [
    {
      command: "npm test",
      id: "btn-1",
      name: "Run Tests",
      shortcut: "t",
    },
    {
      command: "npm build",
      id: "btn-2",
      name: "Build",
    },
  ];

  beforeEach(() => {
    mockFileSystem = {
      createDirectory: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(true),
      readFile: jest.fn(),
      showOpenDialog: jest.fn(),
      showSaveDialog: jest.fn(),
      stat: jest.fn().mockResolvedValue({ size: 1024 }),
      writeFile: jest.fn(),
    };

    mockConfigReader = {
      getButtons: jest.fn().mockReturnValue(sampleButtons),
      getButtonsFromScope: jest.fn(),
      getRawButtonsFromScope: jest.fn().mockReturnValue([]),
      getRefreshConfig: jest.fn(),
      onConfigChange: jest.fn(),
      validateButtons: jest.fn().mockReturnValue({ errors: [], hasErrors: false }),
    };

    mockConfigWriter = {
      writeButtons: jest.fn().mockResolvedValue(undefined),
      writeConfigurationTarget: jest.fn().mockResolvedValue(undefined),
    };

    mockLocalStorage = {
      getButtons: jest.fn().mockReturnValue([]),
      setButtons: jest.fn().mockResolvedValue(undefined),
    };

    mockConfigManager = {
      getButtonsForTarget: jest.fn().mockReturnValue(sampleButtons),
      getConfigDataForWebview: jest.fn(),
      getCurrentConfigurationTarget: jest.fn().mockReturnValue("global"),
      updateButtonConfiguration: jest.fn(),
      updateConfigurationTarget: jest.fn(),
    } as unknown as jest.Mocked<ConfigManager>;

    mockContext = {
      globalStorageUri: {
        fsPath: "/mock/storage/path",
      },
    } as unknown as jest.Mocked<vscode.ExtensionContext>;

    const mockConfig = {
      inspect: jest.fn().mockReturnValue({
        globalValue: sampleButtons,
        workspaceValue: [],
      }),
    };
    (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

    manager = ImportExportManager.create(
      mockFileSystem,
      mockConfigReader,
      mockConfigWriter,
      mockConfigManager,
      mockLocalStorage,
      mockContext
    );
  });

  describe("exportConfiguration", () => {
    it("should export configuration to selected file", async () => {
      const mockUri = { fsPath: "/export/config.json" } as vscode.Uri;
      mockFileSystem.showSaveDialog.mockResolvedValue(mockUri);

      const result = await manager.exportConfiguration("global");

      expect(result.success).toBe(true);
      expect(result.filePath).toBe("/export/config.json");
      expect(mockFileSystem.showSaveDialog).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: { JSON: ["json"] },
          saveLabel: "Export Configuration",
          title: "Export Quick Command Buttons (global)",
        })
      );

      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        mockUri,
        expect.stringContaining('"version": "1.0"')
      );

      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        mockUri,
        expect.stringContaining('"configurationTarget": "global"')
      );
    });

    it("should return failure if user cancels save dialog", async () => {
      mockFileSystem.showSaveDialog.mockResolvedValue(undefined);

      const result = await manager.exportConfiguration("workspace");

      expect(result.success).toBe(false);
      expect(mockFileSystem.writeFile).not.toHaveBeenCalled();
    });

    it("should export buttons from local storage when target is local", async () => {
      const localButtons: ButtonConfig[] = [
        { command: "local cmd", id: "local-1", name: "Local Command" },
      ];
      mockLocalStorage.getButtons.mockReturnValue(localButtons);
      mockConfigManager.getButtonsForTarget.mockReturnValue(localButtons);

      const mockUri = { fsPath: "/export/local.json" } as vscode.Uri;
      mockFileSystem.showSaveDialog.mockResolvedValue(mockUri);

      const result = await manager.exportConfiguration("local");

      const writeCall = mockFileSystem.writeFile.mock.calls[0];
      const exportedData = JSON.parse(writeCall[1] as string) as ExportFormat;

      expect(result.success).toBe(true);
      expect(exportedData.buttons).toEqual([{ command: "local cmd", name: "Local Command" }]);
      expect(exportedData.configurationTarget).toBe("local");
    });

    it("should strip id fields from exported buttons", async () => {
      const mockUri = { fsPath: "/export/config.json" } as vscode.Uri;
      mockFileSystem.showSaveDialog.mockResolvedValue(mockUri);

      const result = await manager.exportConfiguration("global");

      expect(result.success).toBe(true);

      const writeCall = mockFileSystem.writeFile.mock.calls[0];
      const exportedData = JSON.parse(writeCall[1] as string) as ExportFormat;

      exportedData.buttons.forEach((button) => {
        expect(button).not.toHaveProperty("id");
      });
    });

    it("should strip id fields from nested group buttons", async () => {
      const buttonsWithGroups: ButtonConfig[] = [
        {
          group: [{ command: "child cmd", id: "child-1", name: "Child Command" }],
          id: "parent-1",
          name: "Parent Group",
        },
      ];
      mockConfigManager.getButtonsForTarget.mockReturnValue(buttonsWithGroups);

      const mockUri = { fsPath: "/export/config.json" } as vscode.Uri;
      mockFileSystem.showSaveDialog.mockResolvedValue(mockUri);

      await manager.exportConfiguration("global");

      const writeCall = mockFileSystem.writeFile.mock.calls[0];
      const exportedData = JSON.parse(writeCall[1] as string) as ExportFormat;

      expect(exportedData.buttons[0]).not.toHaveProperty("id");
      expect(exportedData.buttons[0].group![0]).not.toHaveProperty("id");
    });

    it("should include exportedAt timestamp in ISO format", async () => {
      const mockUri = { fsPath: "/export/config.json" } as vscode.Uri;
      mockFileSystem.showSaveDialog.mockResolvedValue(mockUri);

      const beforeExport = new Date().toISOString();
      await manager.exportConfiguration("global");
      const afterExport = new Date().toISOString();

      const writeCall = mockFileSystem.writeFile.mock.calls[0];
      const exportedData = JSON.parse(writeCall[1] as string) as ExportFormat;

      expect(exportedData.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(exportedData.exportedAt >= beforeExport).toBe(true);
      expect(exportedData.exportedAt <= afterExport).toBe(true);
    });

    it("should return error on file write failure", async () => {
      const mockUri = { fsPath: "/export/config.json" } as vscode.Uri;
      mockFileSystem.showSaveDialog.mockResolvedValue(mockUri);
      mockFileSystem.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await manager.exportConfiguration("global");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Write failed");
    });
  });

  describe("importConfiguration", () => {
    const validExportData: ExportFormat = {
      buttons: sampleButtons,
      configurationTarget: "global",
      exportedAt: "2025-11-24T00:00:00.000Z",
      version: "1.0",
    };

    it("should import configuration with merge strategy", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "existing", id: "btn-existing", name: "Existing" },
      ];

      const mockConfig = {
        inspect: jest.fn().mockReturnValue({
          globalValue: [],
          workspaceValue: existingButtons,
        }),
      };
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(validExportData));

      const result = await manager.importConfiguration("workspace", undefined, "merge");

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
      expect(mockConfigWriter.writeButtons).toHaveBeenCalled();
    });

    it("should import configuration with replace strategy", async () => {
      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(validExportData));

      const result = await manager.importConfiguration("workspace", undefined, "replace");

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);

      const writeCall = mockConfigWriter.writeButtons.mock.calls[0];
      expect(writeCall[0]).toEqual(sampleButtons);
    });

    it("should not import if user cancels file selection", async () => {
      mockFileSystem.showOpenDialog.mockResolvedValue(undefined);

      const result = await manager.importConfiguration("workspace");

      expect(result.success).toBe(false);
      expect(result.importedCount).toBe(0);
      expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
    });

    it("should reject invalid JSON", async () => {
      const mockUri = { fsPath: "/import/invalid.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue("invalid json{");

      const result = await manager.importConfiguration("workspace");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid JSON format");
    });

    it("should reject invalid export format", async () => {
      const invalidData = {
        buttons: "not an array",
        version: "1.0",
      };

      const mockUri = { fsPath: "/import/invalid.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(invalidData));

      const result = await manager.importConfiguration("workspace");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject files larger than 10MB", async () => {
      const mockUri = { fsPath: "/import/huge.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.stat.mockResolvedValue({ size: 11 * 1024 * 1024 });

      const result = await manager.importConfiguration("workspace");

      expect(result.success).toBe(false);
      expect(result.error).toContain("File too large");
    });

    it("should import to local storage when target is local", async () => {
      const localExportData: ExportFormat = {
        ...validExportData,
        configurationTarget: "local",
      };

      const mockUri = { fsPath: "/import/local.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(localExportData));
      mockLocalStorage.getButtons.mockReturnValue([]);

      const result = await manager.importConfiguration("local", undefined, "replace");

      expect(result.success).toBe(true);
      expect(mockLocalStorage.setButtons).toHaveBeenCalledWith(sampleButtons);
      expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
    });

    it("should use provided URI instead of showing dialog", async () => {
      const providedUri = { fsPath: "/provided/config.json" } as vscode.Uri;
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(validExportData));

      await manager.importConfiguration("workspace", providedUri, "merge");

      expect(mockFileSystem.showOpenDialog).not.toHaveBeenCalled();
      expect(mockFileSystem.readFile).toHaveBeenCalledWith(providedUri);
    });

    it("should cancel import if backup creation fails", async () => {
      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(validExportData));
      mockFileSystem.writeFile.mockRejectedValue(new Error("Backup failed"));

      const result = await manager.importConfiguration("workspace");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Failed to create backup");
      expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
    });
  });

  describe("validateImportData", () => {
    it("should validate correct export format", () => {
      const validData: ExportFormat = {
        buttons: sampleButtons,
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const result = manager.validateImportData(JSON.stringify(validData));

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it("should reject invalid JSON", () => {
      const result = manager.validateImportData("invalid json{");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid JSON format");
    });

    it("should reject missing required fields", () => {
      const invalidData = {
        buttons: [],
        version: "1.0",
      };

      const result = manager.validateImportData(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.error).toContain("configurationTarget");
    });

    it("should reject invalid button structure", () => {
      const invalidData = {
        buttons: [{ name: "Test" }],
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const result = manager.validateImportData(JSON.stringify(invalidData));

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should accept buttons with group property", () => {
      const dataWithGroup: ExportFormat = {
        buttons: [
          {
            group: [
              { command: "cmd1", id: "sub-1", name: "Sub Command 1" },
              { command: "cmd2", id: "sub-2", name: "Sub Command 2" },
            ],
            id: "group-1",
            name: "Command Group",
          },
        ],
        configurationTarget: "workspace",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const result = manager.validateImportData(JSON.stringify(dataWithGroup));

      expect(result.success).toBe(true);
      expect(result.data?.buttons[0].group).toHaveLength(2);
    });
  });

  describe("detectConflicts", () => {
    it("should detect conflicts when buttons with same name differ", () => {
      const existingButtons: ButtonConfig[] = [
        { command: "old command", id: "btn-1", name: "Test Button" },
      ];

      const importedButtons: ButtonConfig[] = [
        { command: "new command", id: "btn-2", name: "Test Button" },
      ];

      const conflicts = manager.detectConflicts(existingButtons, importedButtons);

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].existingButton.command).toBe("old command");
      expect(conflicts[0].importedButton.command).toBe("new command");
    });

    it("should not detect conflicts for identical buttons with same name", () => {
      const existingButtons: ButtonConfig[] = [
        { command: "same command", id: "btn-1", name: "Same Name" },
      ];

      const importedButtons: ButtonConfig[] = [
        { command: "same command", id: "btn-2", name: "Same Name" },
      ];

      const conflicts = manager.detectConflicts(existingButtons, importedButtons);

      expect(conflicts).toHaveLength(0);
    });

    it("should not detect conflicts for buttons with different names", () => {
      const existingButtons: ButtonConfig[] = [
        { command: "existing", id: "btn-1", name: "Existing" },
      ];

      const importedButtons: ButtonConfig[] = [{ command: "new", id: "btn-2", name: "New Button" }];

      const conflicts = manager.detectConflicts(existingButtons, importedButtons);

      expect(conflicts).toHaveLength(0);
    });

    it("should detect multiple conflicts based on name", () => {
      const existingButtons: ButtonConfig[] = [
        { command: "cmd1-old", id: "btn-1", name: "Button 1" },
        { command: "cmd2-old", id: "btn-2", name: "Button 2" },
        { command: "cmd3", id: "btn-3", name: "Button 3" },
      ];

      const importedButtons: ButtonConfig[] = [
        { command: "cmd1-new", id: "btn-4", name: "Button 1" },
        { command: "cmd2-new", id: "btn-5", name: "Button 2" },
        { command: "cmd3", id: "btn-6", name: "Button 3" },
      ];

      const conflicts = manager.detectConflicts(existingButtons, importedButtons);

      expect(conflicts).toHaveLength(2);
      expect(conflicts[0].existingButton.name).toBe("Button 1");
      expect(conflicts[1].existingButton.name).toBe("Button 2");
    });
  });

  describe("merge strategy", () => {
    it("should keep existing buttons not in import", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "existing-1", id: "btn-1", name: "Existing 1" },
        { command: "existing-2", id: "btn-2", name: "Existing 2" },
      ];

      const importedButtons: ButtonConfig[] = [
        { command: "imported-1", id: "btn-3", name: "Imported 1" },
      ];

      const exportData: ExportFormat = {
        buttons: importedButtons,
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockConfig = {
        inspect: jest.fn().mockReturnValue({
          globalValue: existingButtons,
          workspaceValue: [],
        }),
      };
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);
      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      await manager.importConfiguration("global", undefined, "merge");

      const writeCall = mockConfigWriter.writeButtons.mock.calls[0];
      const mergedButtons = writeCall[0] as ButtonConfig[];

      expect(mergedButtons).toHaveLength(3);
      expect(mergedButtons.find((b) => b.name === "Existing 1")).toBeDefined();
      expect(mergedButtons.find((b) => b.name === "Existing 2")).toBeDefined();
      expect(mergedButtons.find((b) => b.name === "Imported 1")).toBeDefined();
    });

    it("should replace conflicting buttons with same name using imported data", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "old command", id: "btn-1", name: "Same Name" },
      ];

      const importedButtons: ButtonConfig[] = [
        { command: "new command", id: "btn-2", name: "Same Name" },
      ];

      const exportData: ExportFormat = {
        buttons: importedButtons,
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockConfig = {
        inspect: jest.fn().mockReturnValue({
          globalValue: existingButtons,
          workspaceValue: [],
        }),
      };
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);
      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      await manager.importConfiguration("global", undefined, "merge");

      const writeCall = mockConfigWriter.writeButtons.mock.calls[0];
      const mergedButtons = writeCall[0] as ButtonConfig[];

      expect(mergedButtons).toHaveLength(1);
      expect(mergedButtons[0].command).toBe("new command");
      expect(mergedButtons[0].name).toBe("Same Name");
    });

    it("should report number of conflicts resolved", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "old-1", id: "btn-1", name: "Button 1" },
        { command: "old-2", id: "btn-2", name: "Button 2" },
      ];

      const importedButtons: ButtonConfig[] = [
        { command: "new-1", id: "btn-3", name: "Button 1" },
        { command: "new-2", id: "btn-4", name: "Button 2" },
      ];

      const exportData: ExportFormat = {
        buttons: importedButtons,
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockConfig = {
        inspect: jest.fn().mockReturnValue({
          globalValue: existingButtons,
          workspaceValue: [],
        }),
      };
      (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue(mockConfig);
      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      const result = await manager.importConfiguration("global", undefined, "merge");

      expect(result.conflictsResolved).toBe(2);
    });
  });

  describe("previewImport", () => {
    const validExportData: ExportFormat = {
      buttons: sampleButtons,
      configurationTarget: "global",
      exportedAt: "2025-11-24T00:00:00.000Z",
      version: "1.0",
    };

    it("should return preview data with analysis", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "existing", id: "btn-existing", name: "Existing" },
      ];

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(validExportData));

      const result = await manager.previewImport("global");

      expect(result.success).toBe(true);
      expect(result.preview).toBeDefined();
      expect(result.preview?.fileUri).toBe("/import/config.json");
      expect(result.preview?.sourceTarget).toBe("global");
      expect(result.preview?.timestamp).toBeGreaterThan(0);
    });

    it("should analyze added commands", async () => {
      mockConfigManager.getButtonsForTarget.mockReturnValue([]);

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(validExportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.added).toHaveLength(2);
      expect(result.preview?.analysis.modified).toHaveLength(0);
      expect(result.preview?.analysis.unchanged).toHaveLength(0);
    });

    it("should analyze modified commands", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "old command", id: "btn-1", name: "Run Tests" },
      ];

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(validExportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.added).toHaveLength(1);
      expect(result.preview?.analysis.modified).toHaveLength(1);
      expect(result.preview?.analysis.modified[0].existingButton.command).toBe("old command");
      expect(result.preview?.analysis.modified[0].importedButton.command).toBe("npm test");
    });

    it("should analyze unchanged commands", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "npm test", id: "btn-1", name: "Run Tests", shortcut: "t" },
      ];

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const exportData: ExportFormat = {
        buttons: [{ command: "npm test", name: "Run Tests", shortcut: "t" }],
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.added).toHaveLength(0);
      expect(result.preview?.analysis.modified).toHaveLength(0);
      expect(result.preview?.analysis.unchanged).toHaveLength(1);
    });

    it("should detect shortcut conflicts between existing and imported buttons", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "npm test", id: "btn-1", name: "Test", shortcut: "t" },
      ];

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const exportData: ExportFormat = {
        buttons: [{ command: "npm run build", name: "Build", shortcut: "t" }],
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.shortcutConflicts).toHaveLength(1);
      expect(result.preview?.analysis.shortcutConflicts[0].shortcut).toBe("t");
      expect(result.preview?.analysis.shortcutConflicts[0].buttons).toHaveLength(2);
    });

    it("should detect shortcut conflicts within imported buttons", async () => {
      mockConfigManager.getButtonsForTarget.mockReturnValue([]);

      const exportData: ExportFormat = {
        buttons: [
          { command: "npm test", name: "Test", shortcut: "t" },
          { command: "npm run build", name: "Build", shortcut: "t" },
        ],
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.shortcutConflicts).toHaveLength(1);
      expect(result.preview?.analysis.shortcutConflicts[0].shortcut).toBe("t");
      expect(result.preview?.analysis.shortcutConflicts[0].buttons).toHaveLength(2);
      expect(
        result.preview?.analysis.shortcutConflicts[0].buttons.every((b) => b.source === "imported")
      ).toBe(true);
    });

    it("should not report shortcut conflict for same button (unchanged)", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "npm test", id: "btn-1", name: "Test", shortcut: "t" },
      ];

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const exportData: ExportFormat = {
        buttons: [{ command: "npm test", name: "Test", shortcut: "t" }],
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.shortcutConflicts).toHaveLength(0);
      expect(result.preview?.analysis.unchanged).toHaveLength(1);
    });

    it("should detect shortcut conflicts in nested groups", async () => {
      // Existing: Group with "Nested Test" (shortcut: "n") inside
      const existingButtons: ButtonConfig[] = [
        {
          group: [{ command: "npm test", id: "btn-nested", name: "Nested Test", shortcut: "n" }],
          id: "btn-group",
          name: "Group",
        },
      ];

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      // Imported: Same group with different button having same shortcut "n"
      // This should conflict because they're at the same level (inside "Group")
      const exportData: ExportFormat = {
        buttons: [
          {
            group: [{ command: "npm run new", name: "New Nested", shortcut: "n" }],
            name: "Group",
          },
        ],
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.shortcutConflicts).toHaveLength(1);
      expect(result.preview?.analysis.shortcutConflicts[0].shortcut).toBe("n");
    });

    it("should not detect conflict between root level and nested group shortcuts", async () => {
      // Existing: Group with "Nested Test" (shortcut: "n") inside
      const existingButtons: ButtonConfig[] = [
        {
          group: [{ command: "npm test", id: "btn-nested", name: "Nested Test", shortcut: "n" }],
          id: "btn-group",
          name: "Group",
        },
      ];

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      // Imported: Root level button with same shortcut "n"
      // This should NOT conflict because they're at different levels
      const exportData: ExportFormat = {
        buttons: [{ command: "npm run new", name: "New Command", shortcut: "n" }],
        configurationTarget: "global",
        exportedAt: "2025-11-24T00:00:00.000Z",
        version: "1.0",
      };

      const mockUri = { fsPath: "/import/config.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue(JSON.stringify(exportData));

      const result = await manager.previewImport("global");

      expect(result.preview?.analysis.shortcutConflicts).toHaveLength(0);
    });

    it("should return failure if user cancels file selection", async () => {
      mockFileSystem.showOpenDialog.mockResolvedValue(undefined);

      const result = await manager.previewImport("global");

      expect(result.success).toBe(false);
      expect(result.preview).toBeUndefined();
    });

    it("should return error for invalid file", async () => {
      const mockUri = { fsPath: "/import/invalid.json" } as vscode.Uri;
      mockFileSystem.showOpenDialog.mockResolvedValue([mockUri]);
      mockFileSystem.readFile.mockResolvedValue("invalid json{");

      const result = await manager.previewImport("global");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid JSON format");
    });
  });

  describe("confirmImport", () => {
    it("should import confirmed preview data", async () => {
      const preview = {
        analysis: { added: [], modified: [], shortcutConflicts: [], unchanged: [] },
        buttons: sampleButtons,
        fileUri: "/import/config.json",
        sourceTarget: "global" as const,
        timestamp: Date.now(),
      };

      mockConfigManager.getButtonsForTarget.mockReturnValue([]);

      const result = await manager.confirmImport(preview, "global", "merge");

      expect(result.success).toBe(true);
      expect(result.importedCount).toBe(2);
      expect(mockConfigWriter.writeButtons).toHaveBeenCalled();
    });

    it("should reject expired preview", async () => {
      const expiredPreview = {
        analysis: { added: [], modified: [], shortcutConflicts: [], unchanged: [] },
        buttons: sampleButtons,
        fileUri: "/import/config.json",
        sourceTarget: "global" as const,
        timestamp: Date.now() - EXPIRED_PREVIEW_OFFSET_MS,
      };

      const result = await manager.confirmImport(expiredPreview, "global", "merge");

      expect(result.success).toBe(false);
      expect(result.error).toContain("expired");
      expect(mockConfigWriter.writeButtons).not.toHaveBeenCalled();
    });

    it("should use replace strategy when specified", async () => {
      const existingButtons: ButtonConfig[] = [
        { command: "existing", id: "btn-existing", name: "Existing" },
      ];

      const preview = {
        analysis: { added: [], modified: [], shortcutConflicts: [], unchanged: [] },
        buttons: sampleButtons,
        fileUri: "/import/config.json",
        sourceTarget: "global" as const,
        timestamp: Date.now(),
      };

      mockConfigManager.getButtonsForTarget.mockReturnValue(existingButtons);

      const result = await manager.confirmImport(preview, "global", "replace");

      expect(result.success).toBe(true);

      const writeCall = mockConfigWriter.writeButtons.mock.calls[0];
      expect(writeCall[0]).toEqual(sampleButtons);
    });

    it("should create backup before import", async () => {
      const preview = {
        analysis: { added: [], modified: [], shortcutConflicts: [], unchanged: [] },
        buttons: sampleButtons,
        fileUri: "/import/config.json",
        sourceTarget: "global" as const,
        timestamp: Date.now(),
      };

      mockConfigManager.getButtonsForTarget.mockReturnValue([]);

      const result = await manager.confirmImport(preview, "global", "merge");

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();
      expect(mockFileSystem.writeFile).toHaveBeenCalled();
    });
  });
});
