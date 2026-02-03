import * as vscode from "vscode";
import { ButtonConfig } from "../../shared/types";
import { FileSystemOperations } from "../adapters";
import { BackupManager } from "./backup-manager";

vi.mock("vscode", () => ({
  Uri: {
    file: vi.fn((path: string) => ({ fsPath: path, path })),
  },
}));

describe("BackupManager", () => {
  let mockFileSystem: vi.Mocked<FileSystemOperations>;
  let mockContext: vi.Mocked<vscode.ExtensionContext>;
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
      createDirectory: vi.fn().mockResolvedValue(undefined),
      exists: vi.fn().mockResolvedValue(false),
      readFile: vi.fn(),
      showOpenDialog: vi.fn(),
      showSaveDialog: vi.fn(),
      stat: vi.fn(),
      writeFile: vi.fn().mockResolvedValue(undefined),
    };

    mockContext = {
      globalStorageUri: {
        fsPath: "/mock/storage/path",
      },
    } as unknown as vi.Mocked<vscode.ExtensionContext>;

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
    });

    it("should strip id fields from backup buttons", async () => {
      mockFileSystem.exists.mockResolvedValue(true);

      const result = await manager.createBackup(sampleButtons, "global");

      expect(result.success).toBe(true);

      const callArgs = mockFileSystem.writeFile.mock.calls[0];
      const content = JSON.parse(callArgs[1] as string);

      content.buttons.forEach((button: unknown) => {
        expect(button).not.toHaveProperty("id");
      });
    });

    it("should strip id fields from nested group buttons in backup", async () => {
      mockFileSystem.exists.mockResolvedValue(true);

      const buttonsWithGroups: ButtonConfig[] = [
        {
          group: [{ command: "child cmd", id: "child-1", name: "Child Command" }],
          id: "parent-1",
          name: "Parent Group",
        },
      ];

      await manager.createBackup(buttonsWithGroups, "workspace");

      const callArgs = mockFileSystem.writeFile.mock.calls[0];
      const content = JSON.parse(callArgs[1] as string);

      expect(content.buttons[0]).not.toHaveProperty("id");
      expect(content.buttons[0].group[0]).not.toHaveProperty("id");
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

    it("should return 'Unknown error' for non-Error exceptions", async () => {
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.writeFile.mockRejectedValue("string error");

      const result = await manager.createBackup(sampleButtons, "global");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unknown error");
    });

    it("should handle empty buttons array", async () => {
      mockFileSystem.exists.mockResolvedValue(true);

      const result = await manager.createBackup([], "local");

      expect(result.success).toBe(true);

      const callArgs = mockFileSystem.writeFile.mock.calls[0];
      const content = JSON.parse(callArgs[1] as string);

      expect(content.buttons).toEqual([]);
      expect(content.version).toBe("1.0");
    });
  });
});
