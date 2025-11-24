import * as vscode from "vscode";
import { ButtonConfig } from "../../shared/types";
import { FileSystemOperations } from "../adapters";
import { BackupManager } from "./backup-manager";

jest.mock("vscode", () => ({
  Uri: {
    file: jest.fn((path: string) => ({ fsPath: path, path })),
  },
}));

describe("BackupManager", () => {
  let mockFileSystem: jest.Mocked<FileSystemOperations>;
  let mockContext: jest.Mocked<vscode.ExtensionContext>;
  let manager: BackupManager;

  const sampleButtons: ButtonConfig[] = [
    {
      command: "npm test",
      id: "btn-1",
      name: "Run Tests",
    },
  ];

  beforeEach(() => {
    mockFileSystem = {
      createDirectory: jest.fn().mockResolvedValue(undefined),
      exists: jest.fn().mockResolvedValue(false),
      readFile: jest.fn(),
      showOpenDialog: jest.fn(),
      showSaveDialog: jest.fn(),
      stat: jest.fn(),
      writeFile: jest.fn().mockResolvedValue(undefined),
    };

    mockContext = {
      globalStorageUri: {
        fsPath: "/mock/storage/path",
      },
    } as unknown as jest.Mocked<vscode.ExtensionContext>;

    manager = BackupManager.create(mockFileSystem, mockContext);
  });

  describe("createBackup", () => {
    it("should create backup directory if it does not exist", async () => {
      mockFileSystem.exists.mockResolvedValue(false);

      await manager.createBackup(sampleButtons, "global");

      expect(mockFileSystem.exists).toHaveBeenCalled();
      expect(mockFileSystem.createDirectory).toHaveBeenCalled();
    });

    it("should not create backup directory if it already exists", async () => {
      mockFileSystem.exists.mockResolvedValue(true);

      await manager.createBackup(sampleButtons, "workspace");

      expect(mockFileSystem.exists).toHaveBeenCalled();
      expect(mockFileSystem.createDirectory).not.toHaveBeenCalled();
    });

    it("should write backup file with correct format", async () => {
      mockFileSystem.exists.mockResolvedValue(true);

      const result = await manager.createBackup(sampleButtons, "local");

      expect(result.success).toBe(true);
      expect(result.backupPath).toBeDefined();

      // Check that writeFile was called
      expect(mockFileSystem.writeFile).toHaveBeenCalledTimes(1);

      // Get the arguments from the first call
      const callArgs = mockFileSystem.writeFile.mock.calls[0];
      expect(callArgs).toBeDefined();
      expect(callArgs.length).toBe(2);

      const [uri, content] = callArgs;
      expect(uri).toBeDefined(); // URI object
      expect(typeof content).toBe("string"); // Content is a string

      expect(content).toContain('"version": "1.0"');
      expect(content).toContain('"configurationTarget": "local"');
    });

    it("should return error when backup creation fails", async () => {
      mockFileSystem.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await manager.createBackup(sampleButtons, "global");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Write failed");
      expect(result.backupPath).toBeUndefined();
    });

    it("should include timestamp in backup filename", async () => {
      mockFileSystem.exists.mockResolvedValue(true);

      const result = await manager.createBackup(sampleButtons, "workspace");

      expect(result.backupPath).toMatch(/backup-workspace-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}/);
    });

    it("should handle directory creation errors", async () => {
      mockFileSystem.exists.mockResolvedValue(false);
      mockFileSystem.createDirectory.mockRejectedValue(new Error("Permission denied"));

      const result = await manager.createBackup(sampleButtons, "global");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Permission denied");
    });
  });
});
